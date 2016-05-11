import {Thenable} from "bluebird";
import {IO} from "./io";

export class RequestIO implements IO {
  get (options: any): Thenable<any> {
    return null;
  }

  post (options: any): Thenable<any> {
    return null;
  }
}
