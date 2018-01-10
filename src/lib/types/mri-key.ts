import { Ucs2StringType } from "kryo/types/ucs2-string";

export { MriKey } from "../mri";

export const $MriKey: Ucs2StringType = new Ucs2StringType({maxLength: Infinity});
