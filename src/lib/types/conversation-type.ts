import { CaseStyle } from "kryo/case-style";
import { TsEnumType } from "kryo/types/ts-enum";

export enum ConversationType {
  Conversation,
  Thread,
}

export const $ConversationType: TsEnumType<ConversationType> = new TsEnumType<ConversationType>({
  enum: ConversationType,
  changeCase: CaseStyle.PascalCase,
});
