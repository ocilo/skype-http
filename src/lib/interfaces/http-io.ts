import { Store as CookieStore } from "tough-cookie";

export interface BaseOptions {
  uri: string;
  cookies?: CookieStore;
  headers?: any; // {[name: string]: string};
  queryString?: any; // {[key: string]: string};
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
  headers: any; // {[name: string]: string};
}

export interface HttpIo {
  get(options: GetOptions): Promise<Response>;

  post(options: PostOptions): Promise<Response>;

  put(options: PutOptions): Promise<Response>;
}
