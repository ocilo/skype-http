import { DocumentIoType, DocumentType } from "kryo/types/document";
import { Ucs2StringType } from "kryo/types/ucs2-string";

// tslint:disable:max-line-length
export interface ThreadProperties {
  /**
   * Example:
   * - `"URL@https://api.asm.skype.com/v1/objects/0-neu-d1-52fafc9b91b08ab3f94cc750c1666a55/views/avatar_fullsize"`
   *
   * Note: The hex part in the middle of the URL is _not_ related to the id of the group conversation.
   */
  picture?: string;

  /**
   * Seems to be a JSON-serialized array.
   *
   * Example:
   * ```
   * "[{\"MemberRole\":1,\"SkipAclCheck\":false,\"IsFollowing\":false,\"IsReader\":false,\"LinkedId\":\"\",\"Cid\":0,\"FriendlyName\":\"\",\"UserTile\":\"\",\"Expiration\":\"9999-12-31T23:59:59\",\"MemberMri\":\"8:bob\"}]"
   * ```
   */
  members?: string;

  /**
   * Seems to be a string timestamp.
   *
   * Examples:
   * - `"1421342788493"`
   * - `"1502807294562"`
   */
  lastjoinat?: string;

  topic?: string;

  /**
   * Seems to be a stringified number corresponding to the number of items in the `members` array
   * once deserialized.
   * It is possible that this field is present but not `members`.
   *
   * Example:
   * - `"1"`
   */
  membercount?: string;

  /**
   * Seems to be a string timestamp.
   *
   * Examples:
   * - `"1464029299838"`
   * - `"1502807295343"`
   */
  version?: string;
}
// tslint:enable

export const $ThreadProperties: DocumentIoType<ThreadProperties> = new DocumentType<ThreadProperties>({
  properties: {
    picture: {type: new Ucs2StringType({maxLength: Infinity}), optional: true},
    members: {type: new Ucs2StringType({maxLength: Infinity}), optional: true},
    lastjoinat: {type: new Ucs2StringType({maxLength: Infinity, pattern: /^\d+$/}), optional: true},
    topic: {type: new Ucs2StringType({maxLength: Infinity}), optional: true},
    membercount: {type: new Ucs2StringType({maxLength: Infinity, pattern: /^\d+$/}), optional: true},
    version: {type: new Ucs2StringType({maxLength: Infinity, pattern: /^\d+$/}), optional: true},
  },
});
