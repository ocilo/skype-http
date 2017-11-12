import { Incident } from "incident";

export namespace WrongCredentialsLimitError {
  export type Name = "WrongCredentialsLimit";
  export const name: Name = "WrongCredentialsLimit";

  export interface Data {
  }

  export type Cause = undefined;
}

/* tslint:disable-next-line:max-line-length */
export type WrongCredentialsLimitError = Incident<WrongCredentialsLimitError.Data, WrongCredentialsLimitError.Name, WrongCredentialsLimitError.Cause>;

export namespace WrongCredentialsLimitError {
  export type Type = WrongCredentialsLimitError;

  export function format() {
    return "You've tried to sign in too many times with an incorrect account or password";
  }

  export function create(username?: string): WrongCredentialsLimitError {
    return Incident(name, {username}, format);
  }
}
