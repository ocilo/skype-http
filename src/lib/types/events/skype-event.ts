import { TaggedUnionType } from "kryo/types/tagged-union";
import { $EndpointPresenceEvent, EndpointPresenceEvent } from "./endpoint-presence-event";
import { $NewMessageEvent, NewMessageEvent } from "./new-message-event";
import { $UserPresenceEvent, UserPresenceEvent } from "./user-presence-event";

export type SkypeEvent = EndpointPresenceEvent | NewMessageEvent | UserPresenceEvent;

export const $SkypeEvent: TaggedUnionType<SkypeEvent> = new TaggedUnionType<SkypeEvent>({
  variants: [
    $EndpointPresenceEvent,
    $NewMessageEvent,
    $UserPresenceEvent,
  ],
  tag: "resourceType",
});
