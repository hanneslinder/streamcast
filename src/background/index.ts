import { ExtensionState, Message, MessageSender, MessageType } from "../interface";
import BitmovinApi, { InputType } from '@bitmovin/api-sdk';
import { apiKey } from "../key";

chrome.runtime.onMessage.addListener(messageHandler);

async function messageHandler(request: Message, _sender: MessageSender, sendResponse: (response: Message) => void) {
  console.log("Background message listener");
  switch (request.type) {
    case MessageType.StartRecording:
      await startCapture();
      break;
  }
}

async function startCapture() {
  console.log("Start capture");
  await chrome.tabs.query({ active: true, lastFocusedWindow: true, currentWindow: true }, async (tabs) => {
    const currentTab = tabs[0];
    const tab = await chrome.tabs.create({ 
      url: chrome.runtime.getURL('record_screen.html'), 
      pinned: true,
      active: true
    });
    console.log("Got a tab");
    console.log(tab);

    chrome.tabs.onUpdated.addListener(async function listener(tabId, info) {
      if (tabId === tab.id && info.status === 'complete') {
        console.log("Tab updated");
        chrome.tabs.onUpdated.removeListener(listener);
  
        await chrome.tabs.sendMessage(tabId, {
          type: MessageType.StartRecordingOnBackground,
          payload: currentTab,
        });
      }
    });
  })
}

export const fn = {}
