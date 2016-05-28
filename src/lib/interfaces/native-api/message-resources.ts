import {MessageResource} from "./resources";

export interface Control extends MessageResource {
  messagetype: "Control/LiveState" | "Control/ClearTyping" | "Control/Typing";
}

export interface ControlClearTyping extends Control {
  messagetype: "Control/ClearTyping";
}

export interface ControlTyping extends Control {
  messagetype: "Control/Typing";
}

export interface ControlLiveState extends Control {
  messagetype: "Control/LiveState";
  content: string; // seen: "1/2 {username} 1 10 {JSON.stringify(ControlLiveStateContent)}"
}

// stringified in ControlLiveState.content
export interface ControlLiveStateContent {
  AccessToken: "NgAccessToken" | string; // TODO
  GUID: string; // [0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}
  MaxLiveParticipants: number;
  NodeInfo: string; // 40 chars long base64 string ?
  Participants: Array<{
    Identity: string; // username
    LiveIdentity: string; // username
    VoiceStatus: number; // seen: [4, 7]
    LiveStartTimestamp: number; // seen: [0, 1463345492]
  }>;
  Statistics: Array<{
    Id: string; // username
    LiveId: string; // username
    CumTime: number; // seen: [0]
  }>;
  Part: {
    Identity: string; // username
    LiveIdentity: string; // username
    VoiceStatus: number; // seen: [4]
    LiveStartTimestamp: number; // seen: [0, 1463345492]
  };
  Stats: {
    Id: string; // username
    LiveId: string; // username
    CumTime: number; // seen: [0]
  };
}

export interface EventCall extends MessageResource {
  messagetype: "Event/Call";
  clientmessageid: string; // A large integer (~20 digits)
  content: string; // XML with root <partlist>
  skypeguid: string; // [0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}
}

export interface Text extends MessageResource {
  messagetype: "Text";
  clientmessageid: string; // A large integer (~20 digits)
  content: string;
}

export interface RichText extends MessageResource {
  messagetype: "RichText";
  clientmessageid: string; // A large integer (~20 digits)
  content: string; // For example when using smileys: "Hi <ss type=\"smile\">:)</ss>"
}

export interface UriObject extends MessageResource {
  messagetype: "RichText/UriObject";
  clientmessageid: string; // A large integer (~20 digits)
  content: string; // XML, root is <URIObject>
}
