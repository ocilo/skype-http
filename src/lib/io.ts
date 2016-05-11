import {Thenable} from "bluebird";
import * as request from "request";

interface Options {
  uri: string;
  jar: request.CookieJar;
}

export interface GetOptions extends Options {

}

export interface PostOptions extends Options {
  form: any;
}

export interface Response {
  statusCode: number;
  body: string;
}

export interface IO {
  get (options: Options): Thenable<Response>;
  post (options: Options): Thenable<Response>;
}
