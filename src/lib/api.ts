import { EventEmitter } from "events";
import { acceptContactRequest } from "./api/accept-contact-request";
import { declineContactRequest } from "./api/decline-contact-request";
import { getContact } from "./api/get-contact";
import { getContacts } from "./api/get-contacts";
import { getConversation } from "./api/get-conversation";
import { getConversations } from "./api/get-conversations";
import { sendImage } from "./api/send-image";
import { sendMessage } from "./api/send-message";
import { setStatus } from "./api/set-status";
import * as api from "./interfaces/api/api";
import { Contact } from "./interfaces/api/contact";
import { Context as ApiContext } from "./interfaces/api/context";
import { Conversation } from "./interfaces/api/conversation";
import * as apiEvents from "./interfaces/api/events";
import { HttpIo } from "./interfaces/http-io";
import { MessagesPoller } from "./polling/messages-poller";

export interface ApiEvents extends NodeJS.EventEmitter {

}

export class Api extends EventEmitter implements ApiEvents {
  io: HttpIo;
  context: ApiContext;
  messagesPoller: MessagesPoller;

  constructor(context: ApiContext, io: HttpIo) {
    super();
    this.context = context;
    this.io = io;
    this.messagesPoller = new MessagesPoller(this.io, this.context);
    this.messagesPoller.on("error", (err: Error) => this.emit("error", err));
    // tslint:disable-next-line:no-void-expression
    this.messagesPoller.on("event-message", (ev: apiEvents.EventMessage) => this.handlePollingEvent(ev));
  }

  async acceptContactRequest(contactUsername: string): Promise<this> {
    await acceptContactRequest(this.io, this.context, contactUsername);
    return this;
  }

  async declineContactRequest(contactUsername: string): Promise<this> {
    await declineContactRequest(this.io, this.context, contactUsername);
    return this;
  }

  async getContact(contactId: string): Promise<Contact> {
    return getContact(this.io, this.context, contactId);
  }

  async getContacts(): Promise<Contact[]> {
    return getContacts(this.io, this.context);
  }

  async getConversation(conversationId: string): Promise<Conversation> {
    return getConversation(this.io, this.context, conversationId);
  }

  async getConversations(): Promise<Conversation[]> {
    return getConversations(this.io, this.context);
  }

  async sendMessage(message: api.NewMessage, conversationId: string): Promise<api.SendMessageResult> {
    return sendMessage(this.io, this.context, message, conversationId);
  }

  async sendImage(message: api.NewImage, conversationId: string): Promise<api.SendMessageResult> {
    return sendImage(this.io, this.context, message, conversationId);
  }

  getState(): ApiContext.Json {
    return ApiContext.toJson(this.context);
  }

  async setStatus(status: api.Status): Promise<void> {
    return setStatus(this.io, this.context, status);
  }

  /**
   * Start polling and emitting events
   */
  async listen(): Promise<this> {
    this.messagesPoller.run();
    return Promise.resolve(this);
  }

  /**
   * Stop polling and emitting events
   */
  async stopListening(): Promise<this> {
    this.messagesPoller.stop();
    return Promise.resolve(this);
  }

  protected handlePollingEvent(ev: apiEvents.EventMessage): void {
    this.emit("event", ev);

    if (ev.resource === null) {
      return;
    }

    // Prevent infinite-loop (echo itself)
    if (ev.resource.from.username === this.context.username) {
      return;
    }

    if (ev.resource.type === "Text") {
      this.emit("Text", ev.resource);
    } else if (ev.resource.type === "RichText") {
      this.emit("RichText", ev.resource);
    }
  }
}
