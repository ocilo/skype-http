import * as Bluebird from "bluebird";
import * as request from "request";
import Incident from "incident";
import {Api} from "./api";
import {IO} from "./io";
import {RequestIO} from "./request-io";
import {login} from "./login";
import {Credentials} from "./interfaces/index";

export interface StateContainer {
  state: any;
}

export type ConnectOptions = {
  credentials?: Credentials;
  state?: any;
}

export function connect (options: ConnectOptions): Bluebird<Api> {
  if (options.state) {
    return Bluebird.reject(new Incident("todo", "Connection from previous state is not yet supported."));
  } else {
    let io: IO = new RequestIO();
    return login(io, options.credentials)
      .then((result) => {
        console.log(result);
        return null;
      });
  }
}
