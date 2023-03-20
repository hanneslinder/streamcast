import { Message, MessageSender, MessageType } from "./interface";
import BitmovinApi, { InputType } from '@bitmovin/api-sdk';
import { apiKey } from "./key";

const bitmovinApi = new BitmovinApi({apiKey});

chrome.runtime.onMessage.addListener(messageHandler);

async function messageHandler(request: Message, _sender: MessageSender, _sendResponse: (response: Message) => void) {
  if (request.type === MessageType.StartRecordingOnBackground) {
    startCapture(request.payload as chrome.tabs.Tab);
  }
};

function startCapture(currentTab: chrome.tabs.Tab) {
  chrome.desktopCapture.chooseDesktopMedia(
    ['screen', 'window', "tab"],
    function (streamId) {
      if (streamId == null) {
        return;
      }

      const videoOptions = {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: streamId,
        }
      };

      // Once user has chosen screen or window, create a stream from it and start recording
      navigator.mediaDevices.getUserMedia({
        audio: false,
        video: videoOptions as any
      }).then(stream => {
        const mediaRecorder = new MediaRecorder(stream);

        const chunks: any[] = [];

        mediaRecorder.ondataavailable = function(e) {
          chunks.push(e.data);
        };

        mediaRecorder.onstop = async function(e) {
          download(chunks);
          stream.getTracks().forEach(track => track.stop());
        }

        mediaRecorder.start();
      }).finally(async () => {
        // After all setup, focus on previous tab (where the recording was requested)
        await chrome.tabs.update(currentTab.id!!, { active: true, selected: true })
      });
    })
};

function download(recordedChunks: BlobPart[]) {
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
