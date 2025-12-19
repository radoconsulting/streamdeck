/**
 * Loxone Pulse Action
 */

import { action, KeyDownEvent, DidReceiveSettingsEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import { type LoxoneSettings } from "./loxone-action.js";
import { exec } from "child_process";

@action({ UUID: "com.loxone.smartthome.pulse" })
export class PulseAction extends SingletonAction<LoxoneSettings> {
    override async onWillAppear(ev: WillAppearEvent<LoxoneSettings>): Promise<void> {
        const settings = ev.payload.settings;

        if (!settings.miniserverHost || !settings.miniserverUsername || !settings.miniserverPassword) {
            await ev.action.setTitle("Configure");
            return;
        }

        if (settings.controlName) {
            await ev.action.setTitle(String(settings.controlName));
        }
    }

    override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<LoxoneSettings>): Promise<void> {
        const settings = ev.payload.settings;

        // Update the display when settings change
        if (settings.controlName) {
            await ev.action.setTitle(String(settings.controlName));
        }
    }

    override async onKeyDown(ev: KeyDownEvent<LoxoneSettings>): Promise<void> {
        const settings = ev.payload.settings;

        if (!settings.miniserverHost || !settings.miniserverUsername || !settings.miniserverPassword || !settings.controlUuid) {
            await ev.action.showAlert();
            return;
        }

        const host = String(settings.miniserverHost);
        const username = String(settings.miniserverUsername);
        const password = String(settings.miniserverPassword);
        const uuid = String(settings.controlUuid);

        // Send pulse command
        const url = `http://${username}:${password}@${host}:80/dev/sps/io/${uuid}/Pulse`;
        const curlCommand = `curl -s -o nul -w "%{http_code}" "${url}"`;

        exec(curlCommand, (error, stdout) => {
            if (error) {
                console.error('[Pulse] curl error:', error);
                ev.action.showAlert();
                return;
            }

            const statusCode = stdout.trim();
            console.log(`[Pulse] HTTP response code: ${statusCode}`);

            if (statusCode === '200') {
                ev.action.showOk();
            } else {
                console.error(`[Pulse] HTTP error: ${statusCode}`);
                ev.action.showAlert();
            }
        });
    }
}
