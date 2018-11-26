import { CaseStyle } from "kryo/case-style";
import { ArrayType } from "kryo/types/array";
import { DocumentType } from "kryo/types/document";
import { $DisplayName, DisplayName } from "./display-name";
import { $InviteMessage, InviteMessage } from "./invite-message";
import { $MriKey, MriKey } from "./mri-key";
import { $Url, Url } from "./url";

/**
 * Represents a pending incoming contact invitation.
 */
export interface Invite {
  /**
   * MRI key of the contact
   *
   * @see [[MriKey]]
   */
  mri: MriKey;

  // TODO(demurgos): Rename to `displayName` once Kryo supports custom renames
  displayname: DisplayName;

  avatarUrl: Url;

  /**
   * All the messages received from this contact.
   *
   * Note: Skype only displays the most recent one (2017-01-09).
   */
  invites: InviteMessage[];
}

/**
 * Runtime representation of the [[Invite]] type.
 */
export const $Invite: DocumentType<Invite> = new DocumentType<Invite>({
  properties: {
    mri: {type: $MriKey},
    displayname: {type: $DisplayName},
    avatarUrl: {type: $Url},
    invites: {type: new ArrayType({itemType: $InviteMessage, maxLength: Infinity})},
  },
  changeCase: CaseStyle.SnakeCase,
  noExtraKeys: true,
});
