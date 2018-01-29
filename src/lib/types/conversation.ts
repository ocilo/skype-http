import { $Uint53 } from "kryo/builtins/uint53";
import { CaseStyle } from "kryo/case-style";
import { ArrayType } from "kryo/types/array";
import { DocumentIoType, DocumentType } from "kryo/types/document";
import { TryUnionType } from "kryo/types/try-union";
import { $ConversationType, ConversationType } from "./conversation-type";
import { $EmptyObject, EmptyObject } from "./empty-object";
import { $Message, Message } from "./message";
import { $MriKey, MriKey } from "./mri-key";
import { $ThreadProperties, ThreadProperties } from "./thread-properties";
import { $Url, Url } from "./url";

// tslint:disable:max-line-length
export interface Conversation {
  /**
   * Examples:
   * - `"https://db4-client-s.gateway.messenger.live.com/v1/threads/19:5300390a2a304131b92558e6a818a222@thread.skype"`
   * - `"https://db4-client-s.gateway.messenger.live.com/v1/users/ME/contacts/8:bob"`
   */
  targetLink: Url;

  /**
   * Seems to only be present for group conversations.
   */
  threadProperties?: ThreadProperties;

  /**
   * Examples:
   * - `19:5300390a2a304131b92558e6a818a222@thread.skype`
   * - `8:bob`
   */
  id: MriKey;

  type: ConversationType;

  /**
   * Seems to be a timestamp.
   *
   * Examples:
   * - `1464030261015`
   * - `1502807296509`
   */
  version: number; // a timestamp ? example:

  lastMessage: EmptyObject | Message;

  /**
   * Examples:
   * - `"https://db4-client-s.gateway.messenger.live.com/v1/users/ME/conversations/19:5300390a2a304131b92558e6a818a222@thread.skype/messages"`
   * - `"https://db4-client-s.gateway.messenger.live.com/v1/users/ME/conversations/8:bob/messages"`
   */
  messages: Url;

  /**
   * Array of MRI keys of the participants of this conversation.
   *
   * Examples:
   * - `["8:alice"]`
   * - `["8:bob"]`
   */
  members?: MriKey[];
}

// tslint:enable

export const $Conversation: DocumentIoType<Conversation> = new DocumentType<Conversation>({
  properties: {
    targetLink: {type: $Url},
    threadProperties: {type: $ThreadProperties, optional: true},
    id: {type: $MriKey},
    type: {type: $ConversationType},
    version: {type: $Uint53},
    lastMessage: {type: new TryUnionType({variants: [$EmptyObject, $Message]})},
    messages: {type: $Url},
    members: {type: new ArrayType({itemType: $MriKey, maxLength: Infinity}), optional: true},
  },
  changeCase: CaseStyle.CamelCase,
});
