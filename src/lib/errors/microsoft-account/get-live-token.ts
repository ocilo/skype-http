import { Incident } from "incident";
import { RequestError } from "../http";

export namespace LiveTokenNotFoundError {
  export type Name = "LiveTokenNotFound";
  export const name: Name = "LiveTokenNotFound";

  export interface Data {
    html: string;
  }

  export type Cause = undefined;
}

export type LiveTokenNotFoundError = Incident<LiveTokenNotFoundError.Data,
  LiveTokenNotFoundError.Name,
  LiveTokenNotFoundError.Cause>;

export namespace LiveTokenNotFoundError {
  export type Type = LiveTokenNotFoundError;

  export function format({html}: Data) {
    return "Unable to find the Live token."
      + " This token is normally found in the HTML response as the value of the element with the id \"t\"."
      + " This error may be caused by a change in the Microsoft login workflow."
      + ` HTML page: ${JSON.stringify(html)}`;
  }

  export function create(html: string): LiveTokenNotFoundError {
    return new Incident(name, {html}, format);
  }
}

export namespace GetLiveTokenError {
  export type Name = "GetLiveToken";
  export const name: Name = "GetLiveToken";

  export interface Data {
  }

  export type Cause = RequestError | LiveTokenNotFoundError;
}

export type GetLiveTokenError = Incident<GetLiveTokenError.Data, GetLiveTokenError.Name, GetLiveTokenError.Cause>;

export namespace GetLiveTokenError {
  export type Type = GetLiveTokenError;

  export function format() {
    return "Unable to get the Live token for Skype";
  }

  export function create(cause: Cause): GetLiveTokenError {
    return Incident(cause, name, {}, format);
  }
}
