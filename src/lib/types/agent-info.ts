import { CaseStyle } from "kryo/case-style";
import { AnyType } from "kryo/types/any";
import { ArrayType } from "kryo/types/array";
import { DocumentType } from "kryo/types/document";
import { Ucs2StringType } from "kryo/types/ucs2-string";

/**
 * Example (concierge bot):
 * ```
 * {
 *   "capabilities": [],
 *   "trusted": true,
 *   "type": "Participant"
 * }
 * ```
 *
 * Example (concierge bot, from a new user):
 * ```
 * {
 *   "trusted": "True",
 *   "type": "Participant"
 * }
 * ```
 */
export interface AgentInfo {
  capabilities?: any[];
  trusted: boolean | "True";
  /**
   * `"Participant" | ...`
   */
  type: string;
}

export const $AgentInfo: DocumentType<AgentInfo> = new DocumentType<AgentInfo>({
  properties: {
    capabilities: {type: new ArrayType({itemType: new AnyType(), maxLength: Infinity}), optional: true},
    trusted: {type: new AnyType()},
    type: {type: new Ucs2StringType({maxLength: Infinity})},
  },
  changeCase: CaseStyle.SnakeCase,
  noExtraKeys: true,
});
