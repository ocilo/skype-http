import {Resource, EndpointPresenceResource, MessageResource, UserPresenceResource} from "./resources";

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
