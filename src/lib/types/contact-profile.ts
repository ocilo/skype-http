import { CaseStyle } from "kryo/case-style";
import { ArrayType } from "kryo/types/array";
import { DocumentType } from "kryo/types/document";
import { Ucs2StringType } from "kryo/types/ucs2-string";
import { $IsoDate, IsoDate } from "./iso-date";
import { $Location, Location } from "./location";
import { $Name, Name } from "./name";
import { $Phone, Phone } from "./phone";
import { $Url, Url } from "./url";

/**
 * Represents a profile returned by the contact API v2 (contacts.skype.com/contacts/v2).
 * It is possible for a profile to only contain the name (`28:concierge` for a newly create user)
 */
export interface ContactProfile {
  /**
   * Examples:
   * - `https://avatar.skype.com/v1/avatars/:userId?auth_key=1601633273` (the authKey can be negative)
   * - `https://avatar.skype.com/v1/avatars/:userId/public`
   * - `https://az705183.vo.msecnd.net/dam/skype/media/concierge-assets/avatar/avatarcnsrg-144.png`
   */
  avatarUrl?: Url;
  birthday?: IsoDate;
  /**
   * `"male" | "female"`
   */
  gender?: string;
  locations?: Location[];
  phones?: Phone[];
  /**
   * Can contain tags.
   * Examples:
   * - `"<ss type=\"music\">(music)</ss> Rick Astley - Never Gonna Give You Up"`
   * - `"Foo &amp; bar"`
   */
  mood?: string;
  name?: Name;
  about?: string;

  /**
   * Probably always an URL
   * Example: `"https://go.skype.com/faq.skype.bot"`
   */
  website?: string;

  /**
   * `"en" | "fr"`
   */
  language?: string;
}

export const $ContactProfile: DocumentType<ContactProfile> = new DocumentType<ContactProfile>({
  properties: {
    avatarUrl: {type: $Url, optional: true},
    birthday: {type: $IsoDate, optional: true},
    gender: {type: new Ucs2StringType({maxLength: Infinity}), optional: true},
    locations: {type: new ArrayType({itemType: $Location, maxLength: Infinity}), optional: true},
    phones: {type: new ArrayType({itemType: $Phone, maxLength: Infinity}), optional: true},
    mood: {type: new Ucs2StringType({maxLength: Infinity}), optional: true},
    name: {type: $Name, optional: true},
    about: {type: new Ucs2StringType({maxLength: Infinity}), optional: true},
    website: {type: new Ucs2StringType({maxLength: Infinity}), optional: true},
    language: {type: new Ucs2StringType({maxLength: Infinity}), optional: true},
  },
  changeCase: CaseStyle.SnakeCase,
  noExtraKeys: true,
});
