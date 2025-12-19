/**
 * Loxone Dimmer Action with Dial Support
 */

import { action, KeyDownEvent, DialRotateEvent, DidReceiveSettingsEvent, SingletonAction, WillAppearEvent, WillDisappearEvent } from "@elgato/streamdeck";
import { type LoxoneSettings } from "./loxone-action.js";
import { exec } from "child_process";

@action({ UUID: "com.loxone.smartthome.dimmer" })
export class DimmerAction extends SingletonAction<LoxoneSettings> {
    private currentValues = new Map<string, number>();
    private dimmerStates = new Map<string, boolean>();
    private pollingIntervals = new Map<string, NodeJS.Timeout>();
    private readonly POLL_INTERVAL_MS = 5000;

    override async onWillAppear(ev: WillAppearEvent<LoxoneSettings>): Promise<void> {
        const settings = ev.payload.settings;

        if (!settings.miniserverHost || !settings.miniserverUsername || !settings.miniserverPassword) {
            await ev.action.setTitle("Configure");
            return;
        }

        // Initialize state
        this.currentValues.set(ev.action.id, 0);
        this.dimmerStates.set(ev.action.id, false);

        if (settings.controlName) {
            await ev.action.setTitle(String(settings.controlName));
        }

        // Fetch current state from Loxone
        if (settings.controlUuid) {
            this.fetchCurrentState(ev.action, settings);

            // Start periodic polling
            const intervalId = setInterval(() => {
                this.fetchCurrentState(ev.action, settings);
            }, this.POLL_INTERVAL_MS);

            this.pollingIntervals.set(ev.action.id, intervalId);
        }
    }

    override async onWillDisappear(ev: WillDisappearEvent<LoxoneSettings>): Promise<void> {
        // Stop polling
        const intervalId = this.pollingIntervals.get(ev.action.id);
        if (intervalId) {
            clearInterval(intervalId);
            this.pollingIntervals.delete(ev.action.id);
        }

        this.currentValues.delete(ev.action.id);
        this.dimmerStates.delete(ev.action.id);
    }

    override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<LoxoneSettings>): Promise<void> {
        const settings = ev.payload.settings;

        // Immediately refresh the display when settings change
        if (settings.controlUuid && settings.miniserverHost && settings.miniserverUsername && settings.miniserverPassword) {
            this.fetchCurrentState(ev.action, settings);
        } else if (settings.controlName) {
            await ev.action.setTitle(String(settings.controlName));
        }
    }

    private async fetchCurrentState(action: any, settings: LoxoneSettings): Promise<void> {
        const host = String(settings.miniserverHost);
        const username = String(settings.miniserverUsername);
        const password = String(settings.miniserverPassword);
        const uuid = String(settings.controlUuid);

        const url = `http://${username}:${password}@${host}:80/data/LoxAPP3.json`;
        const curlCommand = `curl -s "${url}"`;

        exec(curlCommand, (error, stdout) => {
            if (error) {
                console.error('[Dimmer] Failed to fetch state:', error);
                return;
            }

            try {
                const data = JSON.parse(stdout);
                const control = data.controls?.[uuid];

                if (control && control.states) {
                    // Try value first (for dimmers), then position (for other types)
                    const value = control.states.value ?? control.states.position ?? 0;
                    const percentage = Math.round(value);

                    this.currentValues.set(action.id, percentage);
                    this.dimmerStates.set(action.id, percentage > 0);
                    action.setTitle(`${settings.controlName || 'Dimmer'}\n${percentage}%`);
                    action.setState(percentage > 0 ? 1 : 0);
                }
            } catch (e) {
                console.error('[Dimmer] Failed to parse state:', e);
            }
        });
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

        // Toggle between 0 and 100
        const currentState = this.dimmerStates.get(ev.action.id) || false;
        const newValue = currentState ? 0 : 100;

        const url = `http://${username}:${password}@${host}:80/dev/sps/io/${uuid}/${newValue}`;
        const curlCommand = `curl -s -o nul -w "%{http_code}" "${url}"`;

        exec(curlCommand, (error, stdout) => {
            if (error) {
                console.error('[Dimmer] curl error:', error);
                ev.action.showAlert();
                return;
            }

            const statusCode = stdout.trim();
            console.log(`[Dimmer] HTTP response code: ${statusCode}, set to: ${newValue}%`);

            if (statusCode === '200') {
                this.currentValues.set(ev.action.id, newValue);
                this.dimmerStates.set(ev.action.id, newValue > 0);
                ev.action.setTitle(`${settings.controlName || 'Dimmer'}\n${newValue}%`);
                ev.action.setState(newValue > 0 ? 1 : 0);
                ev.action.showOk();
            } else {
                console.error(`[Dimmer] HTTP error: ${statusCode}`);
                ev.action.showAlert();
            }
        });
    }

    override async onDialRotate(ev: DialRotateEvent<LoxoneSettings>): Promise<void> {
        const settings = ev.payload.settings;

        if (!settings.miniserverHost || !settings.miniserverUsername || !settings.miniserverPassword || !settings.controlUuid) {
            return;
        }

        const host = String(settings.miniserverHost);
        const username = String(settings.miniserverUsername);
        const password = String(settings.miniserverPassword);
        const uuid = String(settings.controlUuid);

        const stepSize = Number(settings.stepSize) || 5;
        const current = this.currentValues.get(ev.action.id) || 0;
        const newValue = Math.max(0, Math.min(100, current + (ev.payload.ticks * stepSize)));

        this.currentValues.set(ev.action.id, newValue);

        const url = `http://${username}:${password}@${host}:80/dev/sps/io/${uuid}/${newValue}`;
        const curlCommand = `curl -s -o nul -w "%{http_code}" "${url}"`;

        exec(curlCommand, (error, stdout) => {
            if (error) {
                console.error('[Dimmer] curl error:', error);
                return;
            }

            const statusCode = stdout.trim();

            if (statusCode === '200') {
                this.dimmerStates.set(ev.action.id, newValue > 0);
                ev.action.setTitle(`${settings.controlName || 'Dimmer'}\n${newValue}%`);
            } else {
                console.error(`[Dimmer] HTTP error: ${statusCode}`);
            }
        });
    }
}
