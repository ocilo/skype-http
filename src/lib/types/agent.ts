import { CaseStyle } from "kryo/case-style";
import { ArrayType } from "kryo/types/array";
import { DocumentType } from "kryo/types/document";
import { JsonType } from "kryo/types/json";
import { Ucs2StringType } from "kryo/types/ucs2-string";
import { $AgentInfo, AgentInfo } from "./agent-info";

/**
 * Example (concierge bot):
 * ```
 * {
 *   "capabilities": [],
 *   "trust": "not-trusted",
 *   "type": "participant",
 *   "info": {
 *     "capabilities": [],
 *     "trusted": true,
 *     "type": "Participant"
 *   },
 *   "stage_info": {}
 * }
 * ```
 *
 * Example (concierge bot, from a new user):
 * ```
 * {
 *   "trust": "not-trusted",
 *   "type": "participant",
 *   "info": {
 *     "trusted": "True",
 *     "type": "Participant"
 *   }
 * }
 * ```
 */
export interface Agent {
  capabilities?: any[];
  /**
   * `"participant" | ...`
   */
  type: string;
  /**
   * `"not-trusted" | ...`
   */
  trust: string;

  info: AgentInfo;

  stageInfo?: any;
}

export const $Agent: DocumentType<Agent> = new DocumentType<Agent>({
  properties: {
    capabilities: {type: new ArrayType({itemType: new JsonType(), maxLength: Infinity}), optional: true},
    type: {type: new Ucs2StringType({maxLength: Infinity})},
    trust: {type: new Ucs2StringType({maxLength: Infinity})},
    info: {type: $AgentInfo},
    stageInfo: {type: new JsonType(), optional: true},
  },
  rename: CaseStyle.SnakeCase,
  ignoreExtraKeys: true,
});
