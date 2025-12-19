/**
 * Loxone Blind Action with Dial Support
 */

import { action, KeyDownEvent, DialRotateEvent, DidReceiveSettingsEvent, SingletonAction, WillAppearEvent, WillDisappearEvent } from "@elgato/streamdeck";
import { type LoxoneSettings } from "./loxone-action.js";
import { exec } from "child_process";

@action({ UUID: "com.loxone.smartthome.blind" })
export class BlindAction extends SingletonAction<LoxoneSettings> {
    private currentValues = new Map<string, number>();
    private pollingIntervals = new Map<string, NodeJS.Timeout>();
    private readonly POLL_INTERVAL_MS = 5000;

    override async onWillAppear(ev: WillAppearEvent<LoxoneSettings>): Promise<void> {
        const settings = ev.payload.settings;

        if (!settings.miniserverHost || !settings.miniserverUsername || !settings.miniserverPassword) {
            await ev.action.setTitle("Configure");
            return;
        }

        this.currentValues.set(ev.action.id, 0);

        if (settings.controlName) {
            await ev.action.setTitle(String(settings.controlName));
        }

        // Fetch current position from Loxone
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
                console.error('[Blind] Failed to fetch state:', error);
                return;
            }

            try {
                const data = JSON.parse(stdout);
                const control = data.controls?.[uuid];

                if (control && control.states) {
                    const position = control.states.position || control.states.value || 0;
                    const percentage = Math.round(position);
                    this.currentValues.set(action.id, percentage);

                    const name = settings.controlName ? String(settings.controlName) : 'Blind';
                    action.setTitle(`${name}\n${percentage}%`);

                    // Update dial feedback (setFeedback works for both buttons and dials)
                    // Just don't set indicator for buttons as it causes errors
                    try {
                        action.setFeedback({
                            title: name,
                            value: `${percentage}%`,
                            indicator: {
                                value: percentage,
                                enabled: true
                            }
                        });
                    } catch (e) {
                        // Ignore feedback errors for non-dial actions
                    }
                }
            } catch (e) {
                console.error('[Blind] Failed to parse state:', e);
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

        // Stop command for blinds
        const url = `http://${username}:${password}@${host}:80/dev/sps/io/${uuid}/FullDown`;
        const curlCommand = `curl -s -o nul -w "%{http_code}" "${url}"`;

        exec(curlCommand, (error, stdout) => {
            if (error) {
                console.error('[Blind] curl error:', error);
                ev.action.showAlert();
                return;
            }

            const statusCode = stdout.trim();
            console.log(`[Blind] HTTP response code: ${statusCode}`);

            if (statusCode === '200') {
                ev.action.showOk();
            } else {
                console.error(`[Blind] HTTP error: ${statusCode}`);
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

        const stepSize = Number(settings.stepSize) || 10;
        const current = this.currentValues.get(ev.action.id) || 0;
        const newValue = Math.max(0, Math.min(100, current + (ev.payload.ticks * stepSize)));

        this.currentValues.set(ev.action.id, newValue);

        // Update the dial feedback immediately for responsive UI
        const name = settings.controlName ? String(settings.controlName) : 'Blind';
        ev.action.setFeedback({
            title: name,
            value: `${newValue}%`,
            indicator: {
                value: newValue,
                enabled: true
            }
        });

        // Blinds use ManualPosition command
        const url = `http://${username}:${password}@${host}:80/dev/sps/io/${uuid}/ManualPosition/${newValue}`;
        const curlCommand = `curl -s -o nul -w "%{http_code}" "${url}"`;

        exec(curlCommand, (error, stdout) => {
            if (error) {
                console.error('[Blind] curl error:', error);
                return;
            }

            const statusCode = stdout.trim();

            if (statusCode === '200') {
                // Keep the feedback updated
                ev.action.setFeedback({
                    title: name,
                    value: `${newValue}%`,
                    indicator: {
                        value: newValue,
                        enabled: true
                    }
                });
            } else {
                console.error(`[Blind] HTTP error: ${statusCode}`);
            }
        });
    }
}
