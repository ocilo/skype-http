import { DocumentIoType, DocumentType } from "kryo/types/document";
import { LiteralType } from "kryo/types/literal";
import { $MessageResourceBase, MessageResourceBase } from "./_message-resource-base";
import { $MessageType, MessageType } from "./message-type";

export interface ControlClearTypingMessage extends MessageResourceBase {
  messageType: MessageType.ControlClearTyping;
}

// tslint:disable-next-line:max-line-length
export const $ControlClearTypingMessage: DocumentIoType<ControlClearTypingMessage> = new DocumentType<ControlClearTypingMessage>({
  properties: {
    ...$MessageResourceBase.properties,
    messageType: {
      type: new LiteralType<MessageType.ControlClearTyping>({
        type: $MessageType,
        value: MessageType.ControlClearTyping,
      }),
      rename: "messagetype",
    },
  },
});
