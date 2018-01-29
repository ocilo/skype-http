import { CaseStyle } from "kryo/case-style";
import { TsEnumType } from "kryo/types/ts-enum";

export enum MessageType {
  RichText,
}

export const $MessageType: TsEnumType<MessageType> = new TsEnumType<MessageType>({
  enum: MessageType,
  changeCase: CaseStyle.PascalCase,
});
