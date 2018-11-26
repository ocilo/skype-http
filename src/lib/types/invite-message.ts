import { DateType } from "kryo/types/date";
import { DocumentType } from "kryo/types/document";
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

export const $InviteMessage: DocumentType<InviteMessage> = new DocumentType<InviteMessage>({
  properties: {
    message: {type: new Ucs2StringType({maxLength: Infinity})},
    time: {type: new DateType()},
  },
  noExtraKeys: true,
});
