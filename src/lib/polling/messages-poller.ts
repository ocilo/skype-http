import cheerio from "cheerio";
import _events from "events";
import { Incident } from "incident";
import { ArrayType } from "kryo/types/array";
import { DocumentIoType, DocumentType } from "kryo/types/document";
import objectInspect from "object-inspect";
import { UnexpectedHttpStatusError } from "../errors/http";
import { ParsedConversationId } from "../interfaces/api/api";
import { Context as ApiContext } from "../interfaces/api/context";
import * as resources from "../interfaces/api/resources";
import * as httpIo from "../interfaces/http-io";
import * as nativeMessageResources from "../interfaces/native-api/message-resources";
import * as nativeResources from "../interfaces/native-api/resources";
import { JSON_READER } from "../json-reader";
import * as messagesUri from "../messages-uri";
import { $SkypeEvent, SkypeEvent } from "../types/events/skype-event";

// Perform one request every 1000 ms
const POLLING_DELAY: number = 1000;

// Match a contact id:
// TODO: handle the "guest" prefix
const CONTACT_ID_PATTERN: RegExp = /^(\d+):(.+)$/;

// TODO(demurgos): Looks like there is a problem with the return type
export function parseContactId(contactId: string): ParsedConversationId {
  const match: RegExpExecArray | null = CONTACT_ID_PATTERN.exec(contactId);
  if (match === null) {
    throw new Incident("parse-error", "Unable to parse userId");
  }
  return {
    raw: contactId,
    prefix: parseInt(match[1], 10),
    username: match[2],
  };
}

// tslint:disable-next-line:max-line-length
export function formatConversationUpdateResource(nativeResource: nativeResources.ConversationUpdate): resources.ConversationUpdateResource {
  const parsedConversationUri: messagesUri.ConversationUri = messagesUri
    .parseConversation(nativeResource.lastMessage.conversationLink);
  const parsedContactUri: messagesUri.ContactUri = messagesUri.parseContact(nativeResource.lastMessage.from);
  const parsedContactId: ParsedConversationId = parseContactId(parsedContactUri.contact);
  return {
    type: "ConversationUpdate",
    id: nativeResource.id,
    clientId: nativeResource.lastMessage.clientmessageid,
    composeTime: new Date(nativeResource.lastMessage.composetime),
    arrivalTime: new Date(nativeResource.lastMessage.originalarrivaltime),
    from: parsedContactId,
    conversation: parsedConversationUri.conversation,
    native: nativeResource,
    content: nativeResource.lastMessage.content,
  };
}

interface GetMessagesBody {
  /**
   * The `eventMessages` property is only present when the array is non-empty.
   */
  eventMessages?: SkypeEvent[];
}

const $GetMessagesBody: DocumentIoType<GetMessagesBody> = new DocumentType<GetMessagesBody>({
  properties: {
    eventMessages: {type: new ArrayType({itemType: $SkypeEvent, maxLength: Infinity}), optional: true},
  },
});

export class MessagesPoller extends _events.EventEmitter {
  io: httpIo.HttpIo;
  apiContext: ApiContext;
  intervalId: number | NodeJS.Timer | null;

  constructor(io: httpIo.HttpIo, apiContext: ApiContext) {
    super();

    this.io = io;
    this.apiContext = apiContext;
    this.intervalId = null;
  }

  isActive(): boolean {
    return this.intervalId !== null;
  }

  run(): this {
    if (this.isActive()) {
      return this;
    }
    this.intervalId = setInterval(this.getMessages.bind(this), POLLING_DELAY);
    return this;
  }

  stop(): this {
    if (!this.isActive()) {
      return this;
    }
    clearInterval(<any> this.intervalId);
    this.intervalId = null;
    return this;
  }

  /**
   * Get the new messages / events from the server.
   * This function always returns a successful promise once the messages are retrieved or an error happens.
   *
   * If any error happens, the message-poller will emit an `error` event with the error.
   */
  protected async getMessages(): Promise<void> {
    try {
      const request: httpIo.PostOptions = {
        // TODO: explicitly define user, endpoint and subscription
        uri: messagesUri.poll(this.apiContext.registrationToken.host),
        cookies: this.apiContext.cookies,
        headers: {
          RegistrationToken: this.apiContext.registrationToken.raw,
        },
      };

      const response: httpIo.Response = await this.io.post(request);
      if (response.statusCode !== 200) {
        const error: Error = UnexpectedHttpStatusError.create(response, new Set([200]), request);
        this.emit("error", error);
        return;
      }
      let result: GetMessagesBody;
      try {
        result = $GetMessagesBody.read(JSON_READER, response.body);
      } catch (err) {
        err.message = objectInspect(err.data, {depth: 20});
        this.emit("error", new Incident(err, "UnexpectedResponseBody", {body: response.body}));
        return;
      }
      if (result.eventMessages === undefined) {
        return;
      }
      for (const event of result.eventMessages) {
        this.emit("event", event);
      }
    } catch (err) {
      this.emit("error", Incident(err, "PollError", "Unable to poll the latest events"));
    }
  }
}
