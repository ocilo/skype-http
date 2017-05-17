 import {Incident} from "incident";
import {MemoryCookieStore, Store as CookieStore} from "tough-cookie";
import {parse as parseUri, Url} from "url";
import * as Consts from "./consts";
import {Credentials} from "./interfaces/api/api";
import {Context as ApiContext, RegistrationToken, SkypeToken} from "./interfaces/api/context";
import * as io from "./interfaces/http-io";
import {Dictionary} from "./interfaces/utils";
import * as messagesUri from "./messages-uri";
import * as microsoftAccount from "./providers/microsoft-account";
import * as utils from "./utils";
import {hmacSha256} from "./utils/hmac-sha256";

interface IoOptions {
  io: io.HttpIo;
  cookies: CookieStore;
}

export interface LoginOptions {
  io: io.HttpIo;
  credentials: Credentials;
  verbose?: boolean;
}

/**
 * Builds an Api context trough a new authentication.
 * This involves the requests:
 * GET <loginUrl> to scrap the LoginKeys (pie & etm)
 * POST <loginUrl> to get the SkypeToken from the credentials and LoginKeys
 * POST <registrationUrl> to get RegistrationToken from the SkypeToken
 *   Eventually, follow a redirection to use the assigned host
 * POST <subscription> to gain access to resources with the RegistrationToken
 *
 * @param options
 * @returns A new API context with the tokens for the provided user
 */
export async function login(options: LoginOptions): Promise<ApiContext> {
  const cookies: MemoryCookieStore = new MemoryCookieStore();
  const ioOptions: IoOptions = {io: options.io, cookies};

  const skypeToken: SkypeToken = await microsoftAccount.login({
    credentials: {
      login: options.credentials.username,
      password: options.credentials.password,
    },
    httpIo: options.io,
    cookies,
  });
  if (options.verbose) {
    console.log("Acquired SkypeToken");
  }

  const registrationToken: RegistrationToken = await getRegistrationToken(
    ioOptions,
    skypeToken,
    Consts.SKYPEWEB_DEFAULT_MESSAGES_HOST,
  );
  if (options.verbose) {
    console.log("Acquired RegistrationToken");
  }

  await subscribeToResources(ioOptions, registrationToken);
  if (options.verbose) {
    console.log("Subscribed to resources");
  }

  await createPresenceDocs(ioOptions, registrationToken);
  if (options.verbose) {
    console.log("Created presence docs");
  }

  return {
    username: options.credentials.username,
    skypeToken,
    cookies,
    registrationToken,
  };
}

function getLockAndKeyResponse(time: number): string {
  const inputBuffer: Buffer = Buffer.from(String(time), "utf8");
  const appIdBuffer: Buffer = Buffer.from(Consts.SKYPEWEB_LOCKANDKEY_APPID, "utf8");
  const secretBuffer: Buffer = Buffer.from(Consts.SKYPEWEB_LOCKANDKEY_SECRET, "utf8");
  return hmacSha256(inputBuffer, appIdBuffer, secretBuffer);
}

