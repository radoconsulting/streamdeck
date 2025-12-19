/**
 * Loxone Configuration Web Server
 * Provides a web interface for browsing and selecting Loxone controls
 */

import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import WebSocket from 'ws';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3456;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// Store active Loxone connections
const connections = new Map();

/**
 * Connect to Loxone Miniserver and fetch structure using HTTP
 */
async function fetchLoxoneStructureHTTP(host, username, password) {
    return new Promise((resolve, reject) => {
        const auth = Buffer.from(`${username}:${password}`).toString('base64');
        const options = {
            hostname: host,
            port: 80,
            path: '/data/LoxAPP3.json',
            method: 'GET',
            headers: {
                'Authorization': `Basic ${auth}`
            },
            timeout: 10000
        };

        console.log(`Attempting HTTP connection to ${host}`);

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        const structure = JSON.parse(data);
                        console.log('Successfully fetched structure file');
                        resolve(structure);
                    } catch (error) {
                        console.error('Error parsing structure:', error);
                        reject(new Error('Invalid JSON in structure file'));
                    }
                } else if (res.statusCode === 401) {
                    console.error('Authentication failed - 401');
                    reject(new Error('Authentication failed. Check your username and password.'));
                } else {
                    console.error(`HTTP error: ${res.statusCode}`);
                    reject(new Error(`HTTP error: ${res.statusCode}`));
                }
            });
        });

        req.on('error', (error) => {
            console.error('Connection error:', error.message);
            reject(new Error(`Connection failed: ${error.message}`));
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Connection timeout'));
        });

        req.end();
    });
}

/**
 * Parse and organize Loxone structure file
 */
function organizeControls(structureData) {
    const controls = [];

    // Debug: log structure keys
    console.log('Structure file keys:', Object.keys(structureData));

    // Try different possible locations for controls
    let controlsObj = null;

    if (structureData.controls) {
        controlsObj = structureData.controls;
    } else if (structureData.globalStates) {
        controlsObj = structureData.globalStates;
    } else if (structureData.rooms) {
        // Maybe controls are nested in rooms
        console.log('Trying to extract from rooms...');
    }

    if (!controlsObj) {
        console.log('Could not find controls in structure. Available keys:', Object.keys(structureData));
        return { byRoom: {}, byCategory: {}, byType: {}, all: [] };
    }

    console.log(`Found ${Object.keys(controlsObj).length} total controls`);

    // Log first few control types to help debug
    const controlTypes = new Set();
    let sampleCount = 0;
    for (const [uuid, control] of Object.entries(controlsObj)) {
        const type = control.type || 'Unknown';
        controlTypes.add(type);
        if (sampleCount < 3) {
            console.log(`Sample control: ${control.name} (type: ${type})`);
            sampleCount++;
        }
    }
    console.log('All control types found:', Array.from(controlTypes).join(', '));

    // Extract all controls - DON'T filter by type initially
    for (const [uuid, control] of Object.entries(controlsObj)) {
        const type = control.type || 'Unknown';

        // Get room name if available
        let roomName = '';
        if (control.room && structureData.rooms && structureData.rooms[control.room]) {
            roomName = structureData.rooms[control.room].name || '';
        }

        // Get category name if available
        let categoryName = '';
        if (control.cat && structureData.cats && structureData.cats[control.cat]) {
            categoryName = structureData.cats[control.cat].name || '';
        }

        controls.push({
            uuid,
            name: control.name || 'Unnamed',
            type,
            room: roomName,
            category: categoryName,
            roomUuid: control.room || '',
            categoryUuid: control.cat || '',
            details: control.details || {}
        });
    }

    console.log(`Returning all ${controls.length} controls (no filtering)`);

    // Organize by room and category
    const organized = {
        byRoom: {},
        byCategory: {},
        byType: {},
        all: controls
    };

    controls.forEach(control => {
        // By room
        if (control.room) {
            if (!organized.byRoom[control.room]) {
                organized.byRoom[control.room] = [];
            }
            organized.byRoom[control.room].push(control);
        }

        // By category
        if (control.category) {
            if (!organized.byCategory[control.category]) {
                organized.byCategory[control.category] = [];
            }
            organized.byCategory[control.category].push(control);
        }

        // By type
        if (!organized.byType[control.type]) {
            organized.byType[control.type] = [];
        }
        organized.byType[control.type].push(control);
    });

    return organized;
}

// API Routes

/**
 * Test connection to Miniserver
 */
app.post('/api/test-connection', async (req, res) => {
    const { host, username, password } = req.body;

    console.log(`Testing connection to ${host} as ${username}`);

    if (!host || !username || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const structure = await fetchLoxoneStructureHTTP(host, username, password);
        console.log('Connection test successful');
        res.json({
            success: true,
            message: 'Connection successful',
            msInfo: structure.msInfo || {}
        });
    } catch (error) {
        console.error('Connection test failed:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Fetch available controls from Miniserver
 */
app.post('/api/get-controls', async (req, res) => {
    const { host, username, password } = req.body;

    console.log(`Fetching controls from ${host} as ${username}`);

    if (!host || !username || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const key = `${host}:${username}`;

    try {
        // Check cache first
        if (connections.has(key)) {
            const cached = connections.get(key);
            if (Date.now() - cached.timestamp < 60000) {
                console.log('Returning cached structure');
                const organized = organizeControls(cached.structure);
                return res.json({
                    success: true,
                    controls: organized,
                    msInfo: cached.structure.msInfo || {}
                });
            }
        }

        // Fetch fresh structure
        const structure = await fetchLoxoneStructureHTTP(host, username, password);

        // Cache it
        connections.set(key, {
            structure,
            timestamp: Date.now()
        });

        const organized = organizeControls(structure);

        console.log(`Returning ${organized.all.length} controls`);

        res.json({
            success: true,
            controls: organized,
            msInfo: structure.msInfo || {}
        });
    } catch (error) {
        console.error('Error fetching controls:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get details for a specific control
 */
app.post('/api/get-control-details', async (req, res) => {
    const { host, username, password, uuid } = req.body;

    if (!host || !username || !password || !uuid) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const structure = await fetchLoxoneStructureHTTP(host, username, password);
        const control = structure.controls?.[uuid];

        if (!control) {
            return res.status(404).json({
                success: false,
                error: 'Control not found'
            });
        }

        res.json({
            success: true,
            control: {
                uuid,
                name: control.name,
                type: control.type,
                room: control.room,
                category: control.cat,
                details: control
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║  Loxone Configuration Server                               ║
╠════════════════════════════════════════════════════════════╣
║  Server running at: http://localhost:${PORT}              ║
║                                                            ║
║  Open this URL in your browser to configure your           ║
║  Stream Deck actions with Loxone controls.                 ║
║                                                            ║
║  Using HTTP Basic Auth for Loxone Gen 1 compatibility      ║
╚════════════════════════════════════════════════════════════╝
    `);
});
