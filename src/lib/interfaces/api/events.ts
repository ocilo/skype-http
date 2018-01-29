import { Resource } from "./resources";

export interface EventMessage {
  id: number;
  type: string;
  resourceType: string;
  time: Date;
  resourceLink: string;
  resource: Resource | null;
}
