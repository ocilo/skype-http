import * as Bluebird from "bluebird";
import {EventEmitter} from "events";
import Incident from "incident";

import * as io from "../interfaces/io";
import * as api from "../interfaces/api";
import {ApiContext} from "../interfaces/api-context";
import * as nativeApi from "../interfaces/native-api";
import * as messagesUri from "../messages-uri";
import {ParsedUserId} from "../interfaces/index";

// Perform one request every 1000 ms
const POLLING_DELAY = 1000;

const CONTACT_ID_PATTERN = /^(\d+):(.+)$/;
function parseContactId(contactId: string): ParsedUserId {
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

function formatRichTextResource (nativeResource: nativeApi.RichText): api.RichTextResource {
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

function formatTextResource (nativeResource: nativeApi.Text): api.TextResource {
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

function formatMessageResource (nativeResource: nativeApi.MessageResource): api.Resource {
  switch (nativeResource.messagetype) {
    case "RichText":
      return formatRichTextResource(<nativeApi.RichText> nativeResource);
    case "Text":
      return formatTextResource(<nativeApi.Text> nativeResource);
    default:
      // TODO
      return null;
  }
}

function formatEventMessage(native: nativeApi.EventMessage): api.EventMessage {
  let resource: api.Resource;
  switch (native.resourceType) {
    case "UserPresence":
      resource = null;
      break;
    case "EndpointPresence":
      resource = null;
      break;
    case "NewMessage":
      resource = formatMessageResource(<nativeApi.MessageResource> native.resource);
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

  protected getMessages (): Bluebird<api.EventMessage> {
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
        const body: {eventMessages?: nativeApi.EventMessage[]} = JSON.parse(res.body);

        if (body.eventMessages) {
          for (let msg of body.eventMessages) {
            // console.log(JSON.stringify(msg, null, 2));
            let formatted: api.EventMessage = formatEventMessage(msg);
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
