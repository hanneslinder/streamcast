import { Message, MessageSender, MessageType, ExtensionState } from "../interface";

chrome.runtime.onMessage.addListener(messageHandler);

async function messageHandler(request: Message, _sender: MessageSender, sendResponse: (response: Message) => void) {
  if (request.type === MessageType.StartRecording) {
    startRecording();
  }
};

function setState(extensionState: Partial<ExtensionState>) {
  chrome.storage.session.set({ extensionState });
}

const startRecording = async () => {
  await chrome.tabs.query({'active': true, 'lastFocusedWindow': true, 'currentWindow': true}, async function (tabs) {
    const currentTab = tabs[0];
    setState({ lastTabId: currentTab.id });

    await chrome.tabs.create({
      url: chrome.runtime.getURL('record_screen.html'),
      pinned: true,
      active: true,
    });
  });
};
