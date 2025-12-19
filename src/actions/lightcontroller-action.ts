/**
 * Loxone LightController Action - Cycles through scenes/moods
 */

import { action, KeyDownEvent, DialRotateEvent, DidReceiveSettingsEvent, SingletonAction, WillAppearEvent, WillDisappearEvent } from "@elgato/streamdeck";
import { type LoxoneSettings } from "./loxone-action.js";
import { exec } from "child_process";

@action({ UUID: "com.loxone.smartthome.lightcontroller" })
export class LightControllerAction extends SingletonAction<LoxoneSettings> {
    private pollingIntervals = new Map<string, NodeJS.Timeout>();
    private readonly POLL_INTERVAL_MS = 5000;

    override async onWillAppear(ev: WillAppearEvent<LoxoneSettings>): Promise<void> {
        const settings = ev.payload.settings;

        if (!settings.miniserverHost || !settings.miniserverUsername || !settings.miniserverPassword) {
            await ev.action.setTitle("Configure");
            return;
        }

        if (settings.controlName) {
            await ev.action.setTitle(String(settings.controlName));
        }

        // Fetch current scene from Loxone
        if (settings.controlUuid) {
            this.fetchCurrentScene(ev.action, settings);

            // Start periodic polling
            const intervalId = setInterval(() => {
                this.fetchCurrentScene(ev.action, settings);
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
    }

    override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<LoxoneSettings>): Promise<void> {
        const settings = ev.payload.settings;

        // Immediately refresh the display when settings change
        if (settings.controlUuid && settings.miniserverHost && settings.miniserverUsername && settings.miniserverPassword) {
            this.fetchCurrentScene(ev.action, settings);
        } else if (settings.controlName) {
            await ev.action.setTitle(String(settings.controlName));
        }
    }

    private async fetchCurrentScene(action: any, settings: LoxoneSettings): Promise<void> {
        const host = String(settings.miniserverHost);
        const username = String(settings.miniserverUsername);
        const password = String(settings.miniserverPassword);
        const uuid = String(settings.controlUuid);

        // First, get the control structure to find state UUIDs
        const structureUrl = `http://${username}:${password}@${host}:80/data/LoxAPP3.json`;
        const structureCommand = `curl -s "${structureUrl}"`;

        exec(structureCommand, (error, stdout) => {
            if (error) {
                console.error('[LightController] Failed to fetch structure:', error);
                return;
            }

            try {
                const data = JSON.parse(stdout);
                const control = data.controls?.[uuid];

                if (!control || !control.states) {
                    console.error('[LightController] Control not found or has no states');
                    return;
                }

                // Use activeMoodsNum which contains the active scene number
                const activeMoodsNumUuid = control.states.activeMoodsNum;

                if (!activeMoodsNumUuid) {
                    console.error('[LightController] Missing activeMoodsNum UUID');
                    return;
                }

                // Fetch the active scene number
                const activeMoodsNumUrl = `http://${username}:${password}@${host}:80/jdev/sps/state/${activeMoodsNumUuid}`;
                const activeMoodsNumCommand = `curl -s "${activeMoodsNumUrl}"`;

                exec(activeMoodsNumCommand, (err, stdout) => {
                    if (err) {
                        console.error('[LightController] Failed to fetch active scene:', err);
                        return;
                    }

                    try {
                        const response = JSON.parse(stdout);
                        const sceneNumber = response.LL?.value ?? '0';

                        console.log('[LightController] Active scene number:', sceneNumber);

                        // Display scene number (mood names not available via HTTP API on Gen1)
                        const displayText = sceneNumber !== '0' && sceneNumber !== ''
                            ? `Scene ${sceneNumber}`
                            : 'Off';

                        const name = settings.controlName ? String(settings.controlName) : 'Light';
                        console.log('[LightController] Setting title to:', `${name}\n${displayText}`);
                        action.setTitle(`${name}\n${displayText}`);

                        // Update dial feedback (only if this is a dial action, not a button)
                        try {
                            action.setFeedback({
                                title: name,
                                value: displayText,
                                icon: sceneNumber !== '0' && sceneNumber !== '' ? 'imgs/actions/lightcontroller/key' : undefined
                            });
                        } catch (e) {
                            // setFeedback only works on dials, ignore for buttons
                        }
                    } catch (e) {
                        console.error('[LightController] Failed to parse response:', e);
                    }
                });
            } catch (e) {
                console.error('[LightController] Failed to parse structure:', e);
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

        // Send 'plus' command to cycle to next scene/mood
        const url = `http://${username}:${password}@${host}:80/dev/sps/io/${uuid}/plus`;
        const curlCommand = `curl -s -o nul -w "%{http_code}" "${url}"`;

        exec(curlCommand, (error, stdout) => {
            if (error) {
                console.error('[LightController] curl error:', error);
                ev.action.showAlert();
                return;
            }

            const statusCode = stdout.trim();
            if (statusCode === '200') {
                // Fetch updated scene immediately
                this.fetchCurrentScene(ev.action, settings);
                ev.action.showOk();
            } else {
                console.error(`[LightController] HTTP error: ${statusCode}`);
                ev.action.showAlert();
            }
        });
    }

    override async onDialRotate(ev: DialRotateEvent<LoxoneSettings>): Promise<void> {
        const settings = ev.payload.settings;

        if (!settings.miniserverHost || !settings.miniserverUsername || !settings.miniserverPassword || !settings.controlUuid) {
            await ev.action.showAlert();
            return;
        }

        const host = String(settings.miniserverHost);
        const username = String(settings.miniserverUsername);
        const password = String(settings.miniserverPassword);
        const uuid = String(settings.controlUuid);

        // Dial rotation cycles through scenes
        // Positive ticks = next scene (plus), negative ticks = previous scene (minus)
        const command = ev.payload.ticks > 0 ? 'plus' : 'minus';
        const url = `http://${username}:${password}@${host}:80/dev/sps/io/${uuid}/${command}`;
        const curlCommand = `curl -s -o nul -w "%{http_code}" "${url}"`;

        exec(curlCommand, (error, stdout) => {
            if (error) {
                console.error('[LightController] curl error:', error);
                return;
            }

            const statusCode = stdout.trim();
            if (statusCode === '200') {
                // Fetch updated scene immediately for responsive feedback
                this.fetchCurrentScene(ev.action, settings);
            }
        });
    }
}
