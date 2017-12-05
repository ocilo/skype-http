import { Incident } from "incident";
import { GetOptions, Response } from "../interfaces/http-io";

export type Name = "LoginRateLimitExceeded";
export const name: Name = "LoginRateLimitExceeded";

export interface Data {
  req: GetOptions;
  res: Response;
}

export type Cause = undefined;

export type Type = Incident<Data, Name, Cause>;

export function create(req: GetOptions, res: Response): Incident<Data, Name, Cause> {
  return Incident(name, {req, res});
}
