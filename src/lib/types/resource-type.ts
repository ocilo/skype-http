import { CaseStyle } from "kryo/case-style";
import { TsEnumType } from "kryo/types/ts-enum";

export enum ResourceType {
  Message,
}

export const $ResourceType: TsEnumType<ResourceType> = new TsEnumType<ResourceType>({
  enum: ResourceType,
  changeCase: CaseStyle.PascalCase,
});
