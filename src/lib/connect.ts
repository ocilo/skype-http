import * as Bluebird from "bluebird";
import {Incident} from "incident";

import * as api from "./api";
import {IO} from "./interfaces/io";
import {Context} from "./interfaces/api/context";
import {RequestIO} from "./request-io";
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
  if (options.state) {
    return Bluebird.reject(new Incident("todo", "Connection from previous state is not yet supported."));
  } else {
    let io: IO = new RequestIO();
    return login({io: io, credentials: options.credentials, verbose: options.verbose})
      .then((apiContext: Context) => {
        if (options.verbose) {
          console.log("Obtained context trough authentication:");
          console.log(apiContext);
        }
        return new api.Api(apiContext, io);
      });
  }
}
