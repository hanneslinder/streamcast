import { Message, MessageSender, MessageType } from "../interface";

chrome.runtime.onMessage.addListener(messageListener);

const recordedChunks: BlobPart[] = [];

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
  let captureStream: MediaStream;

  captureStream = await navigator.mediaDevices.getDisplayMedia(
    displayMediaOptions
  );

  console.log(captureStream);
  const mediaRecorder = new MediaRecorder(captureStream)

  mediaRecorder.ondataavailable = (event) => handleDataAvailable(event);
  return captureStream;
}

function handleDataAvailable(event: BlobEvent) {
  console.log("data-available");
  if (event.data.size > 0) {
    recordedChunks.push(event.data);
    console.log(recordedChunks);
    download();
  } else {
    
  }
}

function download() {
  const blob = new Blob(recordedChunks, {
    type: "video/webm",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  document.body.appendChild(a);
  a.setAttribute("style", "display: none");
  a.href = url;
  a.download = "test.webm";
  a.click();
  window.URL.revokeObjectURL(url);
}
