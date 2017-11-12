import { Incident } from "incident";
import { MemoryCookieStore, Store as CookieStore } from "tough-cookie";
import { parse as parseUri, Url } from "url";
import * as Consts from "./consts";
import { MissingHeaderError } from "./errors/http";
import { Credentials } from "./interfaces/api/api";
import { Context as ApiContext, RegistrationToken, SkypeToken } from "./interfaces/api/context";
import * as io from "./interfaces/http-io";
import * as messagesUri from "./messages-uri";
import * as microsoftAccount from "./providers/microsoft-account";
import * as utils from "./utils";
import { hmacSha256 } from "./utils/hmac-sha256";

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

/**
 * Value used for the `ClientInfo` header of the request for the registration token.
 */
const CLIENT_INFO_HEADER: string = utils.stringifyHeaderParams({
  os: "Windows",
  osVer: "10",
  proc: "Win64",
  lcid: "en-us",
  deviceType: "1",
  country: "n/a",
  clientName: Consts.SKYPEWEB_CLIENTINFO_NAME,
  clientVer: Consts.SKYPEWEB_CLIENTINFO_VERSION,
});

/**
 * Get the value for the `LockAndKey` header of the request for the registration token.
 *
 * @param time Seconds since UNIX epoch
 */
function getLockAndKeyHeader(time: number): string {
  const lockAndKeyResponse: string = getLockAndKeyResponse(time);
  return utils.stringifyHeaderParams({
    appId: Consts.SKYPEWEB_LOCKANDKEY_APPID,
    time: String(time),
    lockAndKeyResponse,
  });
}

/**
 * Get the registration token used to subscribe to resources.
 *
 * @param options Cookies and HTTP library to use.
 * @param skypeToken The Skype to use for authentication.
 * @param messagesHostname Hostname of the messages server.
 * @param retry Maximum number of tries before erroring.
 * @return Registration token
 */
async function getRegistrationToken(
  options: IoOptions,
  skypeToken: SkypeToken,
  messagesHostname: string,
  retry: number = 2,
): Promise<RegistrationToken> {
  const req: io.PostOptions = {
    uri: messagesUri.endpoints(messagesHostname),
    headers: {
      LockAndKey: getLockAndKeyHeader(utils.getCurrentTime()),
      // TODO(demurgos, 2017-11-12): Remove the `ClientHeader` header, SkPy does not send it.
      ClientInfo: CLIENT_INFO_HEADER,
      Authentication: utils.stringifyHeaderParams({skypetoken: skypeToken.value}),
      // See: https://github.com/OllieTerrance/SkPy/issues/54#issuecomment-295746871
      BehaviorOverride: "redirectAs404",
    },
    cookies: options.cookies,
    // See: https://github.com/OllieTerrance/SkPy/blob/7b6be6e41238058b9ab644d908621456764fb6d6/skpy/conn.py#L717
    body: JSON.stringify({endpointFeatures: "Agent"}),
  };

  const res: io.Response = await options.io.post(req);

  // const expectedStatusCode: Set<number> = new Set([201, 301]);
  // if (!expectedStatusCode.has(res.statusCode)) {
  //   const cause: UnexpectedHttpStatusError = UnexpectedHttpStatusError.create(res, expectedStatusCode, req);
  //   throw new Incident(cause, "endpointRegistrationFailed", "Unable to register endpoint");
  // }

  const locationHeader: string | undefined = res.headers["location"];
  if (locationHeader === undefined) {
    const cause: MissingHeaderError = MissingHeaderError.create(res, "Location", req);
    throw new Incident(cause, "EndpointRegistrationFailed", "Unable to register endpoint");
  }

  // TODO: parse in messages-uri.ts
  const location: Url = parseUri(locationHeader);
  if (location.host === undefined) {
    throw new Incident("ParseError", "Expected location to define host");
  }
  // Handle redirections, up to `retry` times
  if (location.host !== messagesHostname) { // mainly when 301, but sometimes when 201
    if (retry > 0) {
      return getRegistrationToken(options, skypeToken, location.host, retry - 1);
    } else {
      type Cause = Incident<{req: io.PostOptions; res: io.Response}>;
      const cause: Cause = Incident("EndpointRedirectionsLimit", {req, res});
      throw new Incident(cause, "EndpointRegistrationFailed", "Unable to register endpoint");
    }
  }

  // registrationTokenHeader is like "registrationToken=someString; expires=someNumber; endpointId={someString}"
  const registrationTokenHeader: string | undefined = res.headers["set-registrationtoken"];

  if (registrationTokenHeader === undefined) {
    const cause: MissingHeaderError = MissingHeaderError.create(res, "Set-Registrationtoken", req);
    throw new Incident(cause, "EndpointRegistrationFailed", "Unable to register endpoint");
  }

  return readSetRegistrationTokenHeader(messagesHostname, registrationTokenHeader);
}

/**
 * Parse the `Set-Registrationtoken` header of an endpoint registration response.
 *
 * This header has the following shape: "registrationToken=someString; expires=someNumber; endpointId={someString}"
 *
 * @param hostname Name of the hostname for this registration token.
 * @param header String value of the `Set-Registration` header.
 * @return Parsed registration token
 */
function readSetRegistrationTokenHeader(hostname: string, header: string): RegistrationToken {
  const parsedHeader: Map<string, string> = utils.parseHeaderParams(header);
  const expiresString: string | undefined = parsedHeader.get("expires");
  const registrationTokenValue: string | undefined = parsedHeader.get("registrationToken");
  const endpointId: string | undefined = parsedHeader.get("endpointId");

  if (registrationTokenValue === undefined || expiresString === undefined || endpointId === undefined) {
    throw new Incident("InvalidSetRegistrationTokenHeader", {header, parsed: parsedHeader});
  }

  // Timestamp in seconds since UNIX epoch
  const expires: number = parseInt(expiresString, 10);

  return {
    value: registrationTokenValue,
    expirationDate: new Date(1000 * expires),
    endpointId,
    raw: header,
    host: hostname,
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
  // this is the exact json that is needed to register endpoint for setting of status.
  // demurgos: If I remember well enough, it's order dependant.
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
      version: `${Consts.SKYPEWEB_CLIENTINFO_VERSION}//${Consts.SKYPEWEB_CLIENTINFO_NAME}`,
    },
  };

  const uri: string = messagesUri.endpointMessagingService(
    registrationToken.host,
    messagesUri.DEFAULT_USER,
    registrationToken.endpointId,
  );

  const requestOptions: io.PutOptions = {
    uri,
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
