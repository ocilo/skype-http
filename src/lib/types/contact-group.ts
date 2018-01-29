import { $Boolean } from "kryo/builtins/boolean";
import { CaseStyle } from "kryo/case-style";
import { DocumentIoType, DocumentType } from "kryo/types/document";
import { Ucs2StringType } from "kryo/types/ucs2-string";

/**
 * Example:
 * ```
 * {
 *   "id": "000C3765-A8A0-464C-8083-C8383B86A772",
 *   "name": "Favorites",
 *   "is_favorite": true
 * }
 * ```
 */
export interface ContactGroup {
  id: string;
  name: string;
  isFavorite?: boolean;
}

export const $ContactGroup: DocumentIoType<ContactGroup> = new DocumentType<ContactGroup>({
  properties: {
    id: {type: new Ucs2StringType({maxLength: Infinity})},
    name: {type: new Ucs2StringType({maxLength: Infinity})},
    isFavorite: {type: $Boolean, optional: true},
  },
  changeCase: CaseStyle.SnakeCase,
});
