import { Message, MessageType } from '../interface';
import './Popup.css'

function App() {
  const sendMessage = async () => {
    const tabs = await chrome.tabs.query({active: true, currentWindow: true});
    const message: Message = {
      type: MessageType.TEST,
      payload: "Hello from Popup"
    }
    const response = await chrome.tabs.sendMessage(tabs[0].id!!, message);
    console.log(response);
  };

  return (
    <main>
      <h3>StreamCast</h3>
      <div><button onClick={sendMessage}>MESSAGE</button></div>
    </main>
  )
}

export default App
