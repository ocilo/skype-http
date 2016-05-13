import * as Bluebird from "bluebird";
import * as cheerio from "cheerio";
import {Promise} from "es6-promise";
import Incident from "incident";
import * as http from "http";
import * as request from "request";
import * as url from "url";
import * as _ from "lodash";

import {Credentials, Dictionary} from "./interfaces/index";
import {Context as ApiContext} from "./api";
import * as Consts from "./consts";
import * as io from "./interfaces/io";
import SkypeAccount from "./skype_account";
import * as Utils from "./utils";
import {hmacSha256} from "./utils/hmac-sha256";

export interface LoginOptions {
  io: io.IO;
  credentials: Credentials;
  verbose?: boolean;
}

interface LoginPageKeys {
  pie: string;
  etm: string;
}

interface AuthenticationRequest {
  username: string;
  password: string;
  pie: string;
  etm: string;
  timezone_field: string;
  js_time: number;
}

interface AuthenticationResponse {
  skypetoken: string;
  expires_in: number;
}

/**
 * Builds an Api context trough a new authentication.
 * This involves two request:
 * GET <loginUrl> to scrap two keys (pie & etm)
 * POST <loginUrl> to perform the authentication and aquire the Skype token
 *
 * @param io
 * @param credentials
 * @returns {Bluebird<ApiContext>}
 */
export function login(options: LoginOptions): Bluebird<ApiContext> {
  let jar: request.CookieJar = request.jar();
  let startTime = Date.now();
  let apiHost = this.messagesHost = Consts.SKYPEWEB_DEFAULT_MESSAGES_HOST;

  return getLoginPageKeys(options.io, jar)
    .then((keys: LoginPageKeys) => {
      const authenticationData: AuthenticationRequest = {
        username: options.credentials.username,
        password: options.credentials.password,
        pie: keys.pie,
        etm: keys.etm,
        timezone_field: Utils.getTimezone(),
        js_time: Utils.getCurrentTime()
      };
      return getToken(options.io, jar, authenticationData)
        .then((result: AuthenticationResponse) => {
          let context: ApiContext = {
            username: options.credentials.username,
            skypeToken: result.skypetoken,
            skypeTokenExpirationDate: new Date(startTime + result.expires_in),
            cookieJar: jar,
            apiHost: apiHost
          };
          return context;
        });
    });
}

function getLoginPageKeys(io: io.IO, jar: request.CookieJar): Bluebird<LoginPageKeys> {
  const options: io.GetOptions = {
    uri: Consts.SKYPEWEB_LOGIN_URL,
    jar: jar
  };

  return Bluebird.resolve(io.get(options))
    .then((res: io.Response) => {
      if (res.statusCode !== 200) {
        return Bluebird.reject(new Incident("net", "Unable to GET the login page"));
      }

      return Bluebird.resolve(scrapLoginPageKeys(res.body));
    });
}

function scrapLoginPageKeys (html: string): LoginPageKeys {
  const $: cheerio.Static = cheerio.load(html);

  const result: LoginPageKeys = {
    pie: $('input[name="pie"]').val(),
    etm: $('input[name="etm"]').val()
  };

  if (!result.pie || !result.etm) {
    throw new Incident("scrapping", "Unable to retrieve the pie and etm keys from the login page");
  }

  return result;
}

function getToken (io: io.IO, jar: request.CookieJar, data: AuthenticationRequest): Bluebird<any> {
  const options: io.PostOptions = {
    uri: Consts.SKYPEWEB_LOGIN_URL,
    form: data,
    jar: jar
  };

  return Bluebird.resolve(io.post(options))
    .then((res: io.Response) => {
      if (res.statusCode !== 200) {
        return Bluebird.reject(new Incident("net", "Unable to get the response for the authentication POST request"));
      }

      return Bluebird.resolve(scrapSkypeToken(res.body));
    });
}

function scrapSkypeToken (html: string): AuthenticationResponse {
  const $: cheerio.Static = cheerio.load(html);

  const result: AuthenticationResponse = {
    skypetoken: $('input[name="skypetoken"]').val(),
    expires_in: parseInt($('input[name="expires_in"]').val(), 10) * 1000 // 86400 sec by default, multiply by 1000 to get milliseconds
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

function encodeData (data: string): string {
  return encodeURIComponent(data).replace(/%20/gm, "+");
}

function decodeData (data: string): string {
  return decodeURIComponent(data.replace(/\+/gm, " "));
}

function serializeParams (params: Dictionary<string>) {
  return _.map(params, (value, key) => `${encodeData(key)}=${encodeData(value)}`).join("; ");
}

// TODO: check with skype-web-reversed
function deserializeParams (params: string): Dictionary<string> {
  return _.fromPairs(
    <[string, string][]> params
      .split(/\s*;\s*/)
      .map((pairString, idx) => {
        let pair = pairString.split(/\s*=\s*/).map(s => _.trim(s));
        if (pair.length !== 2) {
          throw new Incident("parse:params", "Unable to parse params");
        }
        return pair;
      })
  );
}

function getUri(host: string, path: string) {
  return Consts.SKYPEWEB_HTTPS + host + path;
}

// This token is used to subscribe to resources
function getRegistrationToken(io: io.IO, jar: request.CookieJar, apiContext: ApiContext): any {
  return Bluebird
    .try(() => {
      const currentTime: number = Utils.getCurrentTime();
      const lockAndKeyResponse: string = getLockAndKeyResponse(currentTime);
      const headers: Dictionary<string> = {
        LockAndKey: serializeParams({
          appId: Consts.SKYPEWEB_LOCKANDKEY_APPID,
          time: String(currentTime),
          lockAndKeyResponse: lockAndKeyResponse,
        }),
        ClientInfo: serializeParams({
          os: "Windows",
          osVer: "10",
          lcid: "en-us",
          deviceType: "1",
          country: "n/a",
          clientName: Consts.SKYPEWEB_CLIENTINFO_NAME,
          clientVer: Consts.SKYPEWEB_CLIENTINFO_VERSION
        }),
        Authentication: serializeParams({
          skypetoken: apiContext.skypeToken
        })
      };

      const requestOptions: io.PostOptions = {
        uri: getUri(apiContext.apiHost, "/v1/users/ME/endpoints"),
        headers: headers,
        jar: jar,
        body: "{}" // Skype requires you to send an empty object as a body
      };

      return Bluebird.resolve(io.post(requestOptions))
        .then((res: io.Response) => {
          if (res.statusCode !== 200) {
            return Bluebird.reject(new Incident("net", "Unable to register an endpoint"));
          }
          // TODO: handle statusCode 201 & 301

          let locationHeader = res.headers["location"];

          // TODO:
          // let location = url.parse(locationHeader);
          // if (location.host !== apiContext.apiHost) { // mainly when 301, but sometimes when 201
          //   apiContext.apiHost = location.host;
          //   return this.getRegistrationToken(io, jar, apiContext);
          // }

          // expecting something like this "registrationToken=someString; expires=someNumber; endpointId={someString}"
          let registrationTokenHeader = res.headers["set-registrationtoken"];
          let registrationToken = deserializeParams(registrationTokenHeader);

          if (!registrationToken["registrationToken"] || !registrationToken["expires"] || !registrationToken["endpointId"]) {
            return Bluebird.reject(new Incident("protocol", "Missing parameters for the registrationToken"));
          }

          const expires = parseInt(registrationToken["expires"], 10);

          // TODO: return a something...
          return Bluebird.resolve(null);
        });
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
