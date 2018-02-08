import { DocumentIoType, DocumentType } from "kryo/types/document";
import { LiteralType } from "kryo/types/literal";
import { Ucs2StringType } from "kryo/types/ucs2-string";
import { $MessageResource, MessageResource } from "./message-resource";
import { $ResourceType, ResourceType } from "./resource-type";

export interface ConversationUpdateResource {
  id: string;

  type: ResourceType.ConversationUpdate;

  lastMessage: MessageResource;
}

// tslint:disable-next-line:max-line-length
export const $ConversationUpdateResource: DocumentIoType<ConversationUpdateResource> = new DocumentType<ConversationUpdateResource>({
  properties: {
    id: {type: new Ucs2StringType({maxLength: Infinity, pattern: /^\d+$/})},
    type: {
      type: new LiteralType<ResourceType.ConversationUpdate>({
        type: $ResourceType,
        value: ResourceType.ConversationUpdate,
      }),
    },
    lastMessage: {type: $MessageResource},
  },
});
