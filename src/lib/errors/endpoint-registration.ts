import { Incident } from "incident";
import { GetOptions, Response } from "../interfaces/http-io";
import { MissingHeaderError, UnexpectedHttpStatusError } from "./http";
import { Type as LoginRateLimitExceeded } from "./login-rate-limit-exceeded";
import { Type as RedirectionLimit } from "./redirection-limit";

export namespace EndpointRegistrationError {
  export type Name = "EndpointRegistration";

  export interface HttpExchange {
    req: GetOptions;
    res: Response;
  }

  export interface Data {
    tries: HttpExchange[];
  }

  export type Cause = LoginRateLimitExceeded | MissingHeaderError | UnexpectedHttpStatusError | RedirectionLimit;
}

export type Name = EndpointRegistrationError.Name;
export const NAME: Name = "EndpointRegistration";

export type HttpExchange = EndpointRegistrationError.HttpExchange;

export type Data = EndpointRegistrationError.Data;

export type Cause = EndpointRegistrationError.Cause;

export class EndpointRegistrationError extends Incident<Data, Name, Cause> {
  static NAME: Name = NAME;

  constructor(cause: Cause, tries: HttpExchange[]) {
    super(cause, EndpointRegistrationError.NAME, {tries});
  }
}
