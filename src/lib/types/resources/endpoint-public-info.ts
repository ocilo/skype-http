import { DocumentIoType, DocumentType } from "kryo/types/document";
import { Ucs2StringType } from "kryo/types/ucs2-string";
import { WhiteListType } from "kryo/types/white-list";

export interface EndpointPublicInfo {
  /**
   * Looks like capabilities.join(" | ") where capabilities is one of ["Seamless", "SmsUpgrade"];
   * (no IsMobile apparently, as opposed to `UserPresenceResource`)
   *
   * Example:
   * - `"Seamless | SmsUpgrade"`
   */
  capabilities: string;

  typ: "" | "11" | "12" | "13" | "14" | "16" | "17";

  skypeNameVersion: string;

  /**
   * Examples:
   * - `"xx"`
   * - A string with the pattern: /^x[0-9a-f]{58}/
   */
  nodeInfo: string;

  /**
   * Examples:
   * - `"15"`
   * - `"24"`
   */
  version: string;
}

export const $EndpointPublicInfo: DocumentIoType<EndpointPublicInfo> = new DocumentType<EndpointPublicInfo>(() => ({
  properties: {
    capabilities: {type: new Ucs2StringType({maxLength: Infinity})},
    typ: {
      type: new WhiteListType<"" | "11" | "12" | "13" | "14" | "16" | "17">({
        itemType: new Ucs2StringType({maxLength: Infinity}),
        values: ["", "11", "12", "13", "14", "16", "17"],
      }),
    },
    skypeNameVersion: {type: new Ucs2StringType({maxLength: Infinity})},
    nodeInfo: {type: new Ucs2StringType({maxLength: Infinity})},
    version: {type: new Ucs2StringType({maxLength: Infinity})},
  },
}));
