import { Incident } from "incident";
import toughCookie from "tough-cookie";
import url from "url";
import * as Consts from "../consts";
import { EndpointRegistrationError } from "../errors/endpoint-registration";
import { MissingHeaderError, UnexpectedHttpStatusError } from "../errors/http";
import { LoginRateLimitExceeded, RedirectionLimit } from "../errors/index";
import { RegistrationToken, SkypeToken } from "../interfaces/api/context";
import * as io from "../interfaces/http-io";
import * as messagesUri from "../messages-uri";
import * as utils from "../utils";
import { hmacSha256 } from "../utils/hmac-sha256";

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
 * @param io Cookies and HTTP library to use.
 * @param cookies Cookie jar to use.
 * @param skypeToken The Skype to use for authentication.
 * @param messagesHostname Hostname of the messages server.
 * @param retries Number of request retries before emitting an error. Example: if `retries` is `1`, this function
 *                will send 1 or 2 requests.
 * @return Registration token
 * @throws [[EndpointRegistrationError]]
 */
export async function registerEndpoint(
  io: io.HttpIo,
  cookies: toughCookie.Store,
  skypeToken: SkypeToken,
  messagesHostname: string,
  retries: number = 2,
): Promise<RegistrationToken> {
  // TODO: Use this array to report all the requests and responses in case of failure
  const tries: {req: io.PostOptions; res: io.Response}[] = [];

  // Use non-strict equality to try at least once. `tryCount` counts the number of failures.
  for (let tryCount: number = 0; tryCount <= retries; tryCount++) {
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
      cookies,
      // See: https://github.com/OllieTerrance/SkPy/blob/7b6be6e41238058b9ab644d908621456764fb6d6/skpy/conn.py#L717
      body: JSON.stringify({endpointFeatures: "Agent"}),
    };

    const res: io.Response = await io.post(req);
    tries.push({req, res});

    if (res.statusCode === 429) {
      // Expected res.body: `'{"errorCode":803,"message":"Login Rate limit exceeded"}'`
      throw new EndpointRegistrationError(LoginRateLimitExceeded.create(req, res), tries);
    }

    // TODO: Check eventual changes in the API. I'm not sure if 301 is still used
    // 404 was seen the 2017-01-14, with the following body:
    // '{"errorCode":752,"message":"User is in a different cloud. See \'Location\' header for users current cloud."}'
    const expectedStatusCode: Set<number> = new Set([201, 301, 404]);
    if (!expectedStatusCode.has(res.statusCode)) {
      throw new EndpointRegistrationError(UnexpectedHttpStatusError.create(res, expectedStatusCode, req), tries);
    }

    const locationHeader: string | undefined = res.headers["location"];
    if (locationHeader === undefined) {
      throw new EndpointRegistrationError(MissingHeaderError.create(res, "Location", req), tries);
    }

    // TODO: parse in messages-uri.ts
    const location: url.Url = url.parse(locationHeader);
    if (location.host === undefined) {
      throw new Incident("ParseError", {res}, "Expected `Location` header to have host");
    }
    // Handle redirections, up to `retry` times
    // Redirections happen mostly when 301, but sometimes when 201
    // TODO: It may have changed to mostly 404.
    if (location.host !== messagesHostname) {
      messagesHostname = location.host;
      continue;
    }

    // registrationTokenHeader is like "registrationToken=someString; expires=someNumber; endpointId={someString}"
    const registrationTokenHeader: string | undefined = res.headers["set-registrationtoken"];

    if (registrationTokenHeader === undefined) {
      throw new EndpointRegistrationError(MissingHeaderError.create(res, "Set-Registrationtoken", req), tries);
    }

    return readSetRegistrationTokenHeader(messagesHostname, registrationTokenHeader);
  }

  throw new EndpointRegistrationError(RedirectionLimit.create(retries), tries);
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
