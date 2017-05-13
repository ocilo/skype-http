 import * as api from "./api";
export { connect, ConnectOptions } from "./connect";
import * as apiInterface from "./interfaces/api/api";
import * as contact from "./interfaces/api/contact";
import * as conversation from "./interfaces/api/conversation";
import * as events from "./interfaces/api/events";
export { events };
import * as resources from "./interfaces/api/resources";
export { resources };
import * as nativeContact from "./interfaces/native-api/contact";
import * as nativeConversation from "./interfaces/native-api/conversation";
import * as nativeEvents from "./interfaces/native-api/events";
import * as nativeMessageResources from "./interfaces/native-api/message-resources";
import * as nativeResources from "./interfaces/native-api/resources";
namespace native {
  export import contact = nativeContact;
  export import conversation = nativeConversation;
  export import resources = nativeResources;
  export import events = nativeEvents;
  export import messageResources = nativeMessageResources;
}
export type Api = api.Api;
export namespace Api {
  export type NewMessage = apiInterface.NewMessage;
  export type SendMessageResult = apiInterface.SendMessageResult;
}
export type Contact = contact.Contact;
export namespace Contact {
  export type Contact = contact.Contact;
  export type Phone = contact.Phone;
  export type Location = contact.Location;
}

export type Conversation = conversation.Conversation;
export namespace Conversation {
  export type Conversation = conversation.Conversation;
  export type ThreadProperties = conversation.ThreadProperties;
}

import * as errors from "./errors/index";
export {errors};
