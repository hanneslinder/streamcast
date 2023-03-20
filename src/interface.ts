export enum MessageType {
  StartRecording = "StartRecording",
  StopRecording = "StopRecording",
  RecordingActive = "RecordingActive",
}

export interface Message {
  type: MessageType;
  payload?: unknown;
}

export interface MessageSender {
  id?: string;
  origin?: string;
}
