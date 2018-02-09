import { MessageResource } from "./resources";

export interface ThreadProperties {
  topic?: string;
  // a timestamp ? example: "1421342788493"
  lastjoinat?: string;
  // a timestamp ? example: "1464029299838"
  version?: string;
}

// https://github.com/OllieTerrance/SkPy.docs/blob/master/protocol/chat.rst#join-urls
export interface Join {
  Blob: string;
  Id: string;
  JoinUrl: string;
  ThreadId: string;
}

export interface Conversation {
  // https://{host}/v1/threads/{19:threadId} or // https://{host}/v1/users/ME/contacts/{8:contactId}
  targetLink: string;
  threadProperties?: ThreadProperties;
  id: string;
  type: "Conversation" | string;
  version: number; // a timestamp ? example: 1464030261015
  properties: {
    // example: "1461605505609;1461605570732;10435004700722293356"
    consumptionhorizon?: string;
  };
  // TODO: Check if empty object really occurs
  lastMessage: {} | MessageResource;
  // https://{host}/v1/users/ME/contacts/{thread}/messages (even if targetLink points to /v1/threads)
  messages: string;
}

export type Capability = "AddMember" | "ChangeTopic" | "ChangePicture" | "EditMsg" | "CallP2P"
  | "SendText" | "SendSms" | "SendContacts" | "SendVideoMsg" | "SendMediaMsg" | "ChangeModerated";

export interface ThreadMember {
  // "8:..."
  id: string;
  // url https://{host}/v1/users/{user}
  userLink: string;
  role: "User" | "Admin" | string;
  capabilities: any[];
  // can be an empty string
  linkedMri: string;
  // can be an empty string
  userTile: string;
  // can be an empty string
  friendlyName: string;
}

export interface AllUsers {
  [type: string]: string[];
}

export interface Members {
  id: string;
  role: "Admin" | "User" | string;
}

export interface Thread {
  // "19:..."
  id: string;
  // enum ?
  type: "Thread" | string;
  properties: {
    // epoch ?
    createdat: string;
    // creator id, "8:..."
    creator: string;
    topic: string;
    // "true" or "false"
    joiningenabled: "true" | "false" | string;
    capabilities: Capability[];
    // TODO: check
    lastjoinat?: string;
    // TODO: check
    version?: string;
  };
  members: ThreadMember[];
  // epoch ?
  version: number;
  // https://{host}/v1/users/ME/contacts/{thread}/messages (even if targetLink points to /v1/threads)
  messages: string;
}
