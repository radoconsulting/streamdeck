/**
 * Base Loxone Action with connection management
 */

import { LoxoneClient } from "../loxone/client.js";

export type LoxoneSettings = Record<string, any> & {
    miniserverHost?: string;
    miniserverUsername?: string;
    miniserverPassword?: string;
    controlUuid?: string;
    controlName?: string;
    stepSize?: number;
};

export class LoxoneConnectionManager {
    private static clients = new Map<string, LoxoneClient>();

    static async getClient(host: string, username: string, password: string): Promise<LoxoneClient> {
        const key = `${host}:${username}`;

        if (this.clients.has(key)) {
            return this.clients.get(key)!;
        }

        const client = new LoxoneClient({ host, username, password });
        await client.connect();
        this.clients.set(key, client);

        return client;
    }
}
