import { $Date } from "kryo/builtins/date";
import { DocumentType } from "kryo/types/document";
import { Ucs2StringType } from "kryo/types/ucs2-string";
import { $MessageType, MessageType } from "./message-type";
import { $MriKey, MriKey } from "./mri-key";
import { $ResourceType, ResourceType } from "./resource-type";
import { $Url, Url } from "./url";

// tslint:disable:max-line-length
export interface Message {
  /**
   * Looks like a timestamp.
   *
   * Example:
   * - `"1517157679445"`
   */
  id: string;

  originalarrivaltime: Date;

  messagetype: MessageType;

  /**
   * Looks like a timestamp.
   *
   * Example:
   * - `"1517157679445"`
   *
   * Note: Can be equal to `id`.
   */
  version: string;

  composetime: Date;

  /**
   * Looks like a timestamp but in ms (as opposed to id/version in s)
   *
   * Example:
   * - `"15834758132099454160"`
   */
  clientmessageid: string;

  /**
   * Example:
   * - `"https://db4-client-s.gateway.messenger.live.com/v1/users/ME/conversations/19:4dd7eb8db8714b2c84a6667aae45effa@thread.skype"`
   */
  conversationLink: Url;

  /**
   * Example:
   * - `"<a href=\"https://www.youtube.com/watch?v=dQw4w9WgXcQ\">https://www.youtube.com/watch?v=dQw4w9WgXcQ</a>"`
   */
  content: string;

  type: ResourceType;

  /**
   * Example:
   * - `"19:4dd7eb8db8714b2c84a6667aae45effa@thread.skype"`
   */
  conversationid: MriKey;

  /**
   * Example:
   * - `"https://db4-client-s.gateway.messenger.live.com/v1/users/ME/contacts/8:bob"`
   */
  from: Url;
}

// tslint:enable

export const $Message: DocumentType<Message> = new DocumentType<Message>({
  properties: {
    id: {type: new Ucs2StringType({maxLength: Infinity, pattern: /^\d+$/})},
    originalarrivaltime: {type: $Date},
    messagetype: {type: $MessageType},
    version: {type: new Ucs2StringType({maxLength: Infinity, pattern: /^\d+$/})},
    composetime: {type: $Date},
    clientmessageid: {type: new Ucs2StringType({maxLength: Infinity, pattern: /^\d+$/})},
    conversationLink: {type: $Url},
    content: {type: new Ucs2StringType({maxLength: Infinity})},
    type: {type: $ResourceType},
    conversationid: {type: $MriKey},
    from: {type: $Url},
  },
});
