import { DocumentIoType, DocumentType } from "kryo/types/document";
import { LiteralType } from "kryo/types/literal";
import { Ucs2StringType } from "kryo/types/ucs2-string";
import { $MessageResourceBase, MessageResourceBase } from "./_message-resource-base";
import { $MessageType, MessageType } from "./message-type";

export interface RichTextUriObjectMessage extends MessageResourceBase {
  messageType: MessageType.RichTextUriObject;

  /**
   * XML string
   */
  content: string;

  // uri_type: string;
  // uri: string;
  // uri_thumbnail: string;
  // uri_w_login: string;
  // file_size?: number;
  // original_file_name: string;
}

// tslint:disable-next-line:max-line-length
export const $RichTextUriObjectMessage: DocumentIoType<RichTextUriObjectMessage> = new DocumentType<RichTextUriObjectMessage>({
  properties: {
    ...$MessageResourceBase.properties,
    messageType: {
      type: new LiteralType<MessageType.RichTextUriObject>({
        type: $MessageType,
        value: MessageType.RichTextUriObject,
      }),
      rename: "messagetype",
    },
    content: {type: new Ucs2StringType({maxLength: Infinity})},
  },
});
