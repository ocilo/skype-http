import {Thenable} from "bluebird";

export interface IO {
  get (uri: string, options: any): Thenable<any>;
  post (uri: string, options: any): Thenable<any>;
}
