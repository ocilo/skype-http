import Bluebird = require("bluebird");
import request = require("request");
import * as io from "./interfaces/io";

/**
 * Converts implementation-independant IO options to the concrete
 * options used by the `request` library.
 *
 * @param ioOptions Implementation independent IO options
 * @returns {request.Options} Corresponding `request` options
 */
function asRequestOptions (ioOptions: io.GetOptions | io.PostOptions | io.PutOptions): request.Options {
  const result: request.Options = Object.assign({}, ioOptions);
  if (ioOptions.queryString) {
    result.qs = ioOptions.queryString;
  }
  return result;
}

/**
 * Send a GET request
 *
 * @param options
 * @returns {Bluebird<any>}
 */
export function get (options: io.GetOptions): Bluebird<io.Response> {
  return Bluebird.fromCallback((cb) => {
    request.get(asRequestOptions(options), (error, response, body) => {
      if (error) {
        return cb(error);
      }
      if (response.statusCode === undefined) {
        return cb(new Error("Missing status code"));
      }

      const ioResponse: io.Response = {
        statusCode: response.statusCode,
        body: body,
        headers: response.headers
      };

      cb(null, ioResponse);
    });
  });
}

/**
 * Send a POST request
 *
 * @param options
 * @returns {Bluebird<any>}
 */
export function post (options: io.PostOptions): Bluebird<io.Response> {
  return Bluebird.fromCallback((cb) => {
    request.post(asRequestOptions(options), (error, response, body) => {
      if (error) {
        return cb(error);
      }
      if (response.statusCode === undefined) {
        return cb(new Error("Missing status code"));
      }

      const ioResponse: io.Response = {
        statusCode: response.statusCode,
        body: body,
        headers: response.headers
      };

      cb(null, ioResponse);
    });
  });
}

/**
 * Send a PUT request
 *
 * @param options
 * @returns {Bluebird<any>}
 */
export function put (options: io.PutOptions): Bluebird<io.Response> {
  return Bluebird.fromCallback((cb) => {
    request.put(asRequestOptions(options), (error, response, body) => {
      if (error) {
        return cb(error);
      }
      if (response.statusCode === undefined) {
        return cb(new Error("Missing status code"));
      }

      const ioResponse: io.Response = {
        statusCode: response.statusCode,
        body: body,
        headers: response.headers
      };

      cb(null, ioResponse);
    });
  });
}

export const requestIo: io.HttpIo = {
  get: get,
  post: post,
  put: put
};

export default requestIo;
