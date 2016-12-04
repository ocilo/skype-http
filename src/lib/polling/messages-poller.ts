import * as Bluebird from "bluebird";
import {EventEmitter} from "events";
import {Incident} from "incident";

import * as io from "../interfaces/io";
import * as api from "../interfaces/api/api";
import {Context as ApiContext} from "../interfaces/api/context";
import * as nativeMessageResources from "../interfaces/native-api/message-resources";
import * as nativeResources from "../interfaces/native-api/resources";
import * as nativeEvents from "../interfaces/native-api/events";
import * as messagesUri from "../messages-uri";
import {ParsedConversationId} from "../interfaces/api/api";
import * as resources from "../interfaces/api/resources";
import * as events from "../interfaces/api/events";

// Perform one request every 1000 ms
const POLLING_DELAY = 1000;

const CONTACT_ID_PATTERN = /^(\d+):(.+)$/;
export function parseContactId(contactId: string): ParsedConversationId {
  const match = CONTACT_ID_PATTERN.exec(contactId);
  if (match === null) {
    throw new Incident("parse-error", "Unable to parse userId");
  }
  return {
    raw: contactId,
    prefix: parseInt(match[1], 10),
    username: match[2]
  };
}

export function formatRichTextResource (nativeResource: nativeMessageResources.RichText): resources.RichTextResource {
  const parsedConversationUri = messagesUri.parseConversation(nativeResource.conversationLink);
  const parsedContactUri = messagesUri.parseContact(nativeResource.from);
  const parsedContactId = parseContactId(parsedContactUri.contact);
  return {
    type: "RichText",
    id: nativeResource.id,
    clientId: nativeResource.clientmessageid,
    composeTime: new Date(nativeResource.composetime),
    arrivalTime: new Date(nativeResource.originalarrivaltime),
    from: parsedContactId,
    conversation: parsedConversationUri.conversation,
    content: nativeResource.content
  };
}

export function formatTextResource (nativeResource: nativeMessageResources.Text): resources.TextResource {
  const parsedConversationUri = messagesUri.parseConversation(nativeResource.conversationLink);
  const parsedContactUri = messagesUri.parseContact(nativeResource.from);
  const parsedContactId = parseContactId(parsedContactUri.contact);
  return {
    type: "Text",
    id: nativeResource.id,
    clientId: nativeResource.clientmessageid,
    composeTime: new Date(nativeResource.composetime),
    arrivalTime: new Date(nativeResource.originalarrivaltime),
    from: parsedContactId,
    conversation: parsedConversationUri.conversation,
    content: nativeResource.content
  };
}

export function formatControlClearTypingResource (nativeResource: nativeMessageResources.ControlClearTyping): resources.ControlClearTypingResource {
  const parsedConversationUri = messagesUri.parseConversation(nativeResource.conversationLink);
  const parsedContactUri = messagesUri.parseContact(nativeResource.from);
  const parsedContactId = parseContactId(parsedContactUri.contact);
  return {
    type: "Control/ClearTyping",
    id: nativeResource.id,
    composeTime: new Date(nativeResource.composetime),
    arrivalTime: new Date(nativeResource.originalarrivaltime),
    from: parsedContactId,
    conversation: parsedConversationUri.conversation,
    native: nativeResource
  };
}

export function formatControlTypingResource (nativeResource: nativeMessageResources.ControlTyping): resources.ControlTypingResource {
  const parsedConversationUri = messagesUri.parseConversation(nativeResource.conversationLink);
  const parsedContactUri = messagesUri.parseContact(nativeResource.from);
  const parsedContactId = parseContactId(parsedContactUri.contact);
  return {
    type: "Control/Typing",
    id: nativeResource.id,
    composeTime: new Date(nativeResource.composetime),
    arrivalTime: new Date(nativeResource.originalarrivaltime),
    from: parsedContactId,
    conversation: parsedConversationUri.conversation,
    native: nativeResource
  };
}

function formatMessageResource (nativeResource: nativeResources.MessageResource): resources.Resource {
  switch (nativeResource.messagetype) {
    case "RichText":
      return formatRichTextResource(<nativeMessageResources.RichText> nativeResource);
    case "Text":
      return formatTextResource(<nativeMessageResources.Text> nativeResource);
    case "Control/ClearTyping":
      return formatControlClearTypingResource(<nativeMessageResources.ControlClearTyping> nativeResource);
    case "Control/Typing":
      return formatControlTypingResource(<nativeMessageResources.ControlTyping> nativeResource);
    default:
      throw new Error(`Unknown ressource.messageType (${JSON.stringify(nativeResource.messagetype)}) for resource:\n${JSON.stringify(nativeResource)}`);
  }
}

function formatEventMessage(native: nativeEvents.EventMessage): events.EventMessage {
  let resource: resources.Resource | null;
  switch (native.resourceType) {
    case "UserPresence":
      resource = null;
      break;
    case "EndpointPresence":
      resource = null;
      break;
    case "NewMessage":
      resource = formatMessageResource(<nativeResources.MessageResource> native.resource);
      break;
    default:
      throw new Error(`Unknown EventMessage.resourceType (${JSON.stringify(native.resourceType)}) for Event:\n${JSON.stringify(native)}`);
  }

  return {
    id: native.id,
    type: native.type,
    resourceType: native.resourceType,
    time: new Date(native.time),
    resourceLink: native.resourceLink,
    resource: resource
  };
}

export class MessagesPoller extends EventEmitter {
  io: io.HttpIo;
  apiContext: ApiContext;
  intervalId: number | NodeJS.Timer | null;

  constructor (io: io.HttpIo, apiContext: ApiContext) {
    super();

    this.io = io;
    this.apiContext = apiContext;
    this.intervalId = null;
  }

  isActive (): boolean {
    return this.intervalId !== null;
  }

  run (): this {
    if (this.isActive()) {
      return this;
    }
    this.intervalId = setInterval(this.getMessages.bind(this), POLLING_DELAY);
    return this;
  }

  stop (): this {
    if (!this.isActive()) {
      return this;
    }
    clearInterval(<any> this.intervalId);
    this.intervalId = null;
    return this;
  }

  protected async getMessages (): Promise<void> {
    try {
      const requestOptions = {
        // TODO: explicitly define user, endpoint and subscription
        uri: messagesUri.poll(this.apiContext.registrationToken.host),
        jar: this.apiContext.cookieJar,
        headers: {
          RegistrationToken: this.apiContext.registrationToken.raw
        }
      };
      const res: io.Response = await this.io.post(requestOptions);

      if (res.statusCode !== 200) {
        return Promise.reject(new Incident("poll", "Unable to poll"));
      }

      const body: {eventMessages?: nativeEvents.EventMessage[]} = JSON.parse(res.body);

      if (body.eventMessages) {
        for (let msg of body.eventMessages) {
          // console.log(JSON.stringify(msg, null, 2));
          let formatted: events.EventMessage = formatEventMessage(msg);
          if (formatted && formatted.resource) {
            this.emit("event-message", formatted);
          }
        }
      }
    } catch (err) {
      console.error("Detecting an error");
      this.emit("error", err);
      // this.stop();
    }
  }
}

export default MessagesPoller;
