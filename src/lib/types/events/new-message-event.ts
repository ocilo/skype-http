import { $Date } from "kryo/builtins/date";
import { $Uint32 } from "kryo/builtins/uint32";
import { DocumentIoType, DocumentType } from "kryo/types/document";
import { LiteralType } from "kryo/types/literal";
import { $MessageResource, MessageResource } from "../resources/message-resource";
import { $Url } from "../url";
import { $EventResourceType, EventResourceType } from "./event-resource-type";
import { $EventType, EventType } from "./event-type";

export interface NewMessageEvent {
  id: number;
  type: EventType.EventMessage;
  resourceType: EventResourceType.NewMessage;
  time: Date;
  /**
   * https://{host}/v1/users/ME/conversations/{conversation}/messages/{id}
   */
  resourceLink: string;
  resource: MessageResource;
}

export const $NewMessageEvent: DocumentIoType<NewMessageEvent> = new DocumentType<NewMessageEvent>({
  properties: {
    id: {type: $Uint32},
    type: {
      type: new LiteralType<EventType.EventMessage>({
        type: $EventType,
        value: EventType.EventMessage,
      }),
    },
    resourceType: {
      type: new LiteralType<EventResourceType.NewMessage>({
        type: $EventResourceType,
        value: EventResourceType.NewMessage,
      }),
    },
    time: {type: $Date},
    resourceLink: {type: $Url},
    resource: {type: $MessageResource},
  },
});
