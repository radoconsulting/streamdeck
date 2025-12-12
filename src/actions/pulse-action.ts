/**
 * Loxone Pulse Action
 */

import { action, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import { LoxoneConnectionManager, type LoxoneSettings } from "./loxone-action.js";

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

    override async onKeyDown(ev: KeyDownEvent<LoxoneSettings>): Promise<void> {
        const settings = ev.payload.settings;

        if (!settings.miniserverHost || !settings.miniserverUsername || !settings.miniserverPassword || !settings.controlUuid) {
            await ev.action.showAlert();
            return;
        }

        try {
            const client = await LoxoneConnectionManager.getClient(
                String(settings.miniserverHost),
                String(settings.miniserverUsername),
                String(settings.miniserverPassword)
            );

            await client.sendControl(String(settings.controlUuid), "Pulse");
            await ev.action.showOk();
        } catch (error) {
            console.error("Error:", error);
            await ev.action.showAlert();
        }
    }
}
