import {ParsedConversationId} from "./api";

export interface Resource {
  type: "Text" | "RichText" | "Control/ClearTyping" | "Control/Typing" | "ConversationUpdate" /* | "Typing" | ... */;
  id: string;
  composeTime: Date;
  arrivalTime: Date;
  from: ParsedConversationId; // username
  conversation: string; // conversationId
  native?: any;
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

export interface ControlClearTypingResource extends Resource {
  type: "Control/ClearTyping";
}

export interface ControlTypingResource extends Resource {
  type: "Control/Typing";
}
export interface ConversationUpdateResource extends Resource {
  type: "ConversationUpdate";
  clientId: string; // An id set by the client
  content: string;
}
