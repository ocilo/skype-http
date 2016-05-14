import {EventEmitter} from "events";
import {CookieJar} from "request";
import {IO} from "./interfaces/io";
import * as Bluebird from "bluebird";
import {Contact} from "./interfaces/api";
import {ApiContext as Context} from "./interfaces/api-context";

import getContacts from "./api/get-contacts"

export class Api extends EventEmitter implements  ApiEvents {
  context: Context;
  io: IO;

  constructor (context: Context, io: IO) {
    super();
    this.context = context;
    this.io = io;
  }

  getContacts(): Bluebird<Contact[]> {
    return getContacts(this.io, this.context);
  }

  sendMessage (conversationId: string, options: SendMessageOptions) {

  }

  /**
   * Start polling and emitting events
   */
  listen (): Bluebird<any> {
    return null;
  }

  protected handlePollingEvent(ev: any): any {

  }
}

export interface ApiEvents extends NodeJS.EventEmitter {

}

export interface SendMessageOptions {
  body: string;
  messageType?: string;
  contentType?: string;
}

export default Api;
