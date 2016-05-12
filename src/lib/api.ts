import {EventEmitter} from "events";
import {CookieJar} from "request";
import {IO} from "./io";

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
}

export interface ApiEvents extends NodeJS.EventEmitter {

}

export interface SendMessageOptions {
  body: string;
  messageType?: string;
  contentType?: string;
}

export default Api;
