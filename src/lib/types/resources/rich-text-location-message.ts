import { DocumentIoType, DocumentType } from "kryo/types/document";
import { LiteralType } from "kryo/types/literal";
import { Ucs2StringType } from "kryo/types/ucs2-string";
import { $MessageResourceBase, MessageResourceBase } from "./_message-resource-base";
import { $MessageType, MessageType } from "./message-type";

export interface RichTextLocationMessage extends MessageResourceBase {
  messageType: MessageType.RichTextLocation;

  /**
   * XML string
   */
  content: string;
}

// tslint:disable-next-line:max-line-length
export const $RichTextLocationMessage: DocumentIoType<RichTextLocationMessage> = new DocumentType<RichTextLocationMessage>({
  properties: {
    ...$MessageResourceBase.properties,
    messageType: {
      type: new LiteralType<MessageType.RichTextLocation>({
        type: $MessageType,
        value: MessageType.RichTextLocation,
      }),
      rename: "messagetype",
    },
    content: {type: new Ucs2StringType({maxLength: Infinity})},
  },
});
