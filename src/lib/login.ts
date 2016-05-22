import * as Bluebird from "bluebird";
import * as cheerio from "cheerio";
import {Incident} from "incident";
import * as request from "request";
import {parse as parseUri} from "url";

import {Credentials} from "./interfaces/index";
import {Dictionary} from "./interfaces/utils";
import {ApiContext, SkypeToken, RegistrationToken} from "./interfaces/api-context";
import * as Consts from "./consts";
import * as io from "./interfaces/io";
import * as Utils from "./utils";
import {stringifyHeaderParams, parseHeaderParams} from "./utils";
import {hmacSha256} from "./utils/hmac-sha256";
import * as messagesUri from "./messages-uri";

export interface LoginOptions {
  io: io.IO;
  credentials: Credentials;
  verbose?: boolean;
}

interface LoginKeys {
  pie: string;
  etm: string;
}

interface SkypeTokenRequest {
  username: string;
  password: string;
  pie: string;
  etm: string;
  timezone_field: string;
  js_time: number;
}

interface SkypeTokenResponse {
  skypetoken: string;
  expires_in: number;
}

interface IOOptions {
  io: io.IO;
  jar: request.CookieJar;
}

/**
 * Builds an Api apiContext trough a new authentication.
 * This involves the requests:
 * GET <loginUrl> to scrap the LoginKeys (pie & etm)
 * POST <loginUrl> to get the SkypeToken from the credentials and LoginKeys
 * POST <registrationUrl> to get RegistrationToken from the SkypeToken
 *   Eventually, follow a redirection to use the assigned host
 * POST <susbscription> to gain access to resources with the RegistrationToken
 *
 * @param options
 * @returns {Bluebird<ApiContext>}
 */
export function login (options: LoginOptions): Bluebird<ApiContext> {
  let jar: request.CookieJar = request.jar();

  let ioOptions = {io: options.io, jar: jar};

  return getLoginKeys(ioOptions)
    .then((loginKeys: LoginKeys) => {
      if (options.verbose) {
        console.log("Acquired LoginKeys");
      }
      return getSkypeToken(ioOptions, options.credentials, loginKeys);
    })
    .then((skypeToken: SkypeToken) => {
      if (options.verbose) {
        console.log("Acquired SkypeToken");
      }
      return getRegistrationToken(ioOptions, skypeToken, Consts.SKYPEWEB_DEFAULT_MESSAGES_HOST)
        .tap((registrationToken: RegistrationToken) => {
          if (options.verbose) {
            console.log("Acquired RegistrationToken");
          }
          return subscribeToResources(ioOptions, registrationToken);
        })
        .tap((registrationToken: RegistrationToken) => {
          if (options.verbose) {
            console.log("Subscribed to resources");
          }
          return createPresenceDocs(ioOptions, registrationToken);
        })
        .then((registrationToken: RegistrationToken) => {
          if (options.verbose) {
            console.log("Created presence docs");
          }
          let context: ApiContext = {
            username: options.credentials.username,
            skypeToken: skypeToken,
            cookieJar: jar,
            registrationToken: registrationToken
          };
          return context;
        });
    });
}

function getLoginKeys (options: IOOptions): Bluebird<LoginKeys> {
  const requestOptions: io.GetOptions = {
    uri: Consts.SKYPEWEB_LOGIN_URL,
    jar: options.jar
  };

  return Bluebird.resolve(options.io.get(requestOptions))
    .then((res: io.Response) => {
      if (res.statusCode !== 200) {
        return Bluebird.reject(new Incident("net", "Unable to GET the login page"));
      }
      return Bluebird.resolve(scrapLoginKeys(res.body));
    });
}

function scrapLoginKeys (html: string): LoginKeys {
  const $: cheerio.Static = cheerio.load(html);

  const result: LoginKeys = {
    pie: $('input[name="pie"]').val(),
    etm: $('input[name="etm"]').val()
  };

  if (!result.pie || !result.etm) {
    throw new Incident("scrapping", "Unable to retrieve the pie and etm keys from the login page");
  }

  return result;
}

