import { $Date } from "kryo/builtins/date";
import { DocumentType } from "kryo/types/document";
import { Ucs2StringType } from "kryo/types/ucs2-string";
import { $ConversationStatus, ConversationStatus } from "./conversation-status";
import { $StringyBoolean, StringyBoolean } from "./stringy-boolean";

export interface ConversationProperties {
  /**
   * Example:
   * - `"true"`
   */
  favorite: StringyBoolean;

  conversationstatus: ConversationStatus;

  /**
   * Example:
   * - `"1502807294837"`
   */
  created?: string;

  /**
   * Example:
   * - `"False"`
   *
   * I never saw `"True"` but guess that it is the only other possible value.
   */
  isemptyconversation?: StringyBoolean;

  /**
   * Semicolon-separated list of 3 timestamps.
   *
   * Example:
   * - `"1502807295234;1502807296000;1502807295234"`
   */
  consumptionhorizon: string;

  /**
   * Example:
   * - `"9df263f8f3eccfae79e1bf712dcae211913d4d83126b36f3803ab44846578fe0@oneToOne.skype"`
   */
  onetoonethreadid?: string;

  /**
   * Example:
   * - `"False"`
   *
   * I never saw `"True"` but guess that it is the only other possible value.
   */
  conversationblocked?: StringyBoolean;

  lastimreceivedtime: Date;
}

export const $ConversationProperties: DocumentType<ConversationProperties> = new DocumentType<ConversationProperties>({
  properties: {
    favorite: {type: $StringyBoolean, optional: true},
    conversationstatus: {type: $ConversationStatus, optional: true},
    created: {type: new Ucs2StringType({maxLength: Infinity, pattern: /^\d+$/}), optional: true},
    isemptyconversation: {type: $StringyBoolean, optional: true},
    consumptionhorizon: {type: new Ucs2StringType({maxLength: Infinity, pattern: /^\d+(?:;\d+){2}$/})},
    onetoonethreadid: {type: new Ucs2StringType({maxLength: Infinity}), optional: true},
    conversationblocked: {type: $StringyBoolean, optional: true},
    lastimreceivedtime: {type: $Date},
  },
});
