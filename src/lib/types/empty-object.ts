import { DocumentType } from "kryo/types/document";

export interface EmptyObject {
}

export const $EmptyObject: DocumentType<EmptyObject> = new DocumentType<EmptyObject>({
  properties: {},
});