function getSkypeToken (ioOptions: IOOptions, credentials: Credentials, loginKeys: LoginKeys): Bluebird<SkypeToken> {
  const startTime = Utils.getCurrentTime();
  const data: SkypeTokenRequest = {
    username: credentials.username,
    password: credentials.password,
    pie: loginKeys.pie,
    etm: loginKeys.etm,
    timezone_field: Utils.getTimezone(),
    js_time: Utils.getCurrentTime()
  };
  const requestOptions: io.PostOptions = {
    uri: Consts.SKYPEWEB_LOGIN_URL,
    form: data,
    jar: ioOptions.jar
  };

  return Bluebird.resolve (ioOptions.io.post(requestOptions))
    .then((res: io.Response) => {
      if (res.statusCode !== 200) {
        return Bluebird.reject(new Incident("net", "Unable to get the response for the authentication POST request"));
      }

      const scrapped: SkypeTokenResponse = scrapSkypeToken(res.body);
      const skypeToken: SkypeToken = {
        value: scrapped.skypetoken,
        expirationDate: new Date(1000 * (startTime + scrapped.expires_in)) // multiply by 1000 to get milliseconds
      };

      return Bluebird.resolve(skypeToken);
    });
}

function scrapSkypeToken (html: string): SkypeTokenResponse {
  const $: cheerio.Static = cheerio.load(html);

  const result: SkypeTokenResponse = {
    skypetoken: $('input[name="skypetoken"]').val(),
    expires_in: parseInt($('input[name="expires_in"]').val(), 10) // 86400 sec by default
  };

  if (!result.skypetoken || !result.expires_in) {
    const skypeErrorMessage = $(".message_error").text();
    const errorName = "authentication-failed";
    const errorMessage = "Failed to get skypetoken. Username or password is incorrect OR you've hit a CAPTCHA wall.";
    if (skypeErrorMessage) {
      const skypeError = new Incident("skype-error", skypeErrorMessage);
      throw new Incident(skypeError, errorName, errorMessage);
    } else {
      throw new Incident(errorName, errorMessage);
    }
  }
  return result;
}

function getLockAndKeyResponse (time: number): string {
  const inputBuffer: Buffer = (<any> Buffer).from(String(time), "utf8");
  const appIdBuffer: Buffer = (<any> Buffer).from(Consts.SKYPEWEB_LOCKANDKEY_APPID, "utf8");
  const secretBuffer: Buffer = (<any> Buffer).from(Consts.SKYPEWEB_LOCKANDKEY_SECRET, "utf8");
  return hmacSha256(inputBuffer, appIdBuffer, secretBuffer);
}

// Get the token used to subscribe to resources
function getRegistrationToken (options: IOOptions, skypeToken: SkypeToken, messagesHost: string, retry: number = 2): Bluebird<RegistrationToken> {
  return Bluebird
    .try(() => {
      const startTime: number = Utils.getCurrentTime();
      const lockAndKeyResponse: string = getLockAndKeyResponse(startTime);
      const headers: Dictionary<string> = {
        LockAndKey: stringifyHeaderParams({
          appId: Consts.SKYPEWEB_LOCKANDKEY_APPID,
          time: String(startTime),
          lockAndKeyResponse: lockAndKeyResponse,
        }),
        ClientInfo: stringifyHeaderParams({
          os: "Windows",
          osVer: "10",
          proc: "Win64",
          lcid: "en-us",
          deviceType: "1",
          country: "n/a",
          clientName: Consts.SKYPEWEB_CLIENTINFO_NAME,
          clientVer: Consts.SKYPEWEB_CLIENTINFO_VERSION
        }),
        Authentication: stringifyHeaderParams({
          skypetoken: skypeToken.value
        })
      };

      const requestOptions: io.PostOptions = {
        uri: messagesUri.endpoints(messagesHost),
        headers: headers,
        jar: options.jar,
        body: "{}" // Skype requires you to send an empty object as a body
      };

      return Bluebird.resolve(options.io.post(requestOptions))
        .then((res: io.Response) => {
          if (res.statusCode !== 201 && res.statusCode !== 301) {
            return Bluebird.reject(new Incident("net", "Unable to register an endpoint"));
          }
          // TODO: handle statusCode 201 & 301

          let locationHeader = res.headers["location"];

          let location = parseUri(locationHeader); // TODO: parse in messages-uri.ts
          if (location.host !== messagesHost) { // mainly when 301, but sometimes when 201
            messagesHost = location.host;
            if (retry > 0) {
              return getRegistrationToken(options, skypeToken, messagesHost, retry--);
            } else {
              return Bluebird.reject(new Incident("net", "Exceeded max tries"));
            }
          }

          // registrationTokenHeader is like "registrationToken=someString; expires=someNumber; endpointId={someString}"
          let registrationTokenHeader = res.headers["set-registrationtoken"];
          let parsedHeader = parseHeaderParams(registrationTokenHeader);

          if (!parsedHeader["registrationToken"] || !parsedHeader["expires"] || !parsedHeader["endpointId"]) {
            return Bluebird.reject(new Incident("protocol", "Missing parameters for the registrationToken"));
          }

          const expires = parseInt(parsedHeader["expires"], 10); // in seconds

          const registrationToken: RegistrationToken = {
            value: parsedHeader["registrationToken"],
            expirationDate: new Date(1000 * expires),
            endpointId: parsedHeader["endpointId"],
            raw: registrationTokenHeader,
            host: messagesHost
          };

          return Bluebird.resolve(registrationToken);
        });
    });
}

