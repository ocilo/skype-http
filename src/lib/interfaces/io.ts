import {Thenable} from "bluebird";
import * as request from "request";
import {Dictionary} from "./index";

export interface BaseOptions {
  uri: string;
  jar: request.CookieJar;
  headers?: Dictionary<any>;
}

export interface GetOptions extends BaseOptions {

}

export interface PostOptions extends BaseOptions {
  form?: any;
  body?: any;
}

export interface Response {
  statusCode: number;
  body: string;
  headers: Dictionary<any>;
}

export interface IO {
  get (options: GetOptions): Thenable<Response>;
  post (options: PostOptions): Thenable<Response>;
}
