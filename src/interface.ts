export enum MessageType {
  TEST = "TEST",
}

export interface Message {
  type: MessageType;
  payload: unknown;
}

export interface MessageSender {
  id?: string;
  origin?: string;
}
