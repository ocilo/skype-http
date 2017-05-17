import { ParsedConversationId } from "./api";
export interface CallParticipant {
  duration?: number;
  displayName: string;
  username: string;
}

export declare type ResourceType = "Text" | "RichText" | "Control/ClearTyping" | "Control/Typing" | "RichText/UriObject"
  | "RichText/Media_GenericFile" | "Signal/Flamingo" | "Event/Call" | "RichText/Location" | "ConversationUpdate"
  | "RichText/Media_Video";
export interface Resource {
  type: ResourceType;
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
export interface RichTextLocationResource extends Resource {
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  course: number;
  address: string;
  pointOfInterest: string;
  map_url: string;
}
export interface RichTextMediaGenericFileResource extends FileResource {
  type: "RichText/Media_GenericFile";
}
export interface RichTextMediaVideoResource extends FileResource {
  type: "RichText/Media_Video";
}
export interface RichTextUriObjectResource extends FileResource {
  type: "RichText/UriObject";
}
export interface FileResource extends Resource {
  uri_type: string;
  uri: string;
  uri_thumbnail: string;
  uri_w_login: string;
  file_size?: number;
  original_file_name: string;
}
export interface EventCallResource extends Resource {
  event_type: "started" | "ended";
  duration?: number; // duration of the shorted participant on the call
  call_connected: boolean; // if it was connected or missed
  skypeguid: string;
  participants: CallParticipant[];
}
export interface RichTextResource extends Resource {
  type: "RichText";
  clientId: string; // An id set by the client
  content: string;
}

export interface SignalFlamingoResource extends Resource { // incoming call request
  type: "Signal/Flamingo";
  skypeguid: string;

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
