import { CaseStyle } from "kryo/case-style";
import { AnyType } from "kryo/types/any";
import { ArrayType } from "kryo/types/array";
import { BooleanType } from "kryo/types/boolean";
import { DateType } from "kryo/types/date";
import { DocumentType } from "kryo/types/document";
import { Ucs2StringType } from "kryo/types/ucs2-string";
import { $Agent, Agent } from "./agent";
import { $ContactProfile, ContactProfile } from "./contact-profile";
import { $DisplayName, DisplayName } from "./display-name";
import { $DisplayNameSource, DisplayNameSource } from "./display-name-source";
import { $MriKey, MriKey } from "./mri-key";
import { $Phone, Phone } from "./phone";
import { $RelationshipHistory, RelationshipHistory } from "./relationship-history";

export interface Contact {
  /**
   * This seems to always have the same value as `mri`, prefer to use `mri` to identify
   * the user.
   */
  personId: MriKey;
  /**
   * MRI key of this contact, this serves as the unique id for this contact.
   */
  mri: MriKey;
  displayName: DisplayName;
  displayNameSource: DisplayNameSource;
  /**
   * Phones are normally defined in `profile.phone` but I had one case where it was defined
   * here instead (old inactive contact):
   * ```
   * [
   *   {
   *     "number": "+33666666666",
   *     "type": "mobile"
   *   }
   * ]
   * ```
   */
  phones?: Phone[];
  profile: ContactProfile;
  agent?: Agent;
  authorized: boolean;
  /**
   * Base64 string, seems to depend on the value of `authorized` (absent when `false`)
   */
  authCertificate?: string;
  blocked: boolean;
  creationTime: Date;
  relationshipHistory?: RelationshipHistory;
  suggested?: boolean;
  phoneHashes?: any[];
}

export const $Contact: DocumentType<Contact> = new DocumentType<Contact>({
  properties: {
    personId: {type: $MriKey},
    mri: {type: $MriKey},
    displayName: {type: $DisplayName},
    displayNameSource: {type: $DisplayNameSource},
    phones: {type: new ArrayType({itemType: $Phone, maxLength: Infinity}), optional: true},
    profile: {type: $ContactProfile},
    agent: {type: $Agent, optional: true},
    authorized: {type: new BooleanType()},
    authCertificate: {type: new Ucs2StringType({maxLength: Infinity}), optional: true},
    blocked: {type: new BooleanType()},
    creationTime: {type: new DateType()},
    relationshipHistory: {type: $RelationshipHistory, optional: true},
    suggested: {type: new BooleanType(), optional: true},
    phoneHashes: {type: new ArrayType({itemType: new AnyType(), maxLength: Infinity}), optional: true},
  },
  changeCase: CaseStyle.SnakeCase,
  noExtraKeys: true,
});
