import { CaseStyle } from "kryo/case-style";
import { TsEnumType } from "kryo/types/ts-enum";

export enum DisplayNameSource {
  Identifier,
  Profile,
  /**
   * The display name was edited by the current user.
   */
  UserEdits,
}

export const $DisplayNameSource: TsEnumType<DisplayNameSource> = new TsEnumType<DisplayNameSource>({
  enum: DisplayNameSource,
  changeCase: CaseStyle.SnakeCase,
});
