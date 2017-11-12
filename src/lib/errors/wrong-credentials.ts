import { Incident } from "incident";

export namespace WrongCredentialsError {
  export type Name = "WrongCredentials";
  export const name: Name = "WrongCredentials";

  export interface Data {
    username?: string;
  }

  export type Cause = undefined;
}

/* tslint:disable-next-line:max-line-length */
export type WrongCredentialsError = Incident<WrongCredentialsError.Data, WrongCredentialsError.Name, WrongCredentialsError.Cause>;

export namespace WrongCredentialsError {
  export type Type = WrongCredentialsError;

  export function format({username}: Data) {
    if (typeof username === "string") {
      return `Wrong credentials for the user "${username}"`;
    } else {
      return "Wrong credentials";
    }
  }

  export function create(username?: string): WrongCredentialsError {
    return Incident(name, {username}, format);
  }
}
