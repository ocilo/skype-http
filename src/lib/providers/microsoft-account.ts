import cheerio = require("cheerio");
import * as path from "path";
import {CookieJar} from "request";
import {Cookie} from "tough-cookie";
import * as url from "url";
import {SkypeToken} from "../interfaces/api/context";
import * as io from "../interfaces/io";
import {Dictionary} from "../interfaces/utils";

export const skypeWebUri: string = "https://web.skype.com/";
export const skypeLoginUri: string = "https://login.skype.com/login/";
export const liveLoginUri: string = "https://login.live.com/";
export const webClientLiveLoginId: string = "578134";

/**
 * Checks if the user `username` exists
 */
// export async function userExists(username: string, httpIo: io.HttpIo = requestIo): Promise<boolean> {
//   const microsoftAccounts = "fjosi";
//   const uri = `${microsoftAccounts}/GetCredentialType.srf`;
//
//   const res: io.Response = await httpIo.post({
//     uri: uri,
//     form: {
//       username: username
//     }
//   });
//
//   const data = JSON.parse(res.body);
//   return data["IfExistsResult"];
// }

export interface Credentials {
  // Skype username or email address
  login: string;
  password: string;
}

export interface GetSkypeTokenOptions {
  credentials: Credentials;
  httpIo: io.HttpIo;
  cookieJar: CookieJar;
}

export async function getSkypeToken(options: GetSkypeTokenOptions): Promise<SkypeToken> {
  const startTime: number = Date.now();

  const liveKeys: LiveKeys = await getLiveKeys(options);
  const sendCredOpts: SendCredentialsOptions = {
    username: options.credentials.login,
    password: options.credentials.password,
    httpIo: options.httpIo,
    jar: options.cookieJar,
    liveKeys
  };

  const liveToken: string = await getLiveToken(sendCredOpts);

  const stOpt: GetSkypeTokenFromLiveTokenOptions = {
    liveToken,
    jar: options.cookieJar,
    httpIo: options.httpIo
  };

  const res: io.Response = await requestSkypeToken(stOpt);

  const scrapped: SkypeTokenResponse = scrapSkypeTokenResponse(res.body);
  // Expires in (seconds) (default: 1 day)
  const expiresIn: number = typeof scrapped.expires_in === "number" ? scrapped.expires_in : 864000;

  const result: SkypeToken = {
    value: scrapped.skypetoken,
    expirationDate: new Date(startTime + expiresIn * 1000)
  };

  if (typeof result.value !== "string") {
    throw new Error("Expected value of Skype token to be a string");
  }

  return result;
}

export interface LoadLiveKeysOptions {
  httpIo: io.HttpIo;
  cookieJar: CookieJar;
}

export interface LiveKeys {
  /**
   * MicroSoft P Requ ?
   *
   * Examples:
   * - `"$uuid-46f6d2b2-ff98-4446-aafb-2ba99c0c0638"`
   */
  MSPRequ: string;

  /**
   * MicroSoft P OK ?
   *
   * Examples:
   * - `"lt=1483826635&co=1&id=293290"`
   */
  MSPOK: string;

  /**
   * PPF Token ?
   *
   * Examples: (see spec)
   */
  PPFT: string;
}

export async function getLiveKeys(options: LoadLiveKeysOptions): Promise<LiveKeys> {
  const response: io.Response = await requestLiveKeys(options);

  let mspRequ: string | undefined;
  let mspOk: string | undefined;

  // Retrieve values for the cookies "MSPRequ" and "MSPOK"
  const cookies: Cookie[] = options.cookieJar.getCookies("https://login.live.com/");
  for (const cookie of cookies) {
    switch (cookie.key) {
      case "MSPRequ":
        mspRequ = cookie.value;
        break;
      case "MSPOK":
        mspOk = cookie.value;
        break;
    }
  }

  if (mspOk === undefined || mspRequ === undefined) {
    throw new Error("Unable to find cookie MSPRequ or MSPOK");
  }

  const ppftKey: string = scrapLivePpftKey(response.body);
  return {
    MSPRequ: mspRequ,
    MSPOK: mspOk,
    PPFT: ppftKey
  };
}

export async function requestLiveKeys(options: LoadLiveKeysOptions): Promise<io.Response> {
  const uri: string = url.resolve(skypeLoginUri, path.posix.join("oauth", "microsoft"));
  const queryString: Dictionary<string> = {
    client_id: webClientLiveLoginId,
    redirect_uri: skypeWebUri
  };
  const getOptions: io.GetOptions = {uri, queryString, jar: options.cookieJar};
  // Also, now the Jar should contain:
  // MSPRequ
  // MSPOK
  return options.httpIo.get(getOptions);
}

