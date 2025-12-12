/**
 * Loxone Smart Home Stream Deck Plugin
 */

import streamDeck from "@elgato/streamdeck";

// Import all actions
import { SwitchAction } from "./actions/switch-action.js";
import { DimmerAction } from "./actions/dimmer-action.js";
import { BlindAction } from "./actions/blind-action.js";
import { PulseAction } from "./actions/pulse-action.js";

// Set log level
streamDeck.logger.setLevel("info");

// Register actions
streamDeck.actions.registerAction(new SwitchAction());
streamDeck.actions.registerAction(new DimmerAction());
streamDeck.actions.registerAction(new BlindAction());
streamDeck.actions.registerAction(new PulseAction());

// Connect to Stream Deck
streamDeck.connect();

console.log("Loxone Smart Home plugin started");
