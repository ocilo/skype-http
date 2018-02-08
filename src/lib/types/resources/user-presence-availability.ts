import { TsEnumType } from "kryo/types/ts-enum";

export enum UserPresenceAvailability {
  Offline,
  Online,
}

// tslint:disable:max-line-length
export const $UserPresenceAvailability: TsEnumType<UserPresenceAvailability> = new TsEnumType<UserPresenceAvailability>({
  enum: UserPresenceAvailability,
});
