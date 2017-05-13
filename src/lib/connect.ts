import {Incident} from "incident";
import * as api from "./api";
import {Credentials} from "./interfaces/api/api";
import {Context} from "./interfaces/api/context";
import {login} from "./login";
import requestIO from "./request-io";

export interface StateContainer {
  state: any;
}

export interface ConnectOptions {
  credentials?: Credentials;
  state?: Context.Json;
  verbose?: boolean;
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
    apiContext = Context.fromJson(options.state);
  } else if (options.credentials !== undefined) {
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
