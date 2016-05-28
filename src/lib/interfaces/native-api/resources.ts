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
