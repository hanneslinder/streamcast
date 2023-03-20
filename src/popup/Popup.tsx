import { Message, MessageType } from '../interface';
import './Popup.css'

function App() {
  const startRecording = async () => {
    const tabs = await chrome.tabs.query({active: true, currentWindow: true});
    const message: Message = {
      type: MessageType.StartRecording,
    }
    const response = await chrome.tabs.sendMessage(tabs[0].id!!, message);
    console.log(response);
  };

  return (
    <main>
      <h3>StreamCast</h3>
      <div><button onClick={startRecording}>Start recording</button></div>
    </main>
  )
}

export default App
