import { CaseStyle } from "kryo/case-style";
import { ArrayType } from "kryo/types/array";
import { BooleanType } from "kryo/types/boolean";
import { DocumentType } from "kryo/types/document";
import { JsonType } from "kryo/types/json";
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
 */
export interface AgentInfo {
  capabilities: any[];
  trusted: boolean;
  /**
   * `"Participant" | ...`
   */
  type: string;
}

export const $AgentInfo: DocumentType<AgentInfo> = new DocumentType<AgentInfo>({
  properties: {
    capabilities: {type: new ArrayType({itemType: new JsonType(), maxLength: Infinity})},
    trusted: {type: new BooleanType()},
    type: {type: new Ucs2StringType({maxLength: Infinity})},
  },
  rename: CaseStyle.SnakeCase,
});
