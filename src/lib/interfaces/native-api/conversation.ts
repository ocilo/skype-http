import {EmptyObject} from "../utils";
import {MessageResource} from "./resources";

export interface ThreadProperties {
  topic?: string;
  lastjoinat?: string; // a timestamp ? example: "1421342788493"
  version?: string; // a timestamp ? example: "1464029299838"
}

export interface Conversation {
  targetLink: string; // https://{host}/v1/threads/{19:threadId} or // https://{host}/v1/users/ME/contacts/{8:contactId}
  threadProperties?: ThreadProperties;
  id: string;
  type: "Conversation" | string;
  version: number; // a timestamp ? example: 1464030261015
  properties: {
    consumptionhorizon?: string; // example: "1461605505609;1461605570732;10435004700722293356"
  };
  lastMessage: EmptyObject | MessageResource;
  messages: string; // https://{host}/v1/users/ME/contacts/{thread}/messages (even if targetLink points to /v1/threads)
}

export type Capability = "AddMember" | "ChangeTopic" | "ChangePicture" | "EditMsg" | "CallP2P" | "SendText" | "SendSms"
  | "SendContacts" | "SendVideoMsg" | "SendMediaMsg" | "ChangeModerated";

export interface ThreadMember {
  id: string; // "8:..."
  userLink: string; // url https://{host}/v1/users/{user}
  role: "User" | "Admin" | string;
  capabilities: any[];
  linkedMri: string; // can be an empty string
  userTile: string; // can be an empty string
  friendlyName: string; // can be an empty string
}

export interface Thread {
  id: string; // "19:..."
  type: "Thread" | string; // enum ?
  properties: {
    createdat: string; // epoch ?
    creator: string; // creator id, "8:..."
    topic: string;
    joiningenabled: "true" | "false" | string; // "true" or "false"
    capabilities: Capability[];
    lastjoinat?: string; // TODO: check
    version?: string; // TODO: check
  };
  members: ThreadMember[];
  version: number; // epoch ?
  messages: string; // https://{host}/v1/users/ME/contacts/{thread}/messages (even if targetLink points to /v1/threads)
}
