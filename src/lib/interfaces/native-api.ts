export interface EventMessage {
  id: number;
  type: "EventMessage";
  resourceType: "NewMessage" | "UserPresence" | "EndpointPresence" | string; // TODO: check the available types
  time: string;
  resourceLink: string; // https://{host}/v1/users/ME/conversations/{conversation}/messages/{id}
  resource: Resource;
}

export interface EventNewMessage extends EventMessage {
  resourceType: "NewMessage";
  resource: MessageResource;
}

export interface EventUserPresence extends EventMessage {
  resourceType: "UserPresence";
  resource: UserPresenceResource;
}

export interface EventEndpointPresence extends EventMessage {
  resourceType: "EndpointPresence";
  resource: EndpointPresenceResource;
}

export interface Resource {
  type: "Message" | "UserPresenceDoc" | "EndpointPresenceDoc" | string;
  id: string; // If type is Message: a large integer, otherwise: "endpointMessagingService"
}

export interface MessageResource extends Resource {
  type: "Message";
  messagetype: "Control/LiveState" | "Control/ClearTyping" | "Control/Typing" | "Event/Call" | "RichText" | "RichText/UriObject" | "Text" | string; // TODO
  ackrequired: string;
  originalarrivaltime: string; // JSON date
  imdisplayname: string; // display name of the author
  conversationLink: string; // https://{host}/v1/users/ME/conversations/{conversation}
  composetime: string; // JSON date
  isactive: boolean;
  from: string; // https://{host}/v1/users/ME/contacts/{contact}
  version: string; // same as `id`
  threadtopic?: string; // Title of the group conversation
}

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

export interface UserPresenceResource extends Resource {
  type: "UserPresenceDoc" | string; // TODO
  selfLink: string; // https://{host}/v1/users/{user}/presenceDocs/endpointMessagingService" user is 8:username
  availability: "Offline" | "Online" | string; // TODO
  status: "Offline" | "Online" | "Idle" | string; // TODO
  capabilities: string; // looks like capabilities.join(" | ") where capabilities is one of ["Seamless", "SmsUpgrade", "IsMobile"];
  lastSeenAt?: string; // a JSON date
  endpointPresenceDocLinks: string[]; // https://{host}/v1/users/{user}/endpoints/{endpoint}/presenceDocs/endpointMessagingService
}

export interface EndpointPresenceResource extends Resource {
  type: "EndpointPresenceDoc" | string; // TODO
  selfLink: string; // https://{host}/v1/users/{user}/endpoints/{endpoint}/presenceDocs/endpointMessagingService
  publicInfo: {
    capabilities: string; // looks like capabilities.join(" | ") where capabilities is one of ["Seamless", "SmsUpgrade"]; (no IsMobile apparently)
    typ: string; // TODO: known: ["11", "12", "13", "14", "16", "17"]
    skypeNameVersion: string;
    nodeInfo: string; // pattern: /^x[0-9a-f]{58}/
    version: string; // TODO: known: ["24"]
  };
  privateInfo: {
    epname: string; // Endpoint name (ie: computer name)
  };
}

export interface ThreadProperties {
  topic?: string;
  lastjoinat?: string; // a timestamp ? example: "1421342788493"
  version?: string; // a timestamp ? example: "1464029299838"
}

export interface EmptyObject {}

export interface Conversation {
  targetLink: string; // https://{host}/v1/threads/{19:threadId} or // https://{host}/v1/users/ME/contacts/{8:contactId}
  threadProperties?: ThreadProperties;
  id: string;
  type: "Conversation" | string;
  version: number; // a timestamp ? example: 1464030261015
  properties: {
    consumptionhorizon?: string; // example: "1461605505609;1461605570732;10435004700722293356"
  };
  lastMessage: EmptyObject | MessageResource;
  messages: string; // https://{host}/v1/users/ME/contacts/{thread}/messages (even if targetLink points to /v1/threads)
}

export type Capability = "AddMember" | "ChangeTopic" | "ChangePicture" | "EditMsg" | "CallP2P" | "SendText" | "SendSms"
  | "SendContacts" | "SendVideoMsg" | "SendMediaMsg" | "ChangeModerated";

export interface ThreadMember {
  id: string; // "8:..."
  userLink: string; // url https://{host}/v1/users/{user}
  role: "User" | "Admin" | string;
  capabilities: any[];
  linkedMri: string; // can be an empty string
  userTile: string; // can be an empty string
  friendlyName: string; // can be an empty string
}

export interface Thread {
  id: string; // "19:..."
  type: "Thread" | string; // enum ?
  properties: {
    createdat: string; // epoch ?
    creator: string; // creator id, "8:..."
    topic: string;
    joiningenabled: "true" | "false" | string; // "true" or "false"
    capabilities: Capability[];
    lastjoinat?: string; // TODO: check
    version?: string; // TODO: check
  };
  members: ThreadMember[];
  version: number; // epoch ?
  messages: string; // https://{host}/v1/users/ME/contacts/{thread}/messages (even if targetLink points to /v1/threads)
}
