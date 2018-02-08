import { TsEnumType } from "kryo/types/ts-enum";

export enum EventResourceType {
  NewMessage,
  UserPresence,
  EndpointPresence,
}

export const $EventResourceType: TsEnumType<EventResourceType> = new TsEnumType<EventResourceType>({
  enum: EventResourceType,
});
