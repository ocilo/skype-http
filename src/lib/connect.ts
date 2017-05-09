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
  state?: any;
  verbose?: boolean;
}

export async function connect(options: ConnectOptions): Promise<api.Api> {
  if (options.state !== undefined) {
    return Promise.reject(new Incident("todo", "Connection from previous state is not yet supported."));
  } else if (options.credentials === undefined) {
    return Promise.reject(new Incident("todo", "Connect must define `credentials`"));
  }
  const apiContext: Context = await login({
    io: requestIO,
    credentials: options.credentials,
    verbose: options.verbose
  });
  if (options.verbose) {
    console.log("Obtained context trough authentication:");
    console.log({
      username: apiContext.username,
      skypeToken: apiContext.skypeToken,
      registrationToken: apiContext.registrationToken
    });
  }
  return new api.Api(apiContext, requestIO);
}
