import { CaseStyle } from "kryo/case-style";
import { DocumentIoType, DocumentType } from "kryo/types/document";
import { Ucs2StringType } from "kryo/types/ucs2-string";

export interface Phone {
  /**
   * `"mobile"`
   */
  type?: string;
  /**
   * Example: `+15553485`
   */
  number: string;
}

export const $Phone: DocumentIoType<Phone> = new DocumentType<Phone>({
  properties: {
    type: {type: new Ucs2StringType({maxLength: Infinity})},
    number: {type: new Ucs2StringType({maxLength: Infinity})},
  },
  changeCase: CaseStyle.SnakeCase,
});
