export enum MessageType {
  StartRecording = "StartRecording",
}

export interface Message {
  type: MessageType;
  payload?: unknown;
}

export interface ExtensionState {
  isRecording?: boolean;
  streamId?: string;
  isLoading?: boolean;
  lastTabId?: number;
}

export interface MessageSender {
  id?: string;
  origin?: string;
}
