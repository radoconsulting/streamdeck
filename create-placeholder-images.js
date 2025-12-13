/**
 * Create placeholder images for the Stream Deck plugin
 * This creates simple colored PNG files using Canvas
 */

import { createWriteStream } from 'fs';
import { mkdir } from 'fs/promises';
import { dirname } from 'path';

// Simple PNG generation without dependencies
function createColoredPNG(width, height, r, g, b) {
    // PNG header
    const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

    // IHDR chunk
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr.writeUInt8(8, 8);  // bit depth
    ihdr.writeUInt8(2, 9);  // color type (RGB)
    ihdr.writeUInt8(0, 10); // compression
    ihdr.writeUInt8(0, 11); // filter
    ihdr.writeUInt8(0, 12); // interlace

    const ihdrChunk = createChunk('IHDR', ihdr);

    // IDAT chunk (image data)
    const scanlineSize = 1 + width * 3; // filter byte + RGB bytes
    const imageData = Buffer.alloc(height * scanlineSize);

    for (let y = 0; y < height; y++) {
        const offset = y * scanlineSize;
        imageData[offset] = 0; // filter type: none

        for (let x = 0; x < width; x++) {
            const pixelOffset = offset + 1 + x * 3;
            imageData[pixelOffset] = r;
            imageData[pixelOffset + 1] = g;
            imageData[pixelOffset + 2] = b;
        }
    }

    // Simple deflate (stored, no compression for simplicity)
    const compressed = Buffer.concat([
        Buffer.from([0x78, 0x9c]), // zlib header
        imageData,
        Buffer.from([0, 0, 0, 0]) // adler32 checksum (simplified)
    ]);

    const idatChunk = createChunk('IDAT', compressed);

    // IEND chunk
    const iendChunk = createChunk('IEND', Buffer.alloc(0));

    return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length, 0);

    const typeBuffer = Buffer.from(type, 'ascii');
    const crc = calculateCRC(Buffer.concat([typeBuffer, data]));
    const crcBuffer = Buffer.alloc(4);
    crcBuffer.writeUInt32BE(crc, 0);

    return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

function calculateCRC(buffer) {
    let crc = 0xffffffff;
    for (let i = 0; i < buffer.length; i++) {
        crc ^= buffer[i];
        for (let j = 0; j < 8; j++) {
            crc = (crc & 1) ? (0xedb88320 ^ (crc >>> 1)) : (crc >>> 1);
        }
    }
    return (crc ^ 0xffffffff) >>> 0;
}

async function ensureDir(filePath) {
    const dir = dirname(filePath);
    await mkdir(dir, { recursive: true });
}

async function createImage(path, width, height, r, g, b) {
    await ensureDir(path);
    const png = createColoredPNG(width, height, r, g, b);
    const stream = createWriteStream(path);
    stream.write(png);
    stream.end();
    return new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
    });
}

async function main() {
    const basePath = 'com.loxone.smartthome.sdPlugin/imgs';

    console.log('Creating placeholder images...');

    // Plugin icons (green)
    await createImage(`${basePath}/plugin/icon.png`, 72, 72, 102, 185, 51);
    await createImage(`${basePath}/plugin/icon@2x.png`, 144, 144, 102, 185, 51);
    await createImage(`${basePath}/plugin/category-icon.png`, 28, 28, 102, 185, 51);
    await createImage(`${basePath}/plugin/category-icon@2x.png`, 56, 56, 102, 185, 51);

    // Switch icons (blue)
    await createImage(`${basePath}/actions/switch/icon.png`, 20, 20, 52, 152, 219);
    await createImage(`${basePath}/actions/switch/icon@2x.png`, 40, 40, 52, 152, 219);
    await createImage(`${basePath}/actions/switch/key.png`, 72, 72, 52, 152, 219);
    await createImage(`${basePath}/actions/switch/key@2x.png`, 144, 144, 52, 152, 219);
    await createImage(`${basePath}/actions/switch/key_on.png`, 72, 72, 46, 204, 113);
    await createImage(`${basePath}/actions/switch/key_on@2x.png`, 144, 144, 46, 204, 113);

    // Dimmer icons (yellow)
    await createImage(`${basePath}/actions/dimmer/icon.png`, 20, 20, 241, 196, 15);
    await createImage(`${basePath}/actions/dimmer/icon@2x.png`, 40, 40, 241, 196, 15);
    await createImage(`${basePath}/actions/dimmer/key.png`, 72, 72, 241, 196, 15);
    await createImage(`${basePath}/actions/dimmer/key@2x.png`, 144, 144, 241, 196, 15);
    await createImage(`${basePath}/actions/dimmer/dial.png`, 200, 200, 241, 196, 15);
    await createImage(`${basePath}/actions/dimmer/dial@2x.png`, 400, 400, 241, 196, 15);

    // Blind icons (gray)
    await createImage(`${basePath}/actions/blind/icon.png`, 20, 20, 149, 165, 166);
    await createImage(`${basePath}/actions/blind/icon@2x.png`, 40, 40, 149, 165, 166);
    await createImage(`${basePath}/actions/blind/key.png`, 72, 72, 149, 165, 166);
    await createImage(`${basePath}/actions/blind/key@2x.png`, 144, 144, 149, 165, 166);
    await createImage(`${basePath}/actions/blind/dial.png`, 200, 200, 149, 165, 166);
    await createImage(`${basePath}/actions/blind/dial@2x.png`, 400, 400, 149, 165, 166);

    // Pulse icons (green)
    await createImage(`${basePath}/actions/pulse/icon.png`, 20, 20, 46, 204, 113);
    await createImage(`${basePath}/actions/pulse/icon@2x.png`, 40, 40, 46, 204, 113);
    await createImage(`${basePath}/actions/pulse/key.png`, 72, 72, 46, 204, 113);
    await createImage(`${basePath}/actions/pulse/key@2x.png`, 144, 144, 46, 204, 113);

    console.log('✓ All placeholder images created successfully!');
}

main().catch(console.error);
