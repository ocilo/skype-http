import { CaseStyle } from "kryo/case-style";
import { ArrayType } from "kryo/types/array";
import { DocumentType } from "kryo/types/document";
import { JsonType } from "kryo/types/json";

export interface RelationshipHistory {
  /**
   * Example:
   * ```
   * [
   *   {
   *     "type": "add_contact",
   *     "subtype": "t1",
   *     "time": "2017-08-15T14:28:44Z"
   *   }
   * ]
   * ```
   */
  sources: any[];
}

export const $RelationshipHistory: DocumentType<RelationshipHistory> = new DocumentType<RelationshipHistory>({
  properties: {
    sources: {type: new ArrayType({itemType: new JsonType(), maxLength: Infinity})},
  },
  rename: CaseStyle.SnakeCase,
});
