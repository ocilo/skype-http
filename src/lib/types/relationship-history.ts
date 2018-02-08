import { $Any } from "kryo/builtins/any";
import { CaseStyle } from "kryo/case-style";
import { ArrayType } from "kryo/types/array";
import { DocumentIoType, DocumentType } from "kryo/types/document";

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
   *
   * ```
   * "relationship_history": {
   *   "sources": [
   *     {
   *       "type": "scd",
   *       "time": "2017-12-03T15:27:37.019204Z"
   *     },
   *     {
   *       "type": "scd",
   *       "subtype": "auto_accept",
   *       "time": "2017-12-03T15:27:37.019204Z"
   *     }
   *   ]
   * }
   * ```
   */
  sources: any[];
}

export const $RelationshipHistory: DocumentIoType<RelationshipHistory> = new DocumentType<RelationshipHistory>({
  properties: {
    sources: {type: new ArrayType({itemType: $Any, maxLength: Infinity})},
  },
  changeCase: CaseStyle.SnakeCase,
});
