/**
 * Loxone Miniserver types for Gen 1 compatibility
 */

export interface LoxoneConfig {
    host: string;
    username: string;
    password: string;
    port?: number;
}

export interface LoxoneControl {
    uuid: string;
    name: string;
    type: string;
    room?: string;
    category?: string;
}

export interface LoxoneValueEvent {
    uuid: string;
    value: number | string;
}

export interface LoxoneTextEvent {
    uuid: string;
    text: string;
}

export interface LoxoneStructureFile {
    controls: Record<string, LoxoneControl>;
    msInfo: {
        serialNr: string;
        msName: string;
        projectName: string;
    };
}

export interface LoxoneMessage {
    LL: {
        control: string;
        value: string | number;
        Code: string;
    };
}
