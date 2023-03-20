import { Message, MessageSender, MessageType } from "../interface";

chrome.runtime.onMessage.addListener(messageHandler);

async function messageHandler(request: Message, _sender: MessageSender, sendResponse: (response: Message) => void) {
  if (request.type === MessageType.StartRecording) {
    startRecording();
  }
};

const startRecording = async () => {
  await chrome.tabs.query({'active': true, 'lastFocusedWindow': true, 'currentWindow': true}, async function (tabs) {
    const currentTab = tabs[0];
    const tab = await chrome.tabs.create({
      url: chrome.runtime.getURL('record_screen.html'),
      pinned: true,
      active: true,
    });

    // Wait for recording screen tab to be loaded and send message to it with the currentTab
    chrome.tabs.onUpdated.addListener(async function listener(tabId, info) {
      if (tabId === tab.id && info.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);

        setTimeout(() => {
          chrome.tabs.sendMessage(tabId, {
            type: MessageType.StartRecordingOnBackground,
            payload: currentTab
          });
        }, 100); // TODO: HACKY HACK
      }
    });
  });
};
