import { useEffect, useState } from "react";
import { getApiKey, getState, storeApiKey } from "../utils";
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
    {didUpdate && <div>Settings updated</div>}
    <input value={apiKey} onChange={e => setApiKey(e.target.value)} />
    <button onClick={updateApiKey}>Save</button>
    <button className="popup-btn btn-settings" onClick={onClose}><IconClose /></button>
  </div>
};