import {CookieJar} from "request";
import {Dictionary} from "./utils";

export interface BaseOptions {
  uri: string;
  jar?: CookieJar;
  headers?: Dictionary<any>;
  queryString?: Dictionary<any>;
}

export interface GetOptions extends BaseOptions {

}

export interface PostOptions extends BaseOptions {
  form?: any;
  body?: any;
}

export type PutOptions = PostOptions;

export interface Response {
  statusCode: number;
  body: string;
  headers: Dictionary<any>;
}

export interface HttpIo {
  get (options: GetOptions): PromiseLike<Response>;
  post (options: PostOptions): PromiseLike<Response>;
  put (options: PutOptions): PromiseLike<Response>;
}
