/**
 * Loxone Switch Action with State Tracking
 */

import { action, KeyDownEvent, DidReceiveSettingsEvent, SingletonAction, WillAppearEvent, WillDisappearEvent } from "@elgato/streamdeck";
import { LoxoneConnectionManager, type LoxoneSettings } from "./loxone-action.js";
import { exec } from "child_process";

@action({ UUID: "com.loxone.smartthome.switch" })
export class SwitchAction extends SingletonAction<LoxoneSettings> {
    // Track the state of each switch by action ID
    private switchStates = new Map<string, boolean>();
    // Track polling intervals for each action
    private pollingIntervals = new Map<string, NodeJS.Timeout>();
    // Poll every 5 seconds
    private readonly POLL_INTERVAL_MS = 5000;

    override async onWillAppear(ev: WillAppearEvent<LoxoneSettings>): Promise<void> {
        const settings = ev.payload.settings;

        if (!settings.miniserverHost || !settings.miniserverUsername || !settings.miniserverPassword) {
            await ev.action.setTitle("Configure");
            return;
        }

        // Initialize state as OFF
        this.switchStates.set(ev.action.id, false);

        // Update the button appearance
        await this.updateButtonState(ev.action, false, settings.controlName);

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

        // Clean up state when button is removed
        this.switchStates.delete(ev.action.id);
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

        // Get the current state from Loxone status endpoint
        const url = `http://${username}:${password}@${host}:80/data/LoxAPP3.json`;
        const curlCommand = `curl -s "${url}"`;

        exec(curlCommand, (error, stdout, stderr) => {
            if (error) {
                console.error('[Switch] Failed to fetch state:', error);
                return;
            }

            try {
                const data = JSON.parse(stdout);
                const control = data.controls?.[uuid];

                if (control && control.states) {
                    // For regular switches, check states.active
                    const isOn = control.states.active === 1;

                    this.switchStates.set(action.id, isOn);
                    this.updateButtonState(action, isOn, settings.controlName);
                }
            } catch (e) {
                console.error('[Switch] Failed to parse state:', e);
            }
        });
    }

    private async updateButtonState(action: any, isOn: boolean, controlName?: string | unknown): Promise<void> {
        const name = controlName ? String(controlName) : 'Switch';
        const stateText = isOn ? 'ON' : 'OFF';

        // Set the title with state
        await action.setTitle(`${name}\n${stateText}`);

        // Set the state (0 = off/default, 1 = on/active)
        await action.setState(isOn ? 1 : 0);
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

        // Get current state
        const currentState = this.switchStates.get(ev.action.id) || false;
        const newState = !currentState;

        // Send the appropriate command
        const command = newState ? 'On' : 'Off';
        const url = `http://${username}:${password}@${host}:80/dev/sps/io/${uuid}/${command}`;
        const curlCommand = `curl -s -o nul -w "%{http_code}" "${url}"`;

        exec(curlCommand, (error, stdout, stderr) => {
            if (error) {
                console.error('[Switch] curl error:', error);
                ev.action.showAlert();
                return;
            }

            const statusCode = stdout.trim();
            console.log(`[Switch] HTTP response code: ${statusCode}, sent: ${command}`);

            if (statusCode === '200') {
                // Update local state
                this.switchStates.set(ev.action.id, newState);
                this.updateButtonState(ev.action, newState, settings.controlName);
                ev.action.showOk();
            } else {
                console.error(`[Switch] HTTP error: ${statusCode}`);
                ev.action.showAlert();
            }
        });
    }
}
