import { Incident } from "incident";
import { RequestError } from "../http";

export namespace SkypeTokenNotFoundError {
  export type Name = "SkypeTokenNotFound";
  export const name: Name = "SkypeTokenNotFound";

  export interface Data {
    html: string;
  }

  export type Cause = undefined;
}

export type SkypeTokenNotFoundError = Incident<SkypeTokenNotFoundError.Data,
  SkypeTokenNotFoundError.Name,
  SkypeTokenNotFoundError.Cause>;

export namespace SkypeTokenNotFoundError {
  export type Type = SkypeTokenNotFoundError;

  export function format({html}: Data) {
    return "Unable to find the OAuth Skype token. This may be caused by wrong credentials or a change in"
      + " the Microsoft login workflow. You may also have hit a CAPTCHA wall."
      + " This token is normally found in the HTML response as the value of the element `input[name=skypetoken]`."
      + ` HTML page: ${JSON.stringify(html)}`;
  }

  export function create(html: string): SkypeTokenNotFoundError {
    return new Incident(name, {html}, format);
  }
}

export namespace GetSkypeTokenError {
  export type Name = "GetSkypeToken";
  export const name: Name = "GetSkypeToken";

  export interface Data {
  }

  export type Cause = RequestError | SkypeTokenNotFoundError;
}

export type GetSkypeTokenError = Incident<GetSkypeTokenError.Data, GetSkypeTokenError.Name, GetSkypeTokenError.Cause>;

export namespace GetSkypeTokenError {
  export type Type = GetSkypeTokenError;

  export function format() {
    return "Unable to get the OAuth Skype token.";
  }

  export function create(cause: Cause): GetSkypeTokenError {
    return Incident(cause, name, {}, format);
  }
}
