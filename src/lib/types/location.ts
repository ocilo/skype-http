import { CaseStyle } from "kryo/case-style";
import { DocumentType } from "kryo/types/document";
import { Ucs2StringType } from "kryo/types/ucs2-string";

export interface Location {
  /**
   * `"home" | "work" | ...`
   */
  type: string;
  /**
   * `"BE" | "FR" | "fr" | "gb" |...`
   */
  country?: string;
  city?: string;
  state?: string;
}

export const $Location: DocumentType<Location> = new DocumentType<Location>({
  properties: {
    type: {type: new Ucs2StringType({maxLength: Infinity})},
    country: {type: new Ucs2StringType({maxLength: Infinity}), optional: true},
    city: {type: new Ucs2StringType({maxLength: Infinity}), optional: true},
    state: {type: new Ucs2StringType({maxLength: Infinity}), optional: true},
  },
  changeCase: CaseStyle.SnakeCase,
  noExtraKeys: true,
});
