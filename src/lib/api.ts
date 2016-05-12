import {EventEmitter} from "events";
import {CookieJar} from "request";
import {IO} from "./interfaces/io";
import * as Bluebird from "bluebird";

export interface Context {
  username: string;
  skypeToken: string;
  skypeTokenExpirationDate: Date;
  cookieJar: CookieJar;
}

export class Api extends EventEmitter implements  ApiEvents {
  context: Context;
  io: IO;

  constructor (context: Context, io: IO) {
    super();
    this.context = context;
    this.io = io;
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