// Get the token used to subscribe to resources
async function getRegistrationToken(
  options: IoOptions,
  skypeToken: SkypeToken,
  messagesHost: string,
  retry: number = 2,
): Promise<RegistrationToken> {
  const startTime: number = utils.getCurrentTime();
  const lockAndKeyResponse: string = getLockAndKeyResponse(startTime);
  const headers: Dictionary<string> = {
    LockAndKey: utils.stringifyHeaderParams({
      appId: Consts.SKYPEWEB_LOCKANDKEY_APPID,
      time: String(startTime),
      lockAndKeyResponse: lockAndKeyResponse,
    }),
    ClientInfo: utils.stringifyHeaderParams({
      os: "Windows",
      osVer: "10",
      proc: "Win64",
      lcid: "en-us",
      deviceType: "1",
      country: "n/a",
      clientName: Consts.SKYPEWEB_CLIENTINFO_NAME,
      clientVer: Consts.SKYPEWEB_CLIENTINFO_VERSION,
    }),
    Authentication: utils.stringifyHeaderParams({
      skypetoken: skypeToken.value,
    }),
  };

  const requestOptions: io.PostOptions = {
    uri: messagesUri.endpoints(messagesHost),
    headers: headers,
    cookies: options.cookies,
    body: "{}", // Skype requires you to send an empty object as a body
  };

  const res: io.Response = await options.io.post(requestOptions);
  if (res.statusCode !== 201 && res.statusCode !== 301) {
    return Promise.reject(new Incident("net", "Unable to register an endpoint"));
  }
  // TODO: handle statusCode 201 & 301

  const locationHeader: string = res.headers["location"];

  const location: Url = parseUri(locationHeader); // TODO: parse in messages-uri.ts
  if (location.host === undefined) {
    throw new Incident("parse-error", "Expected location to define host");
  }
  if (location.host !== messagesHost) { // mainly when 301, but sometimes when 201
    messagesHost = location.host;
    if (retry > 0) {
      return getRegistrationToken(options, skypeToken, messagesHost, retry--);
    } else {
      return Promise.reject(new Incident("net", "Exceeded max tries"));
    }
  }

  // registrationTokenHeader is like "registrationToken=someString; expires=someNumber; endpointId={someString}"
  const registrationTokenHeader: string = res.headers["set-registrationtoken"];
  const parsedHeader: Dictionary<string> = utils.parseHeaderParams(registrationTokenHeader);

  if (!parsedHeader["registrationToken"] || !parsedHeader["expires"] || !parsedHeader["endpointId"]) {
    return Promise.reject(new Incident("protocol", "Missing parameters for the registrationToken"));
  }

  const expires: number = parseInt(parsedHeader["expires"], 10); // in seconds

  return <RegistrationToken> {
    value: parsedHeader["registrationToken"],
    expirationDate: new Date(1000 * expires),
    endpointId: parsedHeader["endpointId"],
    raw: registrationTokenHeader,
    host: messagesHost,
  };
}

async function subscribeToResources(ioOptions: IoOptions, registrationToken: RegistrationToken): Promise<void> {
  // TODO(demurgos): typedef
  // tslint:disable-next-line:typedef
  const requestDocument = {
    interestedResources: [
      "/v1/threads/ALL",
      "/v1/users/ME/contacts/ALL",
      "/v1/users/ME/conversations/ALL/messages",
      "/v1/users/ME/conversations/ALL/properties",
    ],
    template: "raw",
    channelType: "httpLongPoll", // TODO: use websockets ?
  };

  const requestOptions: io.PostOptions = {
    uri: messagesUri.subscriptions(registrationToken.host),
    cookies: ioOptions.cookies,
    body: JSON.stringify(requestDocument),
    headers: {
      RegistrationToken: registrationToken.raw,
    },
  };

  const res: io.Response = await ioOptions.io.post(requestOptions);
  if (res.statusCode !== 201) {
    return Promise.reject(new Incident("net",
      `Unable to subscribe to resources: statusCode: ${res.statusCode} body: ${res.body}`));
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

}

async function createPresenceDocs(ioOptions: IoOptions, registrationToken: RegistrationToken): Promise<any> {

  if (!registrationToken.endpointId) {
    return Promise.reject(new Incident("Missing endpoint id in registration token"));
  }

  // this is the exact json that is needed to register endpoint for setting of status.
  // TODO: typedef
  // tslint:disable-next-line:typedef
  const requestBody = {
    id: "endpointMessagingService",
    type: "EndpointPresenceDoc",
    selfLink: "uri",
    privateInfo: {
      epname: "skype", // Name of the endpoint (normally the name of the host)
    },
    publicInfo: {
      capabilities: "video|audio",
      type: 1,
      skypeNameVersion: Consts.SKYPEWEB_CLIENTINFO_NAME,
      nodeInfo: "xx",
      version: Consts.SKYPEWEB_CLIENTINFO_VERSION + "//" + Consts.SKYPEWEB_CLIENTINFO_NAME,
    },
  };

  const uri: string = messagesUri.endpointMessagingService(
    registrationToken.host,
    messagesUri.DEFAULT_USER,
    registrationToken.endpointId,
  );

  const requestOptions: io.PutOptions = {
    uri: uri,
    cookies: ioOptions.cookies,
    body: JSON.stringify(requestBody),
    headers: {
      RegistrationToken: registrationToken.raw,
    },
  };

  const res: io.Response = await ioOptions.io.put(requestOptions);

  if (res.statusCode !== 200) {
    return Promise.reject(new Incident("net", "Unable to create presence endpoint"));
  }
}

export default login;
