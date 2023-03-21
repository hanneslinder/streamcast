import { useEffect, useState } from 'react';
import { ExtensionState, MessageType } from '../interface';
import { getApiKey, getState, setState, storeApiKey } from '../utils';
import { IconSettings } from './Icons';
import './Popup.css'
import { Settings } from './Settings';

function App() {
  const [extensionState, setExtensionState] = useState<ExtensionState>();
  const [showSettings, setShowSettings] = useState<boolean>(false);

  useEffect(() => {
    chrome.storage.session.onChanged.addListener(onSessionStorageChange);
    getState(["isRecording", "streamId", "isLoading", "lastTabId", "recordingTabId", "error"]).then((result) => {
      setExtensionState({
        isLoading: result.isLoading,
        isRecording: result.isRecording,
        lastTabId: result.lastTabId,
        recordingTabId: result.recordingTabId,
        streamId: result.streamId,
        error: result.error,
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
    setState("error", "");
    chrome.runtime.sendMessage({ type: MessageType.StartRecording });
  }

  const stopRecording = () => {
    chrome.runtime.sendMessage({ type: MessageType.StopRecording });
  }

  if (showSettings) {
    return <main>
      <Settings onClose={() => setShowSettings(false)} />
    </main>
  }

  const renderError = (error: string) => {
    return <div className="popup-error">{error}</div>
  }

  return (
    <main>
      <h3>StreamCast</h3>
      <div>
        {extensionState?.isRecording ? <button className="text-button btn-stop" onClick={stopRecording}>Stop</button> : <button className="text-button btn-start" onClick={startRecording}>Record</button>}
        {extensionState?.streamId && <button className="text-button btn-copy" onClick={copyStreamUrl}>Copy URL</button>}
        {extensionState?.isRecording && <div>Recording...</div>}
      </div>
      <div>{extensionState?.isLoading && <span>UPLOADING</span>}</div>
      {extensionState?.error && renderError(extensionState.error) }
      <div>
        {extensionState?.streamId && <a href={`https://streams.bitmovin.com/${extensionState?.streamId}/embed`} target="_blank">Go to stream</a>}
      </div>
      <button className="icon-button btn-settings" onClick={() => setShowSettings(true)}><IconSettings /></button>
    </main>
  )
}

export default App
