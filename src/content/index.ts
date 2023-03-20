import { Message, MessageSender, MessageType } from "../interface";

chrome.runtime.onMessage.addListener(messageListener);

function messageListener(request: Message, _sender: MessageSender, sendResponse: (response: Message) => void) {
  console.log("Content Script received message: ", request);

  if (request.type === MessageType.TEST) {
    sendResponse({ type: MessageType.TEST, payload: "Response from ContentScript" });
  }
}