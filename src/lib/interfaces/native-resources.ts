export interface NativeResource {
  id: string; // A large integer
  ackrequired: string; // https://{host}/v1/users/ME/conversations/{conversation}/ALL/messages/{id}/ack
  originalarrivaltime: string; // JSON date
  imdisplayname: string; // display name of the author
  messagetype: "Control/ClearTyping" | "Control/Typing" | "RichText" | "RichText/UriObject" | "Text" | string;
  conversationLink: string; // https://{host}/v1/users/ME/conversations/{conversation}
  composetime: string; // JSON date
  isactive: boolean;
  from: string; // https://{host}/v1/users/ME/contacts/{contact}
  type: "Message" | string;
  version: string; // same as `id`
}

export interface Control extends NativeResource {
  messagetype: "Control/ClearTyping" | "Control/Typing";
}

export interface ClearTyping extends Control {
  messagetype: "Control/ClearTyping";
}

export interface Typing extends Control {
  messagetype: "Control/Typing";
}

export interface Text extends NativeResource {
  messagetype: "Text";
  clientmessageid: string; // A large integer (~20 digits)
  content: string;
}

export interface RichText extends NativeResource {
  messagetype: "RichText";
  clientmessageid: string; // A large integer (~20 digits)
  content: string; // For example when using smileys: "Hi <ss type=\"smile\">:)</ss>"
}

export interface UriObject extends NativeResource {
  messagetype: "RichText/UriObject";
  clientmessageid: string; // A large integer (~20 digits)
  content: string; // XML, root is <URIObject>
}
