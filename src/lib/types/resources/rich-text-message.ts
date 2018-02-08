import { DocumentIoType, DocumentType } from "kryo/types/document";
import { LiteralType } from "kryo/types/literal";
import { Ucs2StringType } from "kryo/types/ucs2-string";
import { $MessageResourceBase, MessageResourceBase } from "./_message-resource-base";
import { $MessageType, MessageType } from "./message-type";

export interface RichTextMessage extends MessageResourceBase {
  messageType: MessageType.RichText;

  /**
   * Looks like a timestamp but in ms (as opposed to id/version in s)
   *
   * Example:
   * - `"15834758132099454160"`
   */
  clientMessageId: string;

  /**
   * Example:
   * - `"<a href=\"https://www.youtube.com/watch?v=dQw4w9WgXcQ\">https://www.youtube.com/watch?v=dQw4w9WgXcQ</a>"`
   */
  content: string;
}

export const $RichTextMessage: DocumentIoType<RichTextMessage> = new DocumentType<RichTextMessage>({
  properties: {
    ...$MessageResourceBase.properties,
    messageType: {
      type: new LiteralType<MessageType.RichText>({
        type: $MessageType,
        value: MessageType.RichText,
      }),
      rename: "messagetype",
    },
    clientMessageId: {type: new Ucs2StringType({maxLength: Infinity, pattern: /^\d+$/}), rename: "clientmessageid"},
    content: {type: new Ucs2StringType({maxLength: Infinity})},
  },
});
