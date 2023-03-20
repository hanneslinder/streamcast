import { ExtensionState, Message, MessageSender, MessageType } from "../interface";
import BitmovinApi, { DirectFileUploadInput, InputType, StreamsVideoCreateRequest } from '@bitmovin/api-sdk';
import { apiKey } from "../key";

chrome.runtime.onMessage.addListener(messageListener);

const bitmovinApi = new BitmovinApi({apiKey});
const recordedChunks: BlobPart[] = [];

let mediaRecorder: MediaRecorder;
let extensionState: ExtensionState = {
  isRecording: false,
}

async function messageListener(request: Message, _sender: MessageSender, sendResponse: (response: Message) => void) {
  console.log("Content Script received message: ", request);

  switch (request.type) {
    case MessageType.StartRecording:
      await startCapture();
      sendResponse({ type: MessageType.RecordingActive });
      break;
    case MessageType.StopRecording:
      stopRecording();
      break;
    case MessageType.SyncState:
      console.log(extensionState);
      sendResponse({ type: MessageType.SyncState, payload: extensionState });
      break;
  }
}

function setState(state: Partial<ExtensionState>) {
  extensionState = {...extensionState, ...state};

  const message: Message = {
    type: MessageType.SyncState,
    payload: extensionState
  };

  chrome.runtime.sendMessage(message, function (response) {
    console.dir(response);
  });
}

async function startCapture() {
  const displayMediaOptions: DisplayMediaStreamOptions = { video: true, audio: true }
  let captureStream: MediaStream;

  captureStream = await navigator.mediaDevices.getDisplayMedia(
    displayMediaOptions
  );

  mediaRecorder = new MediaRecorder(captureStream)
  mediaRecorder.ondataavailable = (event) => handleDataAvailable(event);
  mediaRecorder.start();

  setState({ isRecording: true });
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
  setState({ isRecording: false, isLoading: true });
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

  setState({ streamId: stream.id, isLoading: false });
}
