import { useEffect, useState } from 'react';
import { ExtensionState, Message, MessageType } from '../interface';
import './Popup.css'

function App() {
  const [extensionState, setExtensionState] = useState<ExtensionState>();

  useEffect(() => {
    chrome.storage.session.onChanged.addListener(onSessionStorageChange);
    chrome.storage.session.get("extensionState", (result) => setExtensionState(result.extensionState));

    return () => {
      chrome.storage.session.onChanged.removeListener(onSessionStorageChange);
    }
  }, []);

  const onSessionStorageChange = (changes: { [key: string]: chrome.storage.StorageChange; }) => {
    setExtensionState(changes.extensionState.newValue);
  }

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
