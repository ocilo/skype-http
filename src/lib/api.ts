import * as Bluebird from "bluebird";
import {EventEmitter} from "events";
import {CookieJar} from "request";
import {Incident} from "incident";

import acceptContactRequest from "./api/accept-contact-request";
import declineContactRequest from "./api/decline-contact-request";
import getContact from "./api/get-contact";
import getContacts from "./api/get-contacts";
import getConversation from "./api/get-conversation";
import getConversations from "./api/get-conversations";
import sendMessage from "./api/send-message";
import setStatus from "./api/set-status";
import {IO} from "./interfaces/io";
import {MessagesPoller} from "./polling/messages-poller";

import * as apiEvents from "./interfaces/api/events";
import * as api from "./interfaces/api/api";
import {Contact} from "./interfaces/api/contact";
import {Context as ApiContext} from "./interfaces/api/context";
import {Conversation} from "./interfaces/api/conversation";

export class Api extends EventEmitter implements ApiEvents {
  io: IO;
  context: ApiContext;
  messagesPoller: MessagesPoller;

  constructor (context: ApiContext, io: IO) {
    super();
    this.context = context;
    this.io = io;
    this.messagesPoller = new MessagesPoller(this.io, this.context);
    this.messagesPoller.on("error", (err: Error) => this.emit("error", err));
    this.messagesPoller.on("event-message", (ev: apiEvents.EventMessage) => this.handlePollingEvent(ev));
  }

  acceptContactRequest(contactUsername: string): Bluebird<this> {
    return acceptContactRequest(this.io, this.context, contactUsername).thenReturn(this);
  }

  declineContactRequest (contactUsername: string): Bluebird<this> {
    return declineContactRequest(this.io, this.context, contactUsername).thenReturn(this);
  }

  getContact (contactId: string): Bluebird<Contact> {
    return getContact(this.io, this.context, contactId);
  }

  getContacts (): Bluebird<Contact[]> {
    return getContacts(this.io, this.context);
  }

  getConversation (conversationId: string): Bluebird<Conversation> {
    return getConversation(this.io, this.context, conversationId);
  }

  getConversations (): Bluebird<Conversation[]> {
    return getConversations(this.io, this.context);
  }

  sendMessage (message: api.NewMessage, conversationId: string): Bluebird<api.SendMessageResult> {
    return sendMessage(this.io, this.context, message, conversationId);
  }

  setStatus (status: api.Status): Bluebird<any> {
    return setStatus(this.io, this.context, status);
  }

  /**
   * Start polling and emitting events
   */
  listen (): Bluebird<this> {
    this.messagesPoller.run();
    return Bluebird.resolve(this);
  }

  /**
   * Stop polling and emitting events
   */
  stopListening (): Bluebird<this> {
    this.messagesPoller.stop();
    return Bluebird.resolve(this);
  }

  protected handlePollingEvent(ev: apiEvents.EventMessage): any {
    this.emit("event", ev);

    // Prevent echo
    if (ev.resource.from.username === this.context.username) {
      return;
    }

    if (ev && ev.resource && ev.resource.type === "Text") {
      this.emit("Text", ev.resource);
    } else if (ev && ev.resource && ev.resource.type === "RichText") {
      this.emit("RichText", ev.resource);
    }
  }
}

export interface ApiEvents extends NodeJS.EventEmitter {

}

export default Api;
