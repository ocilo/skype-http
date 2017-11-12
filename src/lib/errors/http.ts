import { Incident } from "incident";
import * as httpIo from "../interfaces/http-io";

export namespace UnexpectedHttpStatusError {
  export type Name = "UnexpectedHttpStatus";
  export const name: Name = "UnexpectedHttpStatus";

  export interface Data {
    response: httpIo.Response;
    expected: Set<number>;
    request?: httpIo.GetOptions | httpIo.PostOptions | httpIo.PutOptions;
  }

  export type Cause = undefined;
}

export type UnexpectedHttpStatusError = Incident<UnexpectedHttpStatusError.Data,
  UnexpectedHttpStatusError.Name,
  UnexpectedHttpStatusError.Cause>;

export namespace UnexpectedHttpStatusError {
  export type Type = UnexpectedHttpStatusError;

  export function format({expected, response, request}: Data) {
    const msg: string = `Received response with the HTTP status code \`${response.statusCode}\``
      + ` but expected one of ${JSON.stringify([...expected])}.`;
    if (request === undefined) {
      return `${msg} Response: ${response}`;
    } else {
      return `${msg} Request: ${JSON.stringify(request)}, Response: ${response}`;
    }
  }

  export function create(
    response: httpIo.Response,
    expected: Set<number>,
    request?: httpIo.GetOptions | httpIo.PostOptions | httpIo.PutOptions,
  ): UnexpectedHttpStatusError {
    return new Incident(name, {response, expected, request}, format);
  }
}

export namespace RequestError {
  export type Name = "Request";
  export const name: Name = "Request";

  export interface Data {
    request: httpIo.GetOptions | httpIo.PostOptions | httpIo.PutOptions;
  }

  export type Cause = Error;
}

export type RequestError = Incident<RequestError.Data, RequestError.Name, RequestError.Cause>;

export namespace RequestError {
  export type Type = RequestError;

  export function format({request}: Data) {
    return `The following HTTP request failed: "${JSON.stringify(request)}"`;
  }

  export function create(
    cause: Error,
    request: httpIo.GetOptions | httpIo.PostOptions | httpIo.PutOptions,
  ): RequestError {
    return new Incident(cause, name, {request}, format);
  }
}