// TODO: parse HTML, JS and traverse AST
export function scrapLivePpftKey(html: string): string {
  // tslint:disable-next-line:max-line-length
  const ppftRegExp: RegExp = /<input\s+type="hidden"\s+name="PPFT"\s+id="i0327"\s+value="([\!*0-9a-zA-Z]+\${1,2})"\s*\/>/;
  const regExpResult: RegExpExecArray | null = ppftRegExp.exec(html);

  if (regExpResult === null) {
    throw new Error("Unable to scrap PPFT key");
  }

  if (regExpResult.length !== 2) {
    throw new Error("Expected regExpResult length to be exactly 2");
  }

  return regExpResult[1];
}

export interface SendCredentialsOptions {
  username: string;
  password: string;
  liveKeys: LiveKeys;
  httpIo: io.HttpIo;
  jar: CookieJar;
}

export async function getLiveToken(options: SendCredentialsOptions): Promise<string> {
  const response: io.Response = await requestLiveToken(options);
  return scrapLiveToken(response.body);
}

// Get live token from live keys and credentials
export async function requestLiveToken (options: SendCredentialsOptions): Promise<io.Response> {
  const uri: string = url.resolve(liveLoginUri, path.posix.join("ppsecure", "post.srf"));
  const queryString: Dictionary<string> = {
    wa: "wsignin1.0",
    wp: "MBI_SSL",
    // tslint:disable-next-line:max-line-length
    wreply: "https://lw.skype.com/login/oauth/proxy?client_id=578134&site_name=lw.skype.com&redirect_uri=https%3A%2F%2Fweb.skype.com%2F"
  };
  const jar: CookieJar = options.jar;
  // MSPRequ should already be set
  // MSPOK should already be set
  const millisecondsSinceEpoch: number = Date.now(); // Milliseconds since epoch
  const ckTstCookie: Cookie = new (<any> Cookie)({
    key: "CkTst",
    value: millisecondsSinceEpoch.toString(10)
  });
  jar.setCookie(ckTstCookie, "https://login.live.com/");

  const formData: Dictionary<string> = {
    login: options.username,
    passwd: options.password,
    PPFT: options.liveKeys.PPFT
  };

  const postOptions: io.PostOptions = {
    uri,
    queryString,
    jar,
    form: formData
  };

  return options.httpIo.post(postOptions);
}

/**
 * Scrap the result of a sendCredentials requests to retrieve the value of the `t` paramater
 * @param html
 * @returns {string}
 */
export function scrapLiveToken(html: string): string {
  const $: cheerio.Static = cheerio.load(html);
  const tokenNode: cheerio.Cheerio = $("#t");
  const tokenValue: string = tokenNode.val();
  if (tokenValue === "") {
    throw new Error("Unable to scrap token");
  }
  return tokenValue;
}

export interface GetSkypeTokenFromLiveTokenOptions {
  liveToken: string;
  httpIo: io.HttpIo;
  jar: CookieJar;
}

// Get Skype token from Live token
export async function requestSkypeToken (options: GetSkypeTokenFromLiveTokenOptions): Promise<io.Response> {
  const uri: string = url.resolve(skypeLoginUri, "microsoft");

  const queryString: Dictionary<string> = {
    client_id: "578134",
    redirect_uri: "https://web.skype.com"
  };

  const formData: Dictionary<string> = {
    t: options.liveToken,
    client_id: "578134",
    oauthPartner: "999",
    site_name: "lw.skype.com",
    redirect_uri: "https://web.skype.com"
  };

  const postOptions: io.PostOptions = {
    uri,
    queryString,
    form: formData
  };

  return options.httpIo.post(postOptions);
}

export interface SkypeTokenResponse {
  skypetoken: string;
  expires_in: number;
}

/**
 * Scrap to get the Skype token
 *
 * @param html
 * @returns {string}
 */
export function scrapSkypeTokenResponse(html: string): SkypeTokenResponse {
  const $: cheerio.Static = cheerio.load(html);
  const skypeTokenNode: cheerio.Cheerio = $("input[name=skypetoken]");
  // In seconds
  const expiresInNode: cheerio.Cheerio = $("input[name=expires_in]");

  const skypeToken: string = skypeTokenNode.val();
  const expiresIn: number = parseInt(expiresInNode.val(), 10);

  // if (!skypetoken || !expires_in) {
  //   const skypeErrorMessage = $(".message_error").text();
  //   const errorName = "authentication-failed";
  //   const errorMessage = "Failed to get skypetoken. Username or password is incorrect OR you've hit a CAPTCHA wall.";
  //   if (skypeErrorMessage) {
  //     const skypeError = new Incident("skype-error", skypeErrorMessage);
  //     throw new Incident(skypeError, errorName, errorMessage);
  //   } else {
  //     throw new Incident(errorName, errorMessage);
  //   }
  // }
  // return result;

  return {
    skypetoken: skypeToken,
    expires_in: expiresIn
  };
}
