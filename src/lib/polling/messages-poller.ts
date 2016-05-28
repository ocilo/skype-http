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
import * as resources from "../interfaces/api/resources"
import * as events from "../interfaces/api/events"

// Perform one request every 1000 ms
const POLLING_DELAY = 1000;

const CONTACT_ID_PATTERN = /^(\d+):(.+)$/;
function parseContactId(contactId: string): ParsedConversationId {
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

function formatRichTextResource (nativeResource: nativeMessageResources.RichText): resources.RichTextResource {
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

function formatTextResource (nativeResource: nativeMessageResources.Text): resources.TextResource {
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

function formatMessageResource (nativeResource: nativeResources.MessageResource): resources.Resource {
  switch (nativeResource.messagetype) {
    case "RichText":
      return formatRichTextResource(<nativeMessageResources.RichText> nativeResource);
    case "Text":
      return formatTextResource(<nativeMessageResources.Text> nativeResource);
    default:
      // TODO
      return null;
  }
}

function formatEventMessage(native: nativeEvents.EventMessage): events.EventMessage {
  let resource: resources.Resource;
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
      return null;
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
  io: io.IO;
  apiContext: ApiContext;
  intervalId: number | NodeJS.Timer;

  constructor (io: io.IO, apiContext: ApiContext) {
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
      return;
    }
    this.intervalId = setInterval(this.getMessages.bind(this), POLLING_DELAY);
    return this;
  }

  stop (): this {
    if (!this.isActive()) {
      return;
    }
    clearInterval(<any> this.intervalId);
    this.intervalId = null;
    return this;
  }

  protected getMessages (): Bluebird<events.EventMessage> {
    return Bluebird
      .try(() => {
        const requestOptions = {
          uri: messagesUri.poll(this.apiContext.registrationToken.host), // TODO: explicitly define user, endpoint and subscription
          jar: this.apiContext.cookieJar,
          headers: {
            RegistrationToken: this.apiContext.registrationToken.raw
          }
        };
        return this.io.post(requestOptions);
      })
      .then((res: io.Response) => {
        if (res.statusCode !== 200) {
          return Bluebird.reject(new Incident("poll", "Unable to poll"));
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
      })
      .catch((err: Error) => {
        this.stop();
        this.emit("error", err);
        return Bluebird.reject(err);
      });
  }
}

export default MessagesPoller;
