/**
 * Loxone Blind Action with Dial Support
 */

import { action, KeyDownEvent, DialRotateEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import { LoxoneConnectionManager, type LoxoneSettings } from "./loxone-action.js";

@action({ UUID: "com.loxone.smartthome.blind" })
export class BlindAction extends SingletonAction<LoxoneSettings> {
    private currentValues = new Map<string, number>();

    override async onWillAppear(ev: WillAppearEvent<LoxoneSettings>): Promise<void> {
        const settings = ev.payload.settings;

        if (!settings.miniserverHost || !settings.miniserverUsername || !settings.miniserverPassword) {
            await ev.action.setTitle("Configure");
            return;
        }

        if (settings.controlName) {
            await ev.action.setTitle(String(settings.controlName));
        }

        this.currentValues.set(ev.action.id, 0);
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

            await client.sendControl(String(settings.controlUuid), "Stop");
            await ev.action.showOk();
        } catch (error) {
            console.error("Error:", error);
            await ev.action.showAlert();
        }
    }

    override async onDialRotate(ev: DialRotateEvent<LoxoneSettings>): Promise<void> {
        const settings = ev.payload.settings;

        if (!settings.miniserverHost || !settings.miniserverUsername || !settings.miniserverPassword || !settings.controlUuid) {
            return;
        }

        const stepSize = Number(settings.stepSize) || 10;
        const current = this.currentValues.get(ev.action.id) || 0;
        const newValue = Math.max(0, Math.min(100, current + (ev.payload.ticks * stepSize)));

        this.currentValues.set(ev.action.id, newValue);

        try {
            const client = await LoxoneConnectionManager.getClient(
                String(settings.miniserverHost),
                String(settings.miniserverUsername),
                String(settings.miniserverPassword)
            );

            await client.sendControl(String(settings.controlUuid), `ManualPosition/${newValue}`);

            await ev.action.setTitle(`${newValue}%`);
        } catch (error) {
            console.error("Error:", error);
        }
    }
}
