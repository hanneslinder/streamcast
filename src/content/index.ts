import { Message, MessageSender, MessageType } from "../interface";

chrome.runtime.onMessage.addListener(messageListener);

async function messageListener(request: Message, _sender: MessageSender, sendResponse: (response: Message) => void) {
  console.log("Content Script received message: ", request);

  if (request.type === MessageType.StartRecording) {
    const options: DisplayMediaStreamOptions = {
      video: true,
      audio: true
    }
    await startCapture(options);

    sendResponse({ type: MessageType.RecordingActive });
  }
}

async function startCapture(displayMediaOptions: DisplayMediaStreamOptions) {
  let captureStream = null;

  try {
    captureStream = await navigator.mediaDevices.getDisplayMedia(
      displayMediaOptions
    );
  } catch (err) {
    console.error(`Error: ${err}`);
  }

  console.log(captureStream);
  return captureStream;
}