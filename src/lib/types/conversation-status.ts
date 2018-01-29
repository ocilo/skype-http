import { CaseStyle } from "kryo/case-style";
import { TsEnumType } from "kryo/types/ts-enum";

export enum ConversationStatus {
  Accepted,
}

export const $ConversationStatus: TsEnumType<ConversationStatus> = new TsEnumType<ConversationStatus>({
  enum: ConversationStatus,
  changeCase: CaseStyle.PascalCase,
});
