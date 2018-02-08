import { $Date } from "kryo/builtins/date";
import { $Uint32 } from "kryo/builtins/uint32";
import { DocumentIoType, DocumentType } from "kryo/types/document";
import { LiteralType } from "kryo/types/literal";
import { $UserPresenceDocResource, UserPresenceDocResource } from "../resources/user-presence-doc-resource";
import { $Url } from "../url";
import { $EventResourceType, EventResourceType } from "./event-resource-type";
import { $EventType, EventType } from "./event-type";

export interface UserPresenceEvent {
  id: number;
  type: EventType.EventMessage;
  resourceType: EventResourceType.UserPresence;
  time: Date;
  resourceLink: string;
  resource: UserPresenceDocResource;
}

export const $UserPresenceEvent: DocumentIoType<UserPresenceEvent> = new DocumentType<UserPresenceEvent>({
  properties: {
    id: {type: $Uint32},
    type: {
      type: new LiteralType<EventType.EventMessage>({
        type: $EventType,
        value: EventType.EventMessage,
      }),
    },
    resourceType: {
      type: new LiteralType<EventResourceType.UserPresence>({
        type: $EventResourceType,
        value: EventResourceType.UserPresence,
      }),
    },
    time: {type: $Date},
    resourceLink: {type: $Url},
    resource: {type: $UserPresenceDocResource},
  },
});
