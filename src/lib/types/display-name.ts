import { Ucs2StringType } from "kryo/types/ucs2-string";

export type DisplayName = string;

export const $DisplayName: Ucs2StringType = new Ucs2StringType({maxLength: Infinity});
