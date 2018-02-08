import { DocumentIoType, DocumentType } from "kryo/types/document";
import { LiteralType } from "kryo/types/literal";
import { $MessageResourceBase, MessageResourceBase } from "./_message-resource-base";
import { $MessageType, MessageType } from "./message-type";

export interface ControlLiveStateMessage extends MessageResourceBase {
  messageType: MessageType.ControlLiveState;
}

// tslint:disable-next-line:max-line-length
export const $ControlLiveStateMessage: DocumentIoType<ControlLiveStateMessage> = new DocumentType<ControlLiveStateMessage>({
  properties: {
    ...$MessageResourceBase.properties,
    messageType: {
      type: new LiteralType<MessageType.ControlLiveState>({
        type: $MessageType,
        value: MessageType.ControlLiveState,
      }),
      rename: "messagetype",
    },
  },
});
