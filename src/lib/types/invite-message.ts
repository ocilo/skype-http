import { $Date } from "kryo/builtins/date";
import { DocumentIoType, DocumentType } from "kryo/types/document";
import { Ucs2StringType } from "kryo/types/ucs2-string";

/**
 * Example (JSON HTTP response):
 *
 * ```
 * {
 *  "message": "Hi Bob, I'd like to add you as a contact.",
 *  "time": "2018-01-09T14:42:17Z"
 * }
 * ```
 */
export interface InviteMessage {
  message: string;
  time: Date;
}

export const $InviteMessage: DocumentIoType<InviteMessage> = new DocumentType<InviteMessage>({
  properties: {
    message: {type: new Ucs2StringType({maxLength: Infinity})},
    time: {type: $Date},
  },
});
