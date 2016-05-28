export type Status = "Hidden" | "Online" | "Away" | "Busy";

export interface Credentials {
  username: string;
  password: string;
}

export interface ParsedConversationId {
  raw: string; // "{prefix}:{username}"
  prefix: number; // 8 for normal users
  username: string;
}

export interface SendMessageResult {
  clientMessageId: string;
  arrivalTime: number;
  textContent: string;
}

export interface NewMessage {
  textContent: string;
}
