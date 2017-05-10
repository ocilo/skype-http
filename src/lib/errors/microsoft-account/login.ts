import {Incident} from "incident";
import {WrongCredentialsError} from "../wrong-credentials";
import {GetLiveKeysError} from "./get-live-keys";
import {GetLiveTokenError} from "./get-live-token";
import {GetSkypeTokenError} from "./get-skype-token";

// TODO(demurgos): Differenciate between workflow errors (network error, unexpected responses) and expected errors
export namespace MicrosoftAccountLoginError {
  export type Name = "MicrosoftAccountLogin";
  export const name: Name = "MicrosoftAccountLogin";
  export interface Data {
  }
  export type Cause = GetLiveKeysError | GetLiveTokenError | GetSkypeTokenError | WrongCredentialsError;
}

export type MicrosoftAccountLoginError = Incident<MicrosoftAccountLoginError.Name,
  MicrosoftAccountLoginError.Data,
  MicrosoftAccountLoginError.Cause>;

export namespace MicrosoftAccountLoginError {
  export type Type = MicrosoftAccountLoginError;

  export function format() {
    return `Unable to login with MicrosoftAccount.`;
  }

  export function create(cause: Cause): MicrosoftAccountLoginError {
    return Incident(cause, name, {}, format);
  }
}

export default MicrosoftAccountLoginError;
