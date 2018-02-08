import { DocumentIoType, DocumentType } from "kryo/types/document";
import { LiteralType } from "kryo/types/literal";
import { Ucs2StringType } from "kryo/types/ucs2-string";
import { $MessageResourceBase, MessageResourceBase } from "./_message-resource-base";
import { $MessageType, MessageType } from "./message-type";

export interface SignalFlamingoMessage extends MessageResourceBase {
  messageType: MessageType.SignalFlamingo;

  /**
   * Skype Globally Unique ID
   */
  skypeGuid: string;
}

export const $SignalFlamingoMessage: DocumentIoType<SignalFlamingoMessage> = new DocumentType<SignalFlamingoMessage>({
  properties: {
    ...$MessageResourceBase.properties,
    messageType: {
      type: new LiteralType<MessageType.SignalFlamingo>({
        type: $MessageType,
        value: MessageType.SignalFlamingo,
      }),
      rename: "messagetype",
    },
    skypeGuid: {type: new Ucs2StringType({maxLength: Infinity}), rename: "skypeguid"},
  },
});
