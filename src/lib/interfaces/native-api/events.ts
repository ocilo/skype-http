import {
  EndpointPresenceResource,
  MessageResource,
  Resource,
  UserPresenceResource,
} from "./resources";

export interface EventMessage {
  id: number;
  type: "EventMessage";
  // TODO: check the available types
  resourceType: "NewMessage" | "UserPresence" | "EndpointPresence" | string;
  time: string;
  // https://{host}/v1/users/ME/conversations/{conversation}/messages/{id}
  resourceLink: string;
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
