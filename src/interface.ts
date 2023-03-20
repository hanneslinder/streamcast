export enum MessageType {
  StartRecordingOnBackground = "StartRecordingOnBackground",
  StartRecording = "StartRecording",
  StopRecording = "StopRecording",
  RecordingActive = "RecordingActive",
  SyncState = "SyncState",
}

export interface Message {
  type: MessageType;
  payload?: unknown;
}

export interface ExtensionState {
  isRecording: boolean;
  streamId?: string;
  isLoading?: boolean;
}

export interface MessageSender {
  id?: string;
  origin?: string;
}
