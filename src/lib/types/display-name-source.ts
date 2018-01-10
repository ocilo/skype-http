import { CaseStyle } from "kryo/case-style";
import { SimpleEnumType } from "kryo/types/simple-enum";

export enum DisplayNameSource {
  Identifier,
  Profile,
  /**
   * The display name was edited by the current user.
   */
  UserEdits,
}

export const $DisplayNameSource: SimpleEnumType<DisplayNameSource> = new SimpleEnumType<DisplayNameSource>({
  enum: DisplayNameSource,
  rename: CaseStyle.SnakeCase,
});
