/**
 * Loxone Configuration Web App
 */

const API_URL = 'http://localhost:3456/api';

let allControls = null;
let filteredControls = [];
let selectedControl = null;
let currentCredentials = null;

/**
 * Connect to Miniserver and load controls
 */
async function connectToMiniserver() {
    const host = document.getElementById('host').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!host || !username || !password) {
        showStatus('Please fill in all fields', 'error');
        return;
    }

    currentCredentials = { host, username, password };

    showStatus('Connecting to Miniserver...', 'info');

    try {
        const response = await fetch(`${API_URL}/get-controls`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ host, username, password })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to fetch controls');
        }

        // Store controls
        allControls = data.controls;

        // Show miniserver info
        const msInfo = data.msInfo;
        showStatus(
            `✓ Connected to ${msInfo.msName || 'Miniserver'} (${msInfo.serialNr || 'Unknown'}) - Found ${allControls.all.length} controls`,
            'success'
        );

        // Populate filters
        populateFilters();

        // Display controls
        displayControls(allControls.all);

        // Show controls section
        document.getElementById('controlsSection').classList.remove('hidden');

    } catch (error) {
        showStatus(`Connection failed: ${error.message}`, 'error');
        console.error('Error:', error);
    }
}

/**
 * Populate filter dropdowns
 */
function populateFilters() {
    // Populate room filter
    const roomFilter = document.getElementById('roomFilter');
    roomFilter.innerHTML = '<option value="">All Rooms</option>';

    Object.keys(allControls.byRoom).sort().forEach(room => {
        const option = document.createElement('option');
        option.value = room;
        option.textContent = `${room} (${allControls.byRoom[room].length})`;
        roomFilter.appendChild(option);
    });

    // Populate type filter
    const typeFilter = document.getElementById('typeFilter');
    typeFilter.innerHTML = '<option value="">All Types</option>';

    Object.keys(allControls.byType).sort().forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = `${type} (${allControls.byType[type].length})`;
        typeFilter.appendChild(option);
    });
}

/**
 * Display controls in the grid
 */
function displayControls(controls) {
    const container = document.getElementById('controlsList');

    if (!controls || controls.length === 0) {
        container.innerHTML = '<div class="loading">No controls found matching your filters</div>';
        return;
    }

    container.innerHTML = '';

    controls.forEach(control => {
        const item = document.createElement('div');
        item.className = 'control-item';
        if (selectedControl && selectedControl.uuid === control.uuid) {
            item.classList.add('selected');
        }

        item.innerHTML = `
            <div class="control-info">
                <div class="control-name">${escapeHtml(control.name)}</div>
                <div class="control-meta">
                    ${control.room ? `Room: ${escapeHtml(control.room)}` : ''}
                    ${control.room && control.category ? ' • ' : ''}
                    ${control.category ? `Category: ${escapeHtml(control.category)}` : ''}
                </div>
            </div>
            <div class="control-type">${escapeHtml(control.type)}</div>
        `;

        item.onclick = () => selectControl(control);

        container.appendChild(item);
    });
}

/**
 * Filter controls based on search and filters
 */
function filterControls() {
    const searchText = document.getElementById('searchBox').value.toLowerCase();
    const roomFilter = document.getElementById('roomFilter').value;
    const typeFilter = document.getElementById('typeFilter').value;

    let filtered = allControls.all;

    // Apply search filter
    if (searchText) {
        filtered = filtered.filter(c =>
            c.name.toLowerCase().includes(searchText) ||
            c.type.toLowerCase().includes(searchText) ||
            (c.room && c.room.toLowerCase().includes(searchText))
        );
    }

    // Apply room filter
    if (roomFilter) {
        filtered = filtered.filter(c => c.room === roomFilter);
    }

    // Apply type filter
    if (typeFilter) {
        filtered = filtered.filter(c => c.type === typeFilter);
    }

    displayControls(filtered);
}

/**
 * Select a control and show details
 */
function selectControl(control) {
    selectedControl = control;

    // Update UI
    displayControls(filteredControls.length > 0 ? filteredControls : allControls.all);

    // Show selection section
    const section = document.getElementById('selectionSection');
    section.classList.remove('hidden');

    // Determine recommended action type
    let recommendedAction = 'Switch';
    if (control.type === 'Dimmer' || control.type === 'LightController') {
        recommendedAction = 'Dimmer';
    } else if (control.type === 'Jalousie') {
        recommendedAction = 'Blind';
    } else if (control.type === 'Pushbutton') {
        recommendedAction = 'Pulse';
    }

    // Display details
    const detailsContainer = document.getElementById('selectedControlDetails');
    detailsContainer.innerHTML = `
        <div style="background: #f0f2ff; padding: 20px; border-radius: 8px; border-left: 4px solid #66B933;">
            <h3 style="margin-bottom: 15px; color: #333;">${escapeHtml(control.name)}</h3>

            <div style="margin-bottom: 10px;">
                <strong>Type:</strong> ${escapeHtml(control.type)}
            </div>

            ${control.room ? `
            <div style="margin-bottom: 10px;">
                <strong>Room:</strong> ${escapeHtml(control.room)}
            </div>
            ` : ''}

            ${control.category ? `
            <div style="margin-bottom: 10px;">
                <strong>Category:</strong> ${escapeHtml(control.category)}
            </div>
            ` : ''}

            <div style="margin-bottom: 10px;">
                <strong>Recommended Action:</strong>
                <span style="color: #66B933; font-weight: 600;">${recommendedAction}</span>
            </div>

            <div style="margin-top: 20px;">
                <strong>Control UUID:</strong>
                <div class="uuid-display">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <code id="uuidText">${control.uuid}</code>
                        <button class="btn btn-secondary" style="padding: 8px 16px; font-size: 12px;" onclick="copyUUID()">
                            Copy UUID
                        </button>
                    </div>
                </div>
            </div>

            <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 8px;">
                <strong>Miniserver Connection Details:</strong>
                <div style="margin-top: 10px; font-size: 13px;">
                    <div style="margin-bottom: 5px;"><strong>Address:</strong> ${escapeHtml(currentCredentials.host)}</div>
                    <div style="margin-bottom: 5px;"><strong>Username:</strong> ${escapeHtml(currentCredentials.username)}</div>
                    <div><strong>Password:</strong> ••••••••</div>
                </div>
            </div>
        </div>
    `;

    // Scroll to selection
    section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Copy UUID to clipboard
 */
function copyUUID() {
    const uuidText = document.getElementById('uuidText').textContent;
    navigator.clipboard.writeText(uuidText).then(() => {
        showStatus('UUID copied to clipboard!', 'success');
    }).catch(err => {
        showStatus('Failed to copy UUID', 'error');
        console.error('Copy failed:', err);
    });
}

/**
 * Show status message
 */
function showStatus(message, type) {
    const container = document.getElementById('statusMessage');

    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;

    container.innerHTML = '';
    container.appendChild(alert);

    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            if (container.firstChild === alert) {
                container.innerHTML = '';
            }
        }, 5000);
    }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    // Focus on host input
    document.getElementById('host').focus();

    // Allow Enter key to submit
    ['host', 'username', 'password'].forEach(id => {
        document.getElementById(id).addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                connectToMiniserver();
            }
        });
    });
});
