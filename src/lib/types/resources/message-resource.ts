import { TaggedUnionType } from "kryo/types/tagged-union";
import { $ControlClearTypingMessage, ControlClearTypingMessage } from "./control-clear-typing-message";
import { $ControlLiveStateMessage, ControlLiveStateMessage } from "./control-live-state-message";
import { $ControlTypingMessage, ControlTypingMessage } from "./control-typing-message";
import { $EventCallMessage, EventCallMessage } from "./event-call-message";
import { $RichTextLocationMessage, RichTextLocationMessage } from "./rich-text-location-message";
import {
  $RichTextMediaGenericFileMessage,
  RichTextMediaGenericFileMessage,
} from "./rich-text-media-generic-file-message";
import { $RichTextMediaVideoMessage, RichTextMediaVideoMessage } from "./rich-text-media-video-message";
import { $RichTextMessage, RichTextMessage } from "./rich-text-message";
import { $RichTextUriObjectMessage, RichTextUriObjectMessage } from "./rich-text-uri-object-message";
import { $SignalFlamingoMessage, SignalFlamingoMessage } from "./signal-flamingo-message";
import { $TextMessage, TextMessage } from "./text-message";

export type MessageResource =
  ControlClearTypingMessage
  | ControlLiveStateMessage
  | ControlTypingMessage
  | EventCallMessage
  | RichTextMessage
  | RichTextUriObjectMessage
  | RichTextLocationMessage
  | RichTextMediaGenericFileMessage
  | RichTextMediaVideoMessage
  | SignalFlamingoMessage
  | TextMessage;

export const $MessageResource: TaggedUnionType<MessageResource> = new TaggedUnionType<MessageResource>(() => ({
  variants: [
    $ControlClearTypingMessage,
    $ControlLiveStateMessage,
    $ControlTypingMessage,
    $EventCallMessage,
    $RichTextMessage,
    $RichTextUriObjectMessage,
    $RichTextLocationMessage,
    $RichTextMediaGenericFileMessage,
    $RichTextMediaVideoMessage,
    $SignalFlamingoMessage,
    $TextMessage,
  ],
  tag: "messageType",
}));
