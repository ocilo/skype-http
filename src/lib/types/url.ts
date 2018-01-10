import { Ucs2StringType } from "kryo/types/ucs2-string";

export type Url = string;

export const $Url: Ucs2StringType = new Ucs2StringType({maxLength: Infinity});
