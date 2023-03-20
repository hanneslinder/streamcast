import { Message, MessageSender, MessageType } from "../interface";
import BitmovinApi, { DirectFileUploadInput, InputType, StreamsVideoCreateRequest } from '@bitmovin/api-sdk';
import { apiKey } from "../key";

const bitmovinApi = new BitmovinApi({apiKey});

chrome.runtime.onMessage.addListener(messageListener);

const recordedChunks: BlobPart[] = [];
let mediaRecorder: MediaRecorder;
let isRecording = false;

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

  if (request.type === MessageType.StopRecording) {
    stopRecording();
  }

  if (request.type === MessageType.UploadFile) {
    uploadFile();
  }
}

async function startCapture(displayMediaOptions: DisplayMediaStreamOptions) {
  let captureStream: MediaStream;

  captureStream = await navigator.mediaDevices.getDisplayMedia(
    displayMediaOptions
  );

  console.log(captureStream);
  mediaRecorder = new MediaRecorder(captureStream)
  mediaRecorder.ondataavailable = (event) => handleDataAvailable(event);
  mediaRecorder.start();

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

async function uploadFile(file?: Blob) {
  console.log("Upload file test");
  const input = await bitmovinApi.encoding.inputs.directFileUpload.create({ type: InputType.DIRECT_FILE_UPLOAD, name: "streamcast-test"});
  const inputId = input.id;
  const uploadUrl = input.uploadUrl;

  await fetch(uploadUrl!!, { method: 'PUT', body: file });
  const assetUrl = `https://api.bitmovin.com/v1/encoding/inputs/direct-file-upload/${inputId}`;

  const requestData = {assetUrl, name: "streamcast-test" };
  const stream = await bitmovinApi.streams.video.create(requestData);

  console.log(stream);
  console.log(`https://streams.bitmovin.com/${stream.id}/embed`);
}
