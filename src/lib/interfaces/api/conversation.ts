export interface ThreadProperties {
  topic?: string;
  lastjoinat?: string; // a timestamp ? example: "1421342788493"
  version?: string; // a timestamp ? example: "1464029299838"
}

export interface Conversation {
  threadProperties?: ThreadProperties;
  id: string;
  type: "Conversation" | "Thread" | string;
  version: number; // a timestamp ? example: 1464030261015
  members?: string[]; // array of ids
}
