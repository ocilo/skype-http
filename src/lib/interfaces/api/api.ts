export type Status = "Hidden" | "Online" | "Away" | "Busy";

export interface Credentials {
  username: string;
  password: string;
}

export interface ParsedConversationId {
  raw: string; // "{prefix}:{username}"
  prefix: number; // "8" for normal users, "4" for pstn (public switched telephone network), "28" for agents (bots), "guest" for guests, and something for msn and lync ?
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

export interface ParsedId {
  id: string;
  typeKey: string;
}

export interface FullId extends ParsedId {
  typeName: string;
  raw: string;
}
