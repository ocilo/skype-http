import { DocumentIoType, DocumentType } from "kryo/types/document";
import { LiteralType } from "kryo/types/literal";
import { Ucs2StringType } from "kryo/types/ucs2-string";
import { $MessageResourceBase, MessageResourceBase } from "./_message-resource-base";
import { $MessageType, MessageType } from "./message-type";

// tslint:disable:max-line-length
export interface RichTextMediaGenericFileMessage extends MessageResourceBase {
  messageType: MessageType.RichTextMediaGenericFile;
  /**
   * XML string
   *
   * Example:
   * - `'<URIObject uri="https://api.asm.skype.com/v1/objects/0-neu-d2-26c333f286967716e96dd92c080993be" type="File.1">To view this file, go to: <a href="https://login.skype.com/login/sso?go=webclient.xmm&amp;docid=0-neu-d2-26c333f286967716e96dd92c080993be">https://login.skype.com/login/sso?go=webclient.xmm&amp;docid=0-neu-d2-26c333f286967716e96dd92c080993be</a><OriginalName v="test.ts"></OriginalName><FileSize v="642"></FileSize></URIObject>'`
   */
  content: string;

  // uri_type: string;
  // uri: string;
  // uri_thumbnail: string;
  // uri_w_login: string;
  // file_size?: number;
  // original_file_name: string;
}

export const $RichTextMediaGenericFileMessage: DocumentIoType<RichTextMediaGenericFileMessage> = new DocumentType<RichTextMediaGenericFileMessage>({
  properties: {
    ...$MessageResourceBase.properties,
    messageType: {
      type: new LiteralType<MessageType.RichTextMediaGenericFile>({
        type: $MessageType,
        value: MessageType.RichTextMediaGenericFile,
      }),
      rename: "messagetype",
    },
    content: {type: new Ucs2StringType({maxLength: Infinity})},
  },
});
