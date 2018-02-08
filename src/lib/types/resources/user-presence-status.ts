import { TsEnumType } from "kryo/types/ts-enum";

export enum UserPresenceStatus {
  Busy,
  Idle,
  Offline,
  Online,
}

export const $UserPresenceStatus: TsEnumType<UserPresenceStatus> = new TsEnumType<UserPresenceStatus>({
  enum: UserPresenceStatus,
});
