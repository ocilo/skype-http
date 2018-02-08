import { TsEnumType } from "kryo/types/ts-enum";

export enum ResourceType {
  ConversationUpdate,
  EndpointPresenceDoc,
  Message,
  UserPresenceDoc,
}

export const $ResourceType: TsEnumType<ResourceType> = new TsEnumType<ResourceType>({
  enum: ResourceType,
});
