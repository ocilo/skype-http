import { Ucs2StringType } from "kryo/types/ucs2-string";
import { WhiteListType } from "kryo/types/white-list";

export type StringyBoolean = "False" | "True" | "false" | "true";

// TODO: Read it to `boolean` instead of this union.
export const $StringyBoolean: WhiteListType<StringyBoolean> = new WhiteListType<StringyBoolean>({
  itemType: new Ucs2StringType({maxLength: 5}),
  values: ["False", "True", "false", "true"],
});
