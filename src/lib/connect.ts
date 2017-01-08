import * as Bluebird from "bluebird";
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

export function connect(options: ConnectOptions): Bluebird<api.Api> {
  if (options.state !== undefined) {
    return Bluebird.reject(new Incident("todo", "Connection from previous state is not yet supported."));
  } else if (options.credentials === undefined) {
    return Bluebird.reject(new Incident("todo", "Connect must define `credentials`"));
  } else {
    const apiPromise: Promise<Context> = login({
      io: requestIO,
      credentials: options.credentials,
      verbose: options.verbose
    });
    return Bluebird.resolve(apiPromise)
      .then((apiContext: Context) => {
        if (options.verbose) {
          console.log("Obtained context trough authentication:");
          console.log({
            username: apiContext.username,
            skypeToken: apiContext.skypeToken,
            registrationToken: apiContext.registrationToken
          });
        }
        return new api.Api(apiContext, requestIO);
      });
  }
}
