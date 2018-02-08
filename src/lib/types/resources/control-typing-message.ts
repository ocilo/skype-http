import { DocumentIoType, DocumentType } from "kryo/types/document";
import { LiteralType } from "kryo/types/literal";
import { $MessageResourceBase, MessageResourceBase } from "./_message-resource-base";
import { $MessageType, MessageType } from "./message-type";

export interface ControlTypingMessage extends MessageResourceBase {
  messageType: MessageType.ControlTyping;
}

export const $ControlTypingMessage: DocumentIoType<ControlTypingMessage> = new DocumentType<ControlTypingMessage>({
  properties: {
    ...$MessageResourceBase.properties,
    messageType: {
      type: new LiteralType<MessageType.ControlTyping>({
        type: $MessageType,
        value: MessageType.ControlTyping,
      }),
      rename: "messagetype",
    },
  },
});
