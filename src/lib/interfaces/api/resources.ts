import {ParsedConversationId} from "./api";

export interface Resource {
  type: "Text" | "RichText" /* | "Typing" | ... */;
  id: string;
  composeTime: Date;
  arrivalTime: Date;
  from: ParsedConversationId; // username
  conversation: string; // conversationId
  content: string;
}

export interface TextResource extends Resource {
  type: "Text";
  clientId: string; // An id set by the client
  content: string;
}

export interface RichTextResource extends Resource {
  type: "RichText";
  clientId: string; // An id set by the client
  content: string;
}
