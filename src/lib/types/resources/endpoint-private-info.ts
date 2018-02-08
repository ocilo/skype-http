import { DocumentIoType, DocumentType } from "kryo/types/document";
import { Ucs2StringType } from "kryo/types/ucs2-string";

export interface EndpointPrivateInfo {
  /**
   * Endpoint name
   *
   * Usually the name of the computer (host for Linux ?)
   */
  epName?: string;
}

export const $EndpointPrivateInfo: DocumentIoType<EndpointPrivateInfo> = new DocumentType<EndpointPrivateInfo>({
  properties: {
    epName: {type: new Ucs2StringType({maxLength: Infinity}), optional: true, rename: "epname"},
  },
});
