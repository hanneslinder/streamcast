import { useEffect, useState } from 'react';
import { ExtensionState, Message, MessageType } from '../interface';
import './Popup.css'

function App() {
  const [extensionState, setExtensionState] = useState<ExtensionState>();

  useEffect(() => {
    chrome.runtime.onMessage.addListener(function (message: Message, sender, sendResponse) {
      if (message.type === MessageType.UpdateState) {
        console.log("State update");
        console.log(message.payload);
        setExtensionState({...message.payload as ExtensionState});
      }
    });

    requestInitialState(); 
  }, []);

  const requestInitialState = async () => {
    const tabs = await chrome.tabs.query({active: true, currentWindow: true});
    const response = await chrome.tabs.sendMessage(tabs[0].id!!, {type: MessageType.GetState});
    setExtensionState({...response.payload as ExtensionState});
  };

  const copyStreamUrl = () => {
    const url = `https://streams.bitmovin.com/${extensionState?.streamId}/embed`;
    navigator.clipboard.writeText(url);
  };

  const startRecording = () => {
    const message: Message = {
      type: MessageType.StartRecording
    }
    chrome.runtime.sendMessage(message, function(response) { 
      console.log(response);
    });
  }

  return (
    <main>
      <h3>StreamCast</h3>
      <div>
        <button onClick={startRecording}>Record</button>
        {extensionState?.streamId && <button onClick={copyStreamUrl}>Copy URL</button>}
        {extensionState?.isRecording && <div>Recording...</div>}
      </div>
      <div>{extensionState?.isLoading && <span>UPLOADING</span>}</div>
      <div>
      {extensionState?.streamId && <a href={`https://streams.bitmovin.com/${extensionState?.streamId}/embed`} target="_blank">Go to stream</a> }
      </div>
    </main>
  )
}

export default App
