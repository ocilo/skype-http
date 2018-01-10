import { Ucs2StringType } from "kryo/types/ucs2-string";

/**
 * Represents a valid ISO 8601 date string: `YYYY-MM-DD`.
 */
export type IsoDate = string;

export const $IsoDate: Ucs2StringType = new Ucs2StringType({maxLength: Infinity});
