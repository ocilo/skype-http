import { DocumentIoType, DocumentType } from "kryo/types/document";
import { LiteralType } from "kryo/types/literal";
import { Ucs2StringType } from "kryo/types/ucs2-string";
import { $Url, Url } from "../url";
import { $EndpointPrivateInfo, EndpointPrivateInfo } from "./endpoint-private-info";
import { $EndpointPublicInfo, EndpointPublicInfo } from "./endpoint-public-info";
import { $ResourceType, ResourceType } from "./resource-type";

export interface EndpointPresenceDocResource {
  id: "messagingService";

  type: ResourceType.EndpointPresenceDoc;
  /**
   * Example:
   * - `https://{host}/v1/users/{user}/endpoints/{endpoint}/presenceDocs/endpointMessagingService`
   */
  selfLink: Url;

  publicInfo: EndpointPublicInfo;

  privateInfo: EndpointPrivateInfo;
}

// tslint:disable-next-line:max-line-length
export const $EndpointPresenceDocResource: DocumentIoType<EndpointPresenceDocResource> = new DocumentType<EndpointPresenceDocResource>({
  properties: {
    id: {
      type: new LiteralType<"messagingService">({
        type: new Ucs2StringType({maxLength: Infinity}),
        value: "messagingService",
      }),
    },
    type: {
      type: new LiteralType<ResourceType.EndpointPresenceDoc>({
        type: $ResourceType,
        value: ResourceType.EndpointPresenceDoc,
      }),
    },
    selfLink: {type: $Url},
    publicInfo: {type: $EndpointPublicInfo},
    privateInfo: {type: $EndpointPrivateInfo},
  },
});
