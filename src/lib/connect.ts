import * as Bluebird from "bluebird";
import {Incident} from "incident";

import * as api from "./api";
import {Context} from "./interfaces/api/context";
import requestIO from "./request-io";
import {login} from "./login";
import {Credentials} from "./interfaces/api/api";

export interface StateContainer {
  state: any;
}

export interface ConnectOptions {
  credentials?: Credentials;
  state?: any;
  verbose?: boolean;
}

export function connect (options: ConnectOptions): Bluebird<api.Api> {
  if (options.state !== undefined) {
    return Bluebird.reject(new Incident("todo", "Connection from previous state is not yet supported."));
  } else if (options.credentials === undefined) {
    return Bluebird.reject(new Incident("todo", "Connect must define `credentials`"));
  } else {
    const apiPromise: Promise<api.Api> = login({io: requestIO, credentials: options.credentials, verbose: options.verbose})
      .then((apiContext: Context) => {
        if (options.verbose) {
          console.log("Obtained context trough authentication:");
          console.log({username: apiContext.username,
            skypeToken: apiContext.skypeToken,
            registrationToken: apiContext.registrationToken
          });
        }
        return new api.Api(apiContext, requestIO);
      });
    return Bluebird.resolve(apiPromise);
  }
}
