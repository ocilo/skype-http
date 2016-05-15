import * as request from "request";
import * as Consts from "./../consts";
import SkypeAccount from "./../skype_account";
import * as Utils from "./../utils";
import * as http from "http";
import {CookieJar} from "request";

import * as Bluebird from "bluebird";
import {EventEmitter} from "events";
import Incident from "incident";

import * as io from "../interfaces/io";
import * as api from "../interfaces/api";
import {ApiContext} from "../interfaces/api-context";
import * as nativeResources from "../interfaces/native-resources";
import {Api} from "../api";
import * as messagesUri from "../messages-uri";

// Perform one request every 1000 ms
const POLLING_DELAY = 1000;

export interface NativeEventMessage {
  id: number;
  type: "EventMessage" | string; // TODO: check the available types
  resourceType: "NewMessage" | string; // TODO: check
  time: string;
  resourceLink: string; // https://{host}/v1/users/ME/conversations/{conversation}/messages/{id}
  resource: nativeResources.NativeResource;
}

function formatTextResource (nativeResource: nativeResources.Text): api.TextResource {
  return {
    type: "Text",
    id: nativeResource.id,
    clientId: nativeResource.clientmessageid,
    composeTime: new Date(nativeResource.composetime),
    arrivalTime: new Date(nativeResource.originalarrivaltime),
    from: nativeResource.from,
    conversation: nativeResource.conversationLink,
    content: nativeResource.content
  };
}

function formatResource (nativeResource: nativeResources.NativeResource): api.Resource {
  switch (nativeResource.messagetype) {
    case "Text":
      return formatTextResource(<nativeResources.Text> nativeResource);
    default:
      // TODO
      return null;
  }
}

function formatEventMessage(native: NativeEventMessage): api.EventMessage {
  return {
    id: native.id,
    type: native.type,
    resourceType: native.resourceType,
    time: new Date(native.time),
    resourceLink: native.resourceLink,
    resource: formatResource(native.resource)
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
        const body: {eventMessages?: NativeEventMessage[]} = JSON.parse(res.body);

        if (body.eventMessages) {
          for (let msg of body.eventMessages) {
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

export class Poll {
  private requestWithJar: any;

  private static parsePollResult(pollResult: any, messagesCallback: (messages: Array<any>)=>void) {
    if (pollResult.eventMessages) {
      let messages = pollResult.eventMessages.filter((item: any) => {
        return item.resourceType === "NewMessage"; // Fixme there are a lot more EventMessage's types!
      });
      if (messages.length) {
        messagesCallback(messages);
      }
    }
  }

  constructor(cookieJar: CookieJar) {
    this.requestWithJar = request.defaults({jar: cookieJar});
  }

  public pollAll(skypeAccount: SkypeAccount, messagesCallback: (messages: Array<any>)=>void) {
    setTimeout(()=> {
      this.requestWithJar.post(Consts.SKYPEWEB_HTTPS + skypeAccount.messagesHost + "/v1/users/ME/endpoints/SELF/subscriptions/0/poll", {
        headers: {
          "RegistrationToken": skypeAccount.registrationTokenParams.raw
        }
      }, (error: any, response: http.IncomingMessage, body: any) => {
        if (!error && response.statusCode === 200) {
          Poll.parsePollResult(JSON.parse(body), messagesCallback);
        } else {
          Utils.throwError("Failed to poll messages." +
            ".\n Error code: " + (response && response.statusCode ? response.statusCode : "none") +
            ".\n Error: " + error +
            ".\n Body: " + body
          );
        }
        this.pollAll(skypeAccount, messagesCallback);
      });
    }, 1000);
  }
}

export default Poll;
