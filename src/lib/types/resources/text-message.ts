import { DocumentIoType, DocumentType } from "kryo/types/document";
import { LiteralType } from "kryo/types/literal";
import { Ucs2StringType } from "kryo/types/ucs2-string";
import { $MessageResourceBase, MessageResourceBase } from "./_message-resource-base";
import { $MessageType, MessageType } from "./message-type";

export interface TextMessage extends MessageResourceBase {
  messageType: MessageType.Text;

  /**
   * Looks like a timestamp but in ms (as opposed to id/version in s)
   *
   * Example:
   * - `"15834758132099454160"`
   */
  clientMessageId: string;

  /**
   * Example:
   * - `"Hello, World!"`
   */
  content: string;
}

export const $TextMessage: DocumentIoType<TextMessage> = new DocumentType<TextMessage>({
  properties: {
    ...$MessageResourceBase.properties,
    messageType: {
      type: new LiteralType<MessageType.Text>({
        type: $MessageType,
        value: MessageType.Text,
      }),
      rename: "messagetype",
    },
    clientMessageId: {type: new Ucs2StringType({maxLength: Infinity, pattern: /^\d+$/}), rename: "clientmessageid"},
    content: {type: new Ucs2StringType({maxLength: Infinity})},
  },
});
