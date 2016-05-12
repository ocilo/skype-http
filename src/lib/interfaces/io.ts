import {Thenable} from "bluebird";
import * as request from "request";

export interface BaseOptions {
  uri: string;
  jar: request.CookieJar;
}

export interface GetOptions extends BaseOptions {

}

export interface PostOptions extends BaseOptions {
  form: any;
}

export interface Response {
  statusCode: number;
  body: string;
}

export interface IO {
  get (options: GetOptions): Thenable<Response>;
  post (options: PostOptions): Thenable<Response>;
}
