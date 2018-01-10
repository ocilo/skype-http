import { CaseStyle } from "kryo/case-style";
import { BooleanType } from "kryo/types/boolean";
import { DateType } from "kryo/types/date";
import { DocumentType } from "kryo/types/document";
import { Ucs2StringType } from "kryo/types/ucs2-string";
import { $Agent, Agent } from "./agent";
import { $DisplayName, DisplayName } from "./display-name";
import { $DisplayNameSource, DisplayNameSource } from "./display-name-source";
import { $MriKey, MriKey } from "./mri-key";
import { $Profile, Profile } from "./profile";
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
  profile: Profile;
  agent?: Agent;
  authorized: boolean;
  /**
   * Base64 string, seems to depend on the value of `authorized` (absent when `false`)
   */
  authCertificate?: string;
  blocked: boolean;
  creationTime: Date;
  relationshipHistory?: RelationshipHistory;
}

export const $Contact: DocumentType<Contact> = new DocumentType<Contact>({
  properties: {
    personId: {type: $MriKey},
    mri: {type: $MriKey},
    displayName: {type: $DisplayName},
    displayNameSource: {type: $DisplayNameSource},
    profile: {type: $Profile},
    agent: {type: $Agent, optional: true},
    authorized: {type: new BooleanType()},
    authCertificate: {type: new Ucs2StringType({maxLength: Infinity}), optional: true},
    blocked: {type: new BooleanType()},
    creationTime: {type: new DateType()},
    relationshipHistory: {type: $RelationshipHistory, optional: true},
  },
  rename: CaseStyle.SnakeCase,
});
