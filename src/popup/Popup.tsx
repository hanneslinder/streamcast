import { useEffect, useState } from 'react';
import { ExtensionState, Message, MessageType } from '../interface';
import './Popup.css'

function App() {
  const [extensionState, setExtensionState] = useState<ExtensionState>();

  useEffect(() => {
    chrome.runtime.onMessage.addListener(function (message: Message, sender, sendResponse) {
      if (message.type === MessageType.SyncState) {
        setExtensionState({...message.payload as ExtensionState});
      }
    });

    requestInitialState(); 
  }, []);

  const requestInitialState = async () => {
    const tabs = await chrome.tabs.query({active: true, currentWindow: true});
    const response = await chrome.tabs.sendMessage(tabs[0].id!!, {type: MessageType.SyncState});
    setExtensionState({...response.payload as ExtensionState});
  };

  const startRecording = async () => {
    const tabs = await chrome.tabs.query({active: true, currentWindow: true});
    const message: Message = {
      type: MessageType.StartRecording,
    }
    const response = await chrome.tabs.sendMessage(tabs[0].id!!, message);
  };

  return (
    <main>
      <h3>StreamCast</h3>
      <div>
        <button onClick={startRecording}>Start recording</button>
        <button onClick={requestInitialState}>request state</button>
        {/* {hasStream && <button onClick={copyStreamUrl}>Copy URL</button>} */}
        <div>{`Is recording? ${extensionState?.isRecording}`}</div>
      </div>
    </main>
  )
}

export default App
