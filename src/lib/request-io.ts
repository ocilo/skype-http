import * as request from "request";
import * as Bluebird from "bluebird";
import * as io from "./io";

export class RequestIO implements io.IO {
  get (options: io.GetOptions): Bluebird<io.Response> {
    return Bluebird.fromCallback((cb) => {
      request.get(options, (error, response, body) => {
        if (error) {
          return cb(error);
        }

        let ioResponse: io.Response = {
          statusCode: response.statusCode,
          body: body
        };

        cb(null, ioResponse);
      });
    });
  }

  post (options: io.PostOptions): Bluebird<io.Response> {
    return Bluebird.fromCallback((cb) => {
      request.post(options, (error, response, body) => {
        if (error) {
          return cb(error);
        }

        let ioResponse: io.Response = {
          statusCode: response.statusCode,
          body: body
        };

        cb(null, ioResponse);
      });
    });
  }
}
