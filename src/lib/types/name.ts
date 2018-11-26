import { CaseStyle } from "kryo/case-style";
import { DocumentType } from "kryo/types/document";
import { Ucs2StringType } from "kryo/types/ucs2-string";

/**
 * I don't think that all of the properties can be undefined at the same time. `first` is almost
 * always there. The one time I saw it missing, `nickname` was there.
 *
 * Examples:
 * - `{"first": "Skype", "company": "Skype"}`
 * - `{"first": "Bob", "nickname": "bob"}`
 * - `{"first": "John", "surname": "Doe", "nickname": "live:john"}`
 * - `{"nickname": "motiontwin"}`
 */
export interface Name {
  first?: string;
  surname?: string;
  nickname?: string;
  company?: string;
}

export const $Name: DocumentType<Name> = new DocumentType<Name>({
  properties: {
    first: {type: new Ucs2StringType({maxLength: Infinity}), optional: true},
    surname: {type: new Ucs2StringType({maxLength: Infinity}), optional: true},
    nickname: {type: new Ucs2StringType({maxLength: Infinity}), optional: true},
    company: {type: new Ucs2StringType({maxLength: Infinity}), optional: true},
  },
  changeCase: CaseStyle.SnakeCase,
  noExtraKeys: true,
});
