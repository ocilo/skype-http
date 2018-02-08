import { $Date } from "kryo/builtins/date";
import { ArrayType } from "kryo/types/array";
import { DocumentIoType, DocumentType } from "kryo/types/document";
import { LiteralType } from "kryo/types/literal";
import { Ucs2StringType } from "kryo/types/ucs2-string";
import { $Url, Url } from "../url";
import { $ResourceType, ResourceType } from "./resource-type";
import { $UserPresenceAvailability, UserPresenceAvailability } from "./user-presence-availability";
import { $UserPresenceStatus, UserPresenceStatus } from "./user-presence-status";

export interface UserPresenceDocResource {
  id: "messagingService";

  type: ResourceType.UserPresenceDoc;
  /**
   * Example:
   * - `"https://{host}/v1/users/{user}/presenceDocs/endpointMessagingService" user is 8:username`
   */
  selfLink: Url;

  availability: UserPresenceAvailability;

  status: UserPresenceStatus;

  /**
   * Looks like capabilities.join(" | ") where capabilities is one of ["Seamless", "SmsUpgrade", "IsMobile"];
   *
   * Example:
   * - `"IsMobile | SmsUpgrade"`
   */
  capabilities: string;

  lastSeenAt?: Date;

  endpointPresenceDocLinks: Url[];
}

// tslint:disable-next-line:max-line-length
export const $UserPresenceDocResource: DocumentIoType<UserPresenceDocResource> = new DocumentType<UserPresenceDocResource>({
  properties: {
    id: {
      type: new LiteralType<"messagingService">({
        type: new Ucs2StringType({maxLength: Infinity}),
        value: "messagingService",
      }),
    },
    type: {
      type: new LiteralType<ResourceType.UserPresenceDoc>({
        type: $ResourceType,
        value: ResourceType.UserPresenceDoc,
      }),
    },
    selfLink: {type: $Url},
    availability: {type: $UserPresenceAvailability},
    status: {type: $UserPresenceStatus},
    capabilities: {type: new Ucs2StringType({maxLength: Infinity})},
    lastSeenAt: {type: $Date, optional: true},
    endpointPresenceDocLinks: {type: new ArrayType({itemType: $Url, maxLength: Infinity})},
  },
});
