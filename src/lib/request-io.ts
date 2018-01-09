import request from "request";
import * as io from "./interfaces/http-io";

/**
 * Converts implementation-independant IO options to the concrete
 * options used by the `request` library.
 *
 * @param ioOptions Implementation independent IO options
 * @returns {request.Options} Corresponding `request` options
 */
function asRequestOptions(ioOptions: io.GetOptions | io.PostOptions | io.PutOptions): request.Options {
  const result: request.Options = {...<any> ioOptions};
  if (ioOptions.queryString !== undefined) {
    delete (result as any).queryString;
    result.qs = ioOptions.queryString;
  }
  if (ioOptions.cookies !== undefined) {
    delete (result as any).cookies;
    result.jar = request.jar(ioOptions.cookies);
  }
  return result;
}

/**
 * Send a GET request
 *
 * @param options
 */
export async function get(options: io.GetOptions): Promise<io.Response> {
  return new Promise<io.Response>((resolve, reject) => {
    request.get(asRequestOptions(options), (error, response, body) => {
      if (error) {
        return reject(error);
      }
      if (response.statusCode === undefined) {
        return reject(new Error("Missing status code"));
      }

      const ioResponse: io.Response = {
        statusCode: response.statusCode,
        body,
        headers: response.headers,
      };

      resolve(ioResponse);
    });
  });
}

/**
 * Send a POST request
 *
 * @param options
 */
export async function post(options: io.PostOptions): Promise<io.Response> {
  return new Promise<io.Response>((resolve, reject) => {
    request.post(asRequestOptions(options), (error, response, body) => {
      if (error) {
        return reject(error);
      }
      if (response.statusCode === undefined) {
        return reject(new Error("Missing status code"));
      }

      const ioResponse: io.Response = {
        statusCode: response.statusCode,
        body,
        headers: response.headers,
      };

      resolve(ioResponse);
    });
  });
}

/**
 * Send a PUT request
 *
 * @param options
 */
export async function put(options: io.PutOptions): Promise<io.Response> {
  return new Promise<io.Response>((resolve, reject) => {
    request.put(asRequestOptions(options), (error, response, body) => {
      if (error) {
        return reject(error);
      }
      if (response.statusCode === undefined) {
        return reject(new Error("Missing status code"));
      }

      const ioResponse: io.Response = {
        statusCode: response.statusCode,
        body,
        headers: response.headers,
      };

      resolve(ioResponse);
    });
  });
}

export const requestIo: io.HttpIo = {
  get,
  post,
  put,
};
