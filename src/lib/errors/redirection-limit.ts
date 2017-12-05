import { Incident } from "incident";

export type Name = "RedirectionLimit";
export const name: Name = "RedirectionLimit";

export interface Data {
  limit?: number;
}

export type Cause = undefined;

export type Type = Incident<Data, Name, Cause>;

export function create(limit?: number): Incident<Data, Name, Cause> {
  return Incident(name, {limit});
}
