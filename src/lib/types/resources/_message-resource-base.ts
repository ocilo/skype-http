import { $Boolean } from "kryo/builtins/boolean";
import { $Date } from "kryo/builtins/date";
import { DocumentIoType, DocumentType } from "kryo/types/document";
import { LiteralType } from "kryo/types/literal";
import { Ucs2StringType } from "kryo/types/ucs2-string";
import { $Url, Url } from "../url";
import { $MessageType, MessageType } from "./message-type";
import { $ResourceType, ResourceType } from "./resource-type";

/**
 * @internal
 */
// tslint:disable:max-line-length
export interface MessageResourceBase {
  /**
   * Looks like a timestamp.
   *
   * Example:
   * - `"1517157679445"`
   */
  id: string;

  type: ResourceType.Message;

  messageType: MessageType;

  /**
   * URL where the `ack` should be sent
   */
  ackRequired?: Url;

  originalArrivalTime: Date;

  /**
   * Instant Messaging Display Name
   * Display name of the author of the message.
   */
  imDisplayName?: string;

  /**
   * Looks like a timestamp.
   *
   * Example:
   * - `"1517157679445"`
   *
   * Note: Can be equal to `id`.
   */
  version: string;

  composeTime: Date;

  /**
   * Example:
   * - `"https://db4-client-s.gateway.messenger.live.com/v1/users/ME/conversations/19:4dd7eb8db8714b2c84a6667aae45effa@thread.skype"`
   */
  conversationLink: Url;

  isActive?: boolean;

  /**
   * Example:
   * - `"https://db4-client-s.gateway.messenger.live.com/v1/users/ME/contacts/8:bob"`
   */
  from: Url;

  /**
   * Title of the thread (group conversation)
   */
  threadTopic?: string;

  /**
   * Example:
   * - `"1518108708775"`
   */
  counterpartyMessageId: string;

  /**
   * Examples:
   * - `"text"`
   * - `"Application/Message"`
   */
  contentType?: string;
}

/**
 * @internal
 */
export const $MessageResourceBase: DocumentIoType<MessageResourceBase> = new DocumentType<MessageResourceBase>({
  properties: {
    id: {type: new Ucs2StringType({maxLength: Infinity, pattern: /^\d+$/})},
    type: {
      type: new LiteralType<ResourceType.Message>({
        type: $ResourceType,
        value: ResourceType.Message,
      }),
    },
    messageType: {type: $MessageType, rename: "messagetype"},
    ackRequired: {type: $Url, optional: true, rename: "ackrequired"},
    originalArrivalTime: {type: $Date, rename: "originalarrivaltime"},
    imDisplayName: {type: new Ucs2StringType({maxLength: Infinity}), optional: true, rename: "imdisplayname"},
    version: {type: new Ucs2StringType({maxLength: Infinity, pattern: /^\d+$/})},
    composeTime: {type: $Date, rename: "composetime"},
    conversationLink: {type: $Url},
    isActive: {type: $Boolean, optional: true, rename: "isactive"},
    threadTopic: {type: new Ucs2StringType({maxLength: Infinity}), optional: true, rename: "threadtopic"},
    from: {type: $Url},
    counterpartyMessageId: {type: new Ucs2StringType({maxLength: Infinity}), rename: "counterpartymessageid"},
    contentType: {type: new Ucs2StringType({maxLength: Infinity}), optional: true, rename: "contenttype"},
  },
});
