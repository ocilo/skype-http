import {EventEmitter} from "events";
import {IO} from "./io";

export class Api extends EventEmitter implements  ApiEvents {
  io: IO;
  
  constructor (io: IO) {
    super();
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
