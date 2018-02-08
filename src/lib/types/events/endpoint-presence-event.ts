import { $Date } from "kryo/builtins/date";
import { $Uint32 } from "kryo/builtins/uint32";
import { DocumentIoType, DocumentType } from "kryo/types/document";
import { LiteralType } from "kryo/types/literal";
import { $EndpointPresenceDocResource, EndpointPresenceDocResource } from "../resources/endpoint-presence-doc-resource";
import { $Url } from "../url";
import { $EventResourceType, EventResourceType } from "./event-resource-type";
import { $EventType, EventType } from "./event-type";

export interface EndpointPresenceEvent {
  id: number;
  type: EventType.EventMessage;
  resourceType: EventResourceType.EndpointPresence;
  time: Date;
  resourceLink: string;
  resource: EndpointPresenceDocResource;
}

export const $EndpointPresenceEvent: DocumentIoType<EndpointPresenceEvent> = new DocumentType<EndpointPresenceEvent>({
  properties: {
    id: {type: $Uint32},
    type: {
      type: new LiteralType<EventType.EventMessage>({
        type: $EventType,
        value: EventType.EventMessage,
      }),
    },
    resourceType: {
      type: new LiteralType<EventResourceType.EndpointPresence>({
        type: $EventResourceType,
        value: EventResourceType.EndpointPresence,
      }),
    },
    time: {type: $Date},
    resourceLink: {type: $Url},
    resource: {type: $EndpointPresenceDocResource},
  },
});
