import { useEffect, useState } from 'react';
import { ExtensionState, MessageType } from '../interface';
import { getState } from '../utils';
import './Popup.css'

function App() {
  const [extensionState, setExtensionState] = useState<ExtensionState>();

  useEffect(() => {
    chrome.storage.session.onChanged.addListener(onSessionStorageChange);
    getState(["isRecording", "streamId", "isLoading", "lastTabId", "recordingTabId"]).then((result) => {
      setExtensionState({
        isLoading: result.isLoading,
        isRecording: result.isRecording,
        lastTabId: result.lastTabId,
        recordingTabId: result.recordingTabId,
        streamId: result.streamId,
      } as ExtensionState)
    });

    return () => {
      chrome.storage.session.onChanged.removeListener(onSessionStorageChange);
    }
  }, []);

  const onSessionStorageChange = (changes: { [key: string]: chrome.storage.StorageChange; }) => {
    const newState = {...extensionState};
    Object.keys(changes).forEach((key) => {
      newState[key as keyof ExtensionState] = changes[key].newValue;
    });
    setExtensionState(newState);
  }

  const copyStreamUrl = () => {
    const url = `https://streams.bitmovin.com/${extensionState?.streamId}/embed`;
    navigator.clipboard.writeText(url);
  };

  const startRecording = () => {
    chrome.runtime.sendMessage({ type: MessageType.StartRecording });
  }

  const stopRecording = () => {
    chrome.runtime.sendMessage({ type: MessageType.StopRecording });
  }

  return (
    <main>
      <h3>StreamCast</h3>
      <div>
        {extensionState?.isRecording ? <button onClick={stopRecording}>Stop</button> : <button onClick={startRecording}>Record</button>}
        {extensionState?.streamId && <button onClick={copyStreamUrl}>Copy URL</button>}
        {extensionState?.isRecording && <div>Recording...</div>}
      </div>
      <div>{extensionState?.isLoading && <span>UPLOADING</span>}</div>
      {/* <div><button onClick={() => clearState()}>Clear state</button></div> */}
      <div>
        {extensionState?.streamId && <a href={`https://streams.bitmovin.com/${extensionState?.streamId}/embed`} target="_blank">Go to stream</a>}
      </div>
    </main>
  )
}

export default App
