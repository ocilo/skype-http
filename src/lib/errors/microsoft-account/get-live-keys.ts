import { Incident } from "incident";
import * as httpIo from "../../interfaces/http-io";
import { RequestError } from "../http";

export namespace MsprequCookieNotFoundError {
  export type Name = "MsprequCookieNotFound";
  export const name: Name = "MsprequCookieNotFound";

  export interface Data {
    request: httpIo.GetOptions;
    response: httpIo.Response;
  }

  export type Cause = undefined;
}

export type MsprequCookieNotFoundError = Incident<MsprequCookieNotFoundError.Data,
  MsprequCookieNotFoundError.Name,
  MsprequCookieNotFoundError.Cause>;

export namespace MsprequCookieNotFoundError {
  export type Type = MsprequCookieNotFoundError;

  export function format({response, request}: Data) {
    return "Unable to find the MSPRequ cookie for https://login.live.com/."
      + " This cookie is normally set in the response headers."
      + " This error may be caused by a change in the Microsoft login workflow."
      + ` Request: ${JSON.stringify(request)}, Response: ${response}`;
  }

  export function create(request: httpIo.GetOptions, response: httpIo.Response): MsprequCookieNotFoundError {
    return new Incident(name, {request, response}, format);
  }
}

export namespace MspokCookieNotFoundError {
  export type Name = "MspokCookieNotFound";
  export const name: Name = "MspokCookieNotFound";

  export interface Data {
    request: httpIo.GetOptions;
    response: httpIo.Response;
  }

  export type Cause = undefined;
}

export type MspokCookieNotFoundError = Incident<MspokCookieNotFoundError.Data,
  MspokCookieNotFoundError.Name,
  MspokCookieNotFoundError.Cause>;

export namespace MspokCookieNotFoundError {
  export type Type = MspokCookieNotFoundError;

  export function format({response, request}: Data) {
    return "Unable to find the MSPOK cookie for https://login.live.com/."
      + " This cookie is normally set in the response headers."
      + " This error may be caused by a change in the Microsoft login workflow."
      + ` Request: ${JSON.stringify(request)}, Response: ${response}`;
  }

  export function create(request: httpIo.GetOptions, response: httpIo.Response): MspokCookieNotFoundError {
    return new Incident(name, {request, response}, format);
  }
}

export namespace PpftKeyNotFoundError {
  export type Name = "PpftKeyNotFound";
  export const name: Name = "PpftKeyNotFound";

  export interface Data {
    html: string;
  }

  export type Cause = undefined;
}

export type PpftKeyNotFoundError = Incident<PpftKeyNotFoundError.Data,
  PpftKeyNotFoundError.Name,
  PpftKeyNotFoundError.Cause>;

export namespace PpftKeyNotFoundError {
  export type Type = PpftKeyNotFoundError;

  export function format({html}: Data) {
    return "Unable to find the PPFT key for https://login.live.com/."
      + " This key is normally found in the HTML response, in a Javascript literal string containing an HTML input"
      + " with the attribute name=\"PPFT\", the key is the value of this input and is extracted with a regular"
      + " expression. This error may be caused by a change in the Microsoft login workflow."
      + ` HTML page: ${JSON.stringify(html)}`;
  }

  export function create(html: string): PpftKeyNotFoundError {
    return new Incident(name, {html}, format);
  }
}

export namespace GetLiveKeysError {
  export type Name = "GetLiveKeys";
  export const name: Name = "GetLiveKeys";

  export interface Data {
  }

  export type Cause = RequestError | MspokCookieNotFoundError | MsprequCookieNotFoundError | PpftKeyNotFoundError;
}

export type GetLiveKeysError = Incident<GetLiveKeysError.Data, GetLiveKeysError.Name, GetLiveKeysError.Cause>;

export namespace GetLiveKeysError {
  export type Type = GetLiveKeysError;

  export function format() {
    return "Unable to get the MSPRequ, MSPOK and PPFT keys from login.live.com";
  }

  export function create(cause: Cause): GetLiveKeysError {
    return Incident(cause, name, {}, format);
  }
}
