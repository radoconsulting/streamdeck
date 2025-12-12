/**
 * Loxone Miniserver WebSocket Client
 * Compatible with Gen 1 Miniserver
 */

import WebSocket from "ws";
import { createHash } from "crypto";
import { EventEmitter } from "events";
import { LoxoneConfig, LoxoneValueEvent, LoxoneStructureFile } from "./types.js";

export class LoxoneClient extends EventEmitter {
    private ws: WebSocket | null = null;
    private config: LoxoneConfig;
    private reconnectTimer: NodeJS.Timeout | null = null;
    private keepAliveTimer: NodeJS.Timeout | null = null;
    private authenticated = false;
    private structureFile: LoxoneStructureFile | null = null;

    constructor(config: LoxoneConfig) {
        super();
        this.config = {
            ...config,
            port: config.port || 80
        };
    }

    /**
     * Connect to the Loxone Miniserver
     */
    async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const wsUrl = `ws://${this.config.host}:${this.config.port}/ws/rfc6455`;
                console.log(`Connecting to Loxone Miniserver at ${wsUrl}`);

                this.ws = new WebSocket(wsUrl);

                this.ws.on("open", async () => {
                    console.log("WebSocket connected");
                    try {
                        await this.authenticate();
                        await this.loadStructureFile();
                        await this.enableStatusUpdates();
                        this.startKeepAlive();
                        this.emit("connected");
                        resolve();
                    } catch (error) {
                        console.error("Authentication failed:", error);
                        reject(error);
                    }
                });

                this.ws.on("message", (data: Buffer) => {
                    this.handleMessage(data);
                });

                this.ws.on("error", (error) => {
                    console.error("WebSocket error:", error);
                    this.emit("error", error);
                });

                this.ws.on("close", () => {
                    console.log("WebSocket closed");
                    this.authenticated = false;
                    this.stopKeepAlive();
                    this.emit("disconnected");
                    this.scheduleReconnect();
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Disconnect from the Miniserver
     */
    disconnect(): void {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        this.stopKeepAlive();
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    /**
     * Authenticate with the Miniserver using Gen 1 authentication
     */
    private async authenticate(): Promise<void> {
        // Gen 1 uses simple HTTP basic auth over WebSocket
        const credentials = Buffer.from(
            `${this.config.username}:${this.config.password}`
        ).toString("base64");

        await this.sendCommand(`jdev/sys/authenticate/${credentials}`);
        this.authenticated = true;
    }

    /**
     * Load the structure file to get control information
     */
    private async loadStructureFile(): Promise<void> {
        const response = await this.sendCommand("data/LoxAPP3.json");
        if (response && response.LL) {
            this.structureFile = response.LL as unknown as LoxoneStructureFile;
            console.log(`Loaded structure file for ${this.structureFile.msInfo?.msName}`);
        }
    }

    /**
     * Enable status updates from the Miniserver
     */
    private async enableStatusUpdates(): Promise<void> {
        await this.sendCommand("jdev/sps/enablebinstatusupdate");
    }

    /**
     * Send a command to the Miniserver
     */
    private sendCommand(command: string): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
                reject(new Error("WebSocket not connected"));
                return;
            }

            const messageHandler = (data: Buffer) => {
                try {
                    const response = JSON.parse(data.toString());
                    this.ws?.off("message", messageHandler);
                    resolve(response);
                } catch (error) {
                    // Not a JSON response, might be binary
                    resolve(null);
                }
            };

            this.ws.once("message", messageHandler);
            this.ws.send(command);

            // Timeout after 5 seconds
            setTimeout(() => {
                this.ws?.off("message", messageHandler);
                reject(new Error("Command timeout"));
            }, 5000);
        });
    }

    /**
     * Handle incoming WebSocket messages
     */
    private handleMessage(data: Buffer): void {
        try {
            // Try to parse as JSON first
            const text = data.toString();
            if (text.startsWith("{")) {
                const message = JSON.parse(text);
                this.handleJsonMessage(message);
            } else {
                // Handle binary status updates
                this.handleBinaryMessage(data);
            }
        } catch (error) {
            // Ignore parsing errors for binary messages
        }
    }

    /**
     * Handle JSON messages from the Miniserver
     */
    private handleJsonMessage(message: any): void {
        if (message.LL?.control && message.LL?.value !== undefined) {
            const event: LoxoneValueEvent = {
                uuid: message.LL.control,
                value: message.LL.value
            };
            this.emit("valueChange", event);
        }
    }

    /**
     * Handle binary status update messages
     */
    private handleBinaryMessage(data: Buffer): void {
        // Binary status updates format:
        // Header: 8 bytes
        // UUID: 16 bytes (as binary)
        // Value: 8 bytes (double)

        if (data.length < 24) return;

        try {
            // Skip header (8 bytes)
            let offset = 8;

            while (offset + 24 <= data.length) {
                // Read UUID (16 bytes)
                const uuidBuffer = data.subarray(offset, offset + 16);
                const uuid = this.formatUuid(uuidBuffer);
                offset += 16;

                // Read value (8 bytes, double)
                const value = data.readDoubleLE(offset);
                offset += 8;

                const event: LoxoneValueEvent = {
                    uuid,
                    value
                };
                this.emit("valueChange", event);
            }
        } catch (error) {
            console.error("Error parsing binary message:", error);
        }
    }

    /**
     * Format binary UUID to standard UUID string
     */
    private formatUuid(buffer: Buffer): string {
        const hex = buffer.toString("hex");
        return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20, 32)}`;
    }

    /**
     * Send a control command to the Miniserver
     */
    async sendControl(uuid: string, command: string): Promise<void> {
        if (!this.authenticated) {
            throw new Error("Not authenticated");
        }
        await this.sendCommand(`jdev/sps/io/${uuid}/${command}`);
    }

    /**
     * Get the current value of a control
     */
    getControlValue(uuid: string): number | undefined {
        // This would need to be cached from status updates
        return undefined;
    }

    /**
     * Get control information from the structure file
     */
    getControl(uuid: string): any {
        return this.structureFile?.controls?.[uuid];
    }

    /**
     * Start keep-alive timer
     */
    private startKeepAlive(): void {
        this.keepAliveTimer = setInterval(() => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send("keepalive");
            }
        }, 30000); // Every 30 seconds
    }

    /**
     * Stop keep-alive timer
     */
    private stopKeepAlive(): void {
        if (this.keepAliveTimer) {
            clearInterval(this.keepAliveTimer);
            this.keepAliveTimer = null;
        }
    }

    /**
     * Schedule reconnection attempt
     */
    private scheduleReconnect(): void {
        if (this.reconnectTimer) return;

        this.reconnectTimer = setTimeout(() => {
            console.log("Attempting to reconnect...");
            this.reconnectTimer = null;
            this.connect().catch((error) => {
                console.error("Reconnection failed:", error);
            });
        }, 5000); // Try to reconnect after 5 seconds
    }
}
