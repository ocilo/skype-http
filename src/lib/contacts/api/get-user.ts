import { CaseStyle } from "kryo/case-style";
import { AnyType } from "kryo/types/any";
import { ArrayType } from "kryo/types/array";
import { DocumentType } from "kryo/types/document";
import { Ucs2StringType } from "kryo/types/ucs2-string";
import { $Contact, Contact } from "../../types/contact";
import { $ContactGroup, ContactGroup } from "../../types/contact-group";

/**
 * @internal
 */
export interface GetUserResult {
  contacts: Contact[];
  // TODO(demurgos): Rename to `blockList`?
  // {mri: MriKey}[]
  blocklist: any[];
  groups: ContactGroup[];
  /**
   * `"full" | ...`
   */
  scope: string;
}

/**
 * @internal
 */
export const $GetUserResult: DocumentType<GetUserResult> = new DocumentType<GetUserResult>({
  properties: {
    contacts: {type: new ArrayType({itemType: $Contact, maxLength: Infinity})},
    blocklist: {type: new ArrayType({itemType: new AnyType(), maxLength: Infinity})},
    groups: {type: new ArrayType({itemType: $ContactGroup, maxLength: Infinity})},
    scope: {type: new Ucs2StringType({maxLength: Infinity})},
  },
  changeCase: CaseStyle.SnakeCase,
});
