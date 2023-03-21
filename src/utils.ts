import { ExtensionState } from "./interface";

export function setState(key: keyof ExtensionState, value: any): Promise<void> {
  return chrome.storage.local.set({[key]: value});
}

export function getState(keys: keyof ExtensionState | Array<keyof ExtensionState>): Promise<{[key: string]: any}> {
  return chrome.storage.local.get(keys);
}
