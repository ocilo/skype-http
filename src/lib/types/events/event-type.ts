import { TsEnumType } from "kryo/types/ts-enum";

export enum EventType {
  EventMessage,
}

export const $EventType: TsEnumType<EventType> = new TsEnumType<EventType>({
  enum: EventType,
});
