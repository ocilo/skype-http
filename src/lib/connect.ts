 import {Incident} from "incident";
import { CookieJar } from "request";
import * as request from "request";
import { CookieJar as CookieJar2, MemoryCookieStore } from "tough-cookie";
import * as api from "./api";
import {Credentials} from "./interfaces/api/api";
import {Context} from "./interfaces/api/context";
import {login, loginResume} from "./login";
import requestIO from "./request-io";

export interface StateContainer {
  state: any;
}

export interface ConnectOptions {
  credentials?: Credentials;
  state?: StateObj;
  verbose?: boolean;
}

export interface StateObj {
  skypeToken: string;
  registrationToken: string;
  username: string;
  cookieJar: string;
}
/**
 * Authenticate the user and create a new API.
 *
 * @param options
 * @returns The Skype API for the provided user
 * @throws [[LoginError]]
 */
export async function connect(options: ConnectOptions): Promise<api.Api> {
  let apiContext: Context;
  if (options.state !== undefined) {
    const store: MemoryCookieStore = new MemoryCookieStore();
    CookieJar2.deserializeSync(options.state.cookieJar, store);
    request.defaults({ jar: request.jar(store) });
    apiContext = await loginResume({  //  registrationToken: JSON.parse(options.state.registrationToken)
      io: requestIO, cookieStore: store, cookieJar: request.jar(store),
      skypeToken: JSON.parse(options.state.skypeToken),
      registrationToken: null, verbose: options.verbose, username: options.state.username});
    console.log({
      username: apiContext.username,
      skypeToken: apiContext.skypeToken,
      registrationToken: apiContext.registrationToken,
    });
  } else if (options.credentials) {
    apiContext = await login({
      io: requestIO,
      credentials: options.credentials,
      verbose: options.verbose,
    });
    if (options.verbose) {
      console.log("Obtained context trough authentication:");
      console.log({
        username: apiContext.username,
        skypeToken: apiContext.skypeToken,
        registrationToken: apiContext.registrationToken,
      });
    }

  } else {
    return Promise.reject(new Incident("todo", "Connect must define `credentials`"));
  }
  return new api.Api(apiContext, requestIO);
}
