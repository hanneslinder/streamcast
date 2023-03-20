import { ExtensionState, Message, MessageSender, MessageType } from "./interface";
import BitmovinApi, { InputType } from '@bitmovin/api-sdk';
import { apiKey } from "./key";

const bitmovinApi = new BitmovinApi({apiKey});

startCapture();

function setState(newState: Partial<ExtensionState>) {
  chrome.storage.session.get("extensionState", (result) => {
    let extensionState : ExtensionState = { ...result.extensionState, ...newState };
    console.log(extensionState)
    chrome.storage.session.set({ extensionState });
  })
}

function startCapture() {
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
        setState({ isRecording: true });

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
        chrome.storage.session.get("extensionState", ({extensionState}) => {
          chrome.tabs.update(extensionState.lastTabId!!, { active: true, selected: true });
        })
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
  setState({isLoading: true});
  const input = await bitmovinApi.encoding.inputs.directFileUpload.create({ type: InputType.DIRECT_FILE_UPLOAD, name: "streamcast-test"});
  const inputId = input.id;
  const uploadUrl = input.uploadUrl;

  await fetch(uploadUrl!!, { method: 'PUT', body: file });
  const assetUrl = `https://api.bitmovin.com/v1/encoding/inputs/direct-file-upload/${inputId}`;

  const requestData = {assetUrl, title: "streamcast-test" };
  const stream = await bitmovinApi.streams.video.create(requestData);

  setState({ isRecording: false, isLoading: false, streamId: stream.id });
  console.log(stream);
}
