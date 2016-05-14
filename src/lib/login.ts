import * as Bluebird from "bluebird";
import * as cheerio from "cheerio";
import {Promise} from "es6-promise";
import Incident from "incident";
import * as http from "http";
import * as request from "request";
import * as url from "url";
import * as _ from "lodash";

import {Credentials} from "./interfaces/index";
import {Dictionary} from "./interfaces/utils";
import {ApiContext, SkypeToken, RegistrationToken} from "./interfaces/api-context";
import * as Consts from "./consts";
import * as io from "./interfaces/io";
import SkypeAccount from "./skype_account";
import * as Utils from "./utils";
import {stringifyHeaderParams, parseHeaderParams} from "./utils";
import {hmacSha256} from "./utils/hmac-sha256";
import * as apiUri from "./api-uri";

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
 * Builds an Api context trough a new authentication.
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
      return getSkypeToken(ioOptions, options.credentials, loginKeys);
    })
    .then((skypeToken: SkypeToken) => {
      return getRegistrationToken(ioOptions, skypeToken, Consts.SKYPEWEB_DEFAULT_MESSAGES_HOST)
        .tap((registrationToken: RegistrationToken) => {
          return subscribeToResources(ioOptions, registrationToken);
        })
        .then((registrationToken: RegistrationToken) => {
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
  const inputBuffer = Buffer.from(String(time), "utf8");
  const appIdBuffer = Buffer.from(Consts.SKYPEWEB_LOCKANDKEY_APPID, "utf8");
  const secretBuffer = Buffer.from(Consts.SKYPEWEB_LOCKANDKEY_SECRET, "utf8");
  return hmacSha256(inputBuffer, appIdBuffer, secretBuffer);
}

// Get the token used to subscribe to resources
function getRegistrationToken (options: IOOptions, skypeToken: SkypeToken, apiHost: string, retry: number = 2): Bluebird<RegistrationToken> {
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
        uri: apiUri.endpoints(apiHost),
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

          let location = url.parse(locationHeader);
          if (location.host !== apiHost) { // mainly when 301, but sometimes when 201
            apiHost = location.host;
            if (retry > 0) {
              return getRegistrationToken(options, skypeToken, apiHost, retry--);
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
            host: apiHost
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
    uri: apiUri.subscriptions(registrationToken.host),
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

export class Login {
  private requestWithJar: any;

  constructor(cookieJar: request.CookieJar) {
    this.requestWithJar = request.defaults({jar: cookieJar});
  }

  public doLogin(skypeAccount: SkypeAccount) {
    let functions = [new Promise(this.sendLoginRequest.bind(this, skypeAccount)), this.getRegistrationToken, this.subscribeToResources, this.createStatusEndpoint, this.getSelfDisplayName];

    return <Promise<{}>> (functions.reduce((previousValue: Promise<{}>, currentValue: any)=> {
      return previousValue.then((skypeAccount: SkypeAccount) => {
        return new Promise(currentValue.bind(this, skypeAccount));
      });
    }));
  }

  private sendLoginRequest(skypeAccount: SkypeAccount, resolve: any, reject: any) {
    this.requestWithJar.get(Consts.SKYPEWEB_LOGIN_URL, (error: Error, response: any, body: any) => {
      if (!error && response.statusCode === 200) {
        let $ = cheerio.load(body);

        // we'll need those values to do successful auth
        let pie = $('input[name="pie"]').val();
        let etm = $('input[name="etm"]').val();

        if (!pie || !etm) {
          Utils.throwError("Failed to find pie or etm.");
        }

        let postParams = {
          url: Consts.SKYPEWEB_LOGIN_URL,
          form: {
            username: skypeAccount.username,
            password: skypeAccount.password,
            pie: pie,
            etm: etm,
            timezone_field: Utils.getTimezone(),
            js_time: Utils.getCurrentTime()
          }
        };
        // auth step
        this.requestWithJar.post(postParams, (error: Error, response: any, body: any) => {
          if (!error && response.statusCode === 200) {
            let $ = cheerio.load(body);
            skypeAccount.skypeToken = $('input[name="skypetoken"]').val();
            skypeAccount.skypeTokenExpiresIn = parseInt($('input[name="expires_in"]').val(), 10); // 86400 by default
            if (skypeAccount.skypeToken && skypeAccount.skypeTokenExpiresIn) {
              resolve(skypeAccount);
            } else {
              Utils.throwError("Failed to get skypetoken. Username or password is incorrect OR you've" +
                " hit a CAPTCHA wall." + $(".message_error").text());
            }
          } else {
            Utils.throwError("Failed to get skypetoken");
          }
        });
      } else {
        Utils.throwError("Failed to get pie and etm. Login failed.");
      }
    });
  }

  private getRegistrationToken(skypeAccount: SkypeAccount, resolve: any, reject: any) {
    let currentTime = Utils.getCurrentTime();
    let lockAndKeyResponse = Utils.getHMAC128(Buffer.from(String(currentTime), "utf8"), Buffer.from(Consts.SKYPEWEB_LOCKANDKEY_APPID, "utf8"), Buffer.from(Consts.SKYPEWEB_LOCKANDKEY_SECRET, "utf8"));
    this.requestWithJar.post(Consts.SKYPEWEB_HTTPS + skypeAccount.messagesHost + "/v1/users/ME/endpoints", {
      headers: {
        "LockAndKey": "appId=" + Consts.SKYPEWEB_LOCKANDKEY_APPID + "; time=" + currentTime + "; lockAndKeyResponse=" + lockAndKeyResponse,
        "ClientInfo": "os=Windows; osVer=10; proc=Win64; lcid=en-us; deviceType=1; country=n/a; clientName=" + Consts.SKYPEWEB_CLIENTINFO_NAME + "; clientVer=" + Consts.SKYPEWEB_CLIENTINFO_VERSION,
        "Authentication": "skypetoken=" + skypeAccount.skypeToken
      },
      body: "{}" // don't ask why
    }, (error: any, response: http.IncomingMessage, body: any) => {
      // now lets try retrieve registration token
      if (!error && response.statusCode === 201 || response.statusCode === 301) {
        let locationHeader = response.headers["location"];
        // expecting something like this "registrationToken=someSting; expires=someNumber; endpointId={someString}"
        let registrationTokenHeader = response.headers["set-registrationtoken"];
        let location = url.parse(locationHeader);
        if (location.host !== skypeAccount.messagesHost) { // mainly when 301, but sometimes when 201
          skypeAccount.messagesHost = location.host;
          // looks like messagesHost has changed?
          this.getRegistrationToken(skypeAccount, resolve, reject);
          return;
        }

        let registrationTokenParams = registrationTokenHeader.split(/\s*;\s*/).reduce((params: any, current: string) => {
          if (current.indexOf("registrationToken") === 0) {
            params["registrationToken"] = current;
          } else {
            let index = current.indexOf("=");
            if (index > 0) {
              params[current.substring(0, index)] = current.substring(index + 1);
            }
          }
          return params;
        }, {
          raw: registrationTokenHeader
        });
        if (!registrationTokenParams.registrationToken || !registrationTokenParams.expires || !registrationTokenParams.endpointId) {
          Utils.throwError("Failed to find registrationToken or expires or endpointId.");
        }
        registrationTokenParams.expires = parseInt(registrationTokenParams.expires, 10);

        skypeAccount.registrationTokenParams = registrationTokenParams;

        // fixme add endpoint and expires!
        resolve(skypeAccount);

      } else {
        Utils.throwError("Failed to get registrationToken." + error + JSON.stringify(response));
      }
    });
  }

  private subscribeToResources(skypeAccount: SkypeAccount, resolve: any, reject: any) {
    let interestedResources = [
      "/v1/threads/ALL",
      "/v1/users/ME/contacts/ALL",
      "/v1/users/ME/conversations/ALL/messages",
      "/v1/users/ME/conversations/ALL/properties"
    ];
    let requestBody = JSON.stringify({
      interestedResources: interestedResources,
      template: "raw",
      channelType: "httpLongPoll"// todo web sockets maybe ?
    });

    this.requestWithJar.post(Consts.SKYPEWEB_HTTPS + skypeAccount.messagesHost + "/v1/users/ME/endpoints/SELF/subscriptions", {
      body: requestBody,
      headers: {
        "RegistrationToken": skypeAccount.registrationTokenParams.raw
      }
    }, (error: any, response: http.IncomingMessage, body: any) => {
      if (!error && response.statusCode === 201) {
        resolve(skypeAccount);
      } else {
        Utils.throwError("Failed to subscribe to resources.");
      }
    });
  }

  private createStatusEndpoint(skypeAccount: SkypeAccount, resolve: any, reject: any) {
    if (!skypeAccount.registrationTokenParams.endpointId) {
      // there is no need in this case to create endpoint?
      resolve(skypeAccount);
      return;
    }
    // a little bit more of skype madness
    let requestBody = JSON.stringify({ // this is exact json that is needed to register endpoint for setting of status.
      "id": "messagingService",
      "type": "EndpointPresenceDoc",
      "selfLink": "uri",
      "privateInfo": {"epname": "skype"},
      "publicInfo": {
        "capabilities": "video|audio",
        "type": 1,
        "skypeNameVersion": Consts.SKYPEWEB_CLIENTINFO_NAME,
        "nodeInfo": "xx",
        "version": Consts.SKYPEWEB_CLIENTINFO_VERSION + "//" + Consts.SKYPEWEB_CLIENTINFO_NAME
      }
    });

    this.requestWithJar.put(Consts.SKYPEWEB_HTTPS + skypeAccount.messagesHost +
      "/v1/users/ME/endpoints/" + skypeAccount.registrationTokenParams.endpointId + "/presenceDocs/messagingService", {
      body: requestBody,
      headers: {
        "RegistrationToken": skypeAccount.registrationTokenParams.raw
      }
    }, (error: any, response: http.IncomingMessage, body: any) => {
      if (!error && response.statusCode === 200) {
        resolve(skypeAccount);
      } else {
        Utils.throwError("Failed to create endpoint for status." +
          ".\n Error code: " + response.statusCode +
          ".\n Error: " + error +
          ".\n Body: " + body
        );
      }
    });
  }

  private getSelfDisplayName(skypeAccout: SkypeAccount, resolve: any, reject: any) {
    this.requestWithJar.get(Consts.SKYPEWEB_HTTPS + Consts.SKYPEWEB_API_SKYPE_HOST + Consts.SKYPEWEB_SELF_DISPLAYNAME_URL, {
      headers: {
        "X-Skypetoken": skypeAccout.skypeToken
      }
    }, function (error: any, response: http.IncomingMessage, body: any) {
      if (!error && response.statusCode === 200) {
        skypeAccout.selfInfo = JSON.parse(body);
        resolve(skypeAccout);
      } else {
        Utils.throwError("Failed to get selfInfo.");
      }
    });
  }
}

export default Login;
