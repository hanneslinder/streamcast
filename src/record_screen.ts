import { ExtensionState, Message, MessageSender, MessageType } from "./interface";
import BitmovinApi, { InputType } from '@bitmovin/api-sdk';
import { apiKey } from "./key";

const bitmovinApi = new BitmovinApi({apiKey});
const recordedChunks: BlobPart[] = [];

let mediaRecorder: MediaRecorder;
let extensionState: ExtensionState = {
  isRecording: false,
}

chrome.runtime.onMessage.addListener(messageHandler);

async function messageHandler(request: Message, _sender: MessageSender, sendResponse: (response: Message) => void) {
  console.log("Background message listener");
  switch (request.type) {
    case MessageType.StartRecordingOnBackground:
      await startCapture(request.payload as string);
      break;
  }
}

async function startCapture(currentTab: string) {
  const displayMediaOptions: DisplayMediaStreamOptions = { video: true, audio: true }
  let captureStream: MediaStream;

  captureStream = await navigator.mediaDevices.getDisplayMedia(
    displayMediaOptions
  );

  mediaRecorder = new MediaRecorder(captureStream)
  mediaRecorder.ondataavailable = (event) => handleDataAvailable(event);
  mediaRecorder.start();

  return captureStream;
}

function handleDataAvailable(event: BlobEvent) {
  if (event.data.size > 0) {
    recordedChunks.push(event.data);
    console.log(recordedChunks);
    download();
  }
}

function stopRecording() {
  mediaRecorder.stop();
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

  uploadFile(blob);
}

async function uploadFile(file: Blob) {
  const input = await bitmovinApi.encoding.inputs.directFileUpload.create({ type: InputType.DIRECT_FILE_UPLOAD, name: "streamcast-test"});
  const inputId = input.id;
  const uploadUrl = input.uploadUrl;

  await fetch(uploadUrl!!, { method: 'PUT', body: file });
  const assetUrl = `https://api.bitmovin.com/v1/encoding/inputs/direct-file-upload/${inputId}`;

  const requestData = {assetUrl, title: "streamcast-test" };
  const stream = await bitmovinApi.streams.video.create(requestData);

  console.log(stream);
}