function subscribeToResources(ioOptions: IOOptions, registrationToken: RegistrationToken): Bluebird<any> {
  const requestDocument = {
    interestedResources: [
      "/v1/threads/ALL",
      "/v1/users/ME/contacts/ALL",
      "/v1/users/ME/conversations/ALL/messages",
      "/v1/users/ME/conversations/ALL/properties"
    ],
    template: "raw",
    channelType: "httpLongPoll"// TODO: use websockets ?
  };

  const requestOptions = {
    uri: messagesUri.subscriptions(registrationToken.host),
    jar: ioOptions.jar,
    body: JSON.stringify(requestDocument),
    headers: {
      RegistrationToken: registrationToken.raw
    }
  };

  return Bluebird.resolve(ioOptions.io.post(requestOptions))
    .then((res: io.Response) => {
      if (res.statusCode !== 201) {
        return Bluebird.reject(new Incident("net", "Unable to subscribe to resources"));
      }

      // Example response:
      // {
      //   "statusCode": 201,
      //   "body": "{}",
      //   "headers": {
      //     "cache-control": "no-store, must-revalidate, no-cache",
      //       "pragma": "no-cache",
      //       "content-length": "2",
      //       "content-type": "application/json; charset=utf-8",
      //       "location": "https://db5-client-s.gateway.messenger.live.com/v1/users/ME/endpoints/SELF/subscriptions/0",
      //       "x-content-type-options": "nosniff",
      //       "contextid": "tcid=3434983151221922702,server=DB5SCH101121535",
      //       "date": "Sat, 14 May 2016 16:41:17 GMT",
      //       "connection": "close"
      //   }
      // }

      return Bluebird.resolve(null);
    });
}

function createPresenceDocs(ioOptions: IOOptions, registrationToken: RegistrationToken): Bluebird<any> {
  return Bluebird
    .try(() => {
      if (!registrationToken.endpointId) {
        return Bluebird.reject(new Incident("Missing endpoint id in registration token"));
      }

      const requestBody = { // this is exact json that is needed to register endpoint for setting of status.
        id: "endpointMessagingService",
        type: "EndpointPresenceDoc",
        selfLink: "uri",
        privateInfo: {
          epname: "skype" // Name of the endpoint (normally the name of the host)
        },
        publicInfo: {
          capabilities: "video|audio",
          type: 1,
          skypeNameVersion: Consts.SKYPEWEB_CLIENTINFO_NAME,
          nodeInfo: "xx",
          version: Consts.SKYPEWEB_CLIENTINFO_VERSION + "//" + Consts.SKYPEWEB_CLIENTINFO_NAME
        }
      };

      const requestOptions = {
        uri: messagesUri.endpointMessagingService(registrationToken.host, messagesUri.DEFAULT_USER, registrationToken.endpointId),
        jar: ioOptions.jar,
        body: JSON.stringify(requestBody),
        headers: {
          "RegistrationToken": registrationToken.raw
        }
      };

      return ioOptions.io.put(requestOptions);
    })
    .then((res: io.Response) => {
      if (res.statusCode !== 200) {
        return Bluebird.reject(new Incident("net", "Unable to create presence endpoint"));
      }
      return Bluebird.resolve(null);
    });
}

export default login;
