import { $UuidHex } from "kryo/builtins/uuid-hex";
import { DocumentIoType, DocumentType } from "kryo/types/document";
import { LiteralType } from "kryo/types/literal";
import { Ucs2StringType } from "kryo/types/ucs2-string";
import { $MessageResourceBase, MessageResourceBase } from "./_message-resource-base";
import { $MessageType, MessageType } from "./message-type";

export interface EventCallMessage extends MessageResourceBase {
  messageType: MessageType.EventCall;

  /**
   * XML string
   */
  content: string;

  skypeGuid: string;
}

export const $EventCallMessage: DocumentIoType<EventCallMessage> = new DocumentType<EventCallMessage>({
  properties: {
    ...$MessageResourceBase.properties,
    messageType: {
      type: new LiteralType<MessageType.EventCall>({
        type: $MessageType,
        value: MessageType.EventCall,
      }),
      rename: "messagetype",
    },
    content: {type: new Ucs2StringType({maxLength: Infinity})},
    skypeGuid: {type: $UuidHex, rename: "skypeguid"},
  },
});
