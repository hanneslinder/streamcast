import { useEffect, useState } from "react";
import { clearState, getApiKey, getState, storeApiKey } from "../utils";
import { IconClose } from "./Icons";

interface Props {
  onClose: () => void;
}

export const Settings: React.FC<Props> = ({onClose}) => {
  const [apiKey, setApiKey] = useState<string>("");
  const [didUpdate, setDidUpdate] = useState<boolean>(false);

  useEffect(() => {
    chrome.storage.sync.onChanged.addListener(onApiKeyChange);

    getApiKey().then((apiKey) => {
      setApiKey(apiKey);
    });

    return () => {
      chrome.storage.sync.onChanged.removeListener(onApiKeyChange);
    }
  }, []);

  const onApiKeyChange = (changes: { [key: string]: chrome.storage.StorageChange; }) => {
    if (changes.apiKey && changes.apiKey.newValue) {
      setApiKey(changes.apiKey.newValue);
    }
  };

  const updateApiKey = () => {
    storeApiKey(apiKey);
    setDidUpdate(true);
  };

  return <div className="popup-settings">
    <button className="icon-button btn-settings" onClick={onClose}><IconClose /></button>

    {didUpdate && <div className="settings-update-msg">Settings updated!</div>}
    <div className="settings-container">
      <div className="settings-item">
        <label htmlFor="api-key">Bitmovin API key</label>
        <div>
          <input id="api-key" type="text" value={apiKey} onChange={e => setApiKey(e.target.value)} />
          <button className="text-button" onClick={updateApiKey}>Save</button>
        </div>
      </div>
    </div>
  </div>
};