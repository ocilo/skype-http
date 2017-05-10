import * as api from "./api";
export {connect} from "./connect";
import * as apiInterface from "./interfaces/api/api";
import * as contact from "./interfaces/api/contact";
import * as conversation from "./interfaces/api/conversation";

export type Api = api.Api;
export namespace Api {
  export type NewMessage = apiInterface.NewMessage;
  export type SendMessageResult = apiInterface.SendMessageResult;
}

export type Contact = contact.Contact;
export namespace Contact {
  export type Phone = contact.Phone;
  export type Location = contact.Location;
}

export type Conversation = conversation.Conversation;
export namespace Conversation {
  export type ThreadProperties = conversation.ThreadProperties;
}

import * as errors from "./errors/index";
export {errors};
