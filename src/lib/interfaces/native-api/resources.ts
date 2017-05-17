import { RichText, Text } from "./message-resources";

export interface Resource {
  type: "Message" | "UserPresenceDoc" | "EndpointPresenceDoc" | string;
  // If type is Message: a large integer, otherwise: "endpointMessagingService"
  id: string;
}
export interface ConversationUpdate extends Resource {
  id: string;
  type: string;
  lastMessage: Text;
}

export interface MessageResource extends Resource {
  type: "Message";
  messagetype: "Control/LiveState" | "Control/ClearTyping" | "Control/Typing" | "Event/Call"
  | "RichText" | "RichText/UriObject" | "RichText/Location" | "RichText/Media_GenericFile"
  | "RichText/Media_Video" | "Signal/Flamingo" | "Text" | string; // TODO
  ackrequired: string;
  // JSON date
  originalarrivaltime: string;
  /**
   * Instant Messaging Display Name ?
   *
   * display name of the author
   */
  imdisplayname: string;
  // https://{host}/v1/users/ME/conversations/{conversation}
  conversationLink: string;
  // JSON date
  composetime: string;
  isactive: boolean;
  // https://{host}/v1/users/ME/contacts/{contact}
  from: string;
  // same as `id`
  version: string;
  // Title of the group conversation
  threadtopic?: string;
}

export interface UserPresenceResource extends Resource {
  // TODO
  type: "UserPresenceDoc" | string;
  // https://{host}/v1/users/{user}/presenceDocs/endpointMessagingService" user is 8:username
  selfLink: string;
  // TODO
  availability: "Offline" | "Online" | string;
  // TODO
  status: "Offline" | "Online" | "Idle" | string;
  // looks like capabilities.join(" | ") where capabilities is one of ["Seamless", "SmsUpgrade", "IsMobile"];
  capabilities: string;
  // a JSON date
  lastSeenAt?: string;
  // https://{host}/v1/users/{user}/endpoints/{endpoint}/presenceDocs/endpointMessagingService
  endpointPresenceDocLinks: string[];
}

export interface EndpointPresenceResource extends Resource {
  // TODO
  type: "EndpointPresenceDoc" | string;
  // https://{host}/v1/users/{user}/endpoints/{endpoint}/presenceDocs/endpointMessagingService
  selfLink: string;
  publicInfo: {
    // looks like capabilities.join(" | ") where capabilities is one of ["Seamless", "SmsUpgrade"];
    // (no IsMobile apparently, as opposed to `UserPresenceResource`)
    capabilities: string;
    // TODO: known: ["11", "12", "13", "14", "16", "17"]
    typ: string;
    skypeNameVersion: string;
    // pattern: /^x[0-9a-f]{58}/
    nodeInfo: string;
    // TODO: known: ["24"]
    version: string;
  };

  privateInfo: {
    /**
     * Endpoint name
     *
     * Usually the name of the computer (host for Linux ?)
     */
    epname: string;
  };
}
