import * as fs from "async-file";
import { Incident } from "incident";
import * as api from "../interfaces/api/api";
import { Context } from "../interfaces/api/context";
import * as io from "../interfaces/http-io";
import * as messagesUri from "../messages-uri";
import { getCurrentTime } from "../utils";

interface SendMessageResponse {
  OriginalArrivalTime: number;
}

interface SendMessageQuery {
  clientmessageid: string;
  content: string;
  messagetype: string;
  contenttype: string;
}

export async function sendImage(
  io: io.HttpIo, apiContext: Context,
  img: api.NewImage,
  conversationId: string,
): Promise<api.SendMessageResult> {
  if (!img.file || !img.name) {
    return Promise.reject(new Incident("send-image", "Invalid parameters"));
  }
  let bodyNewObject = {
    type: "pish/image",
    permissions: Object()
  };
  bodyNewObject.permissions[conversationId] = ["read"];
  const bodyNewObjectStr : string = JSON.stringify(bodyNewObject);
  const requestOptionsNewObject: io.PostOptions = {
    uri: messagesUri.objects("api.asm.skype.com"),
    cookies: apiContext.cookies,
    body: bodyNewObjectStr,
    headers: {
      "Authorization": "skype_token " + apiContext.skypeToken.value,
      "Content-Type": "application/json",
      "Content-Length": bodyNewObjectStr.length,
    },
  };
  const resNewObject: io.Response = await io.post(requestOptionsNewObject);
  console.log(JSON.stringify(resNewObject, null, 2));
  if (resNewObject.statusCode !== 201) {
    return Promise.reject(new Incident("send-image", "Received wrong return code"));
  }
  const objectId = JSON.parse(resNewObject.body).id;
  
  const file = await fs.readFile(img.file);
  const requestOptionsPutObject: io.PutOptions = {
    uri: messagesUri.objectContent("api.asm.skype.com", objectId, "imgpsh"),
    cookies: apiContext.cookies,
    body: file,
    headers: {
      "Authorization": "skype_token " + apiContext.skypeToken.value,
      "Content-Type": "multipart/form-data",
      "Content-Length": file.byteLength,
    },
  };
  const resObject: io.Response = await io.put(requestOptionsPutObject);
  console.log(JSON.stringify(resObject, null, 2));
  if (resObject.statusCode !== 201) {
    return Promise.reject(new Incident("send-image", "Received wrong return code"));
  }
  
  const query: SendMessageQuery = {
    clientmessageid: String(getCurrentTime() + Math.floor(10000 * Math.random())),
    content: String("<URIObject type=\"Picture.1\" uri=\"" + messagesUri.object("api.asm.skype.com", objectId) + "\" url_thumbnail=\"" +
      messagesUri.objectView("api.asm.skype.com", objectId, "imgt1") + "\">loading...<OriginalName v=\"" + img.name + "\"/><meta type=\"photo\" originalName=\"" + img.name + "\"/></URIObject>"),
    messagetype: "RichText/UriObject",
    contenttype: "text",
  };
  const requestOptions: io.PostOptions = {
    uri: messagesUri.messages(apiContext.registrationToken.host, messagesUri.DEFAULT_USER, conversationId),
    cookies: apiContext.cookies,
    body: JSON.stringify(query),
    headers: {
      RegistrationToken: apiContext.registrationToken.raw,
    },
  };
  const res: io.Response = await io.post(requestOptions);

  console.log(JSON.stringify(res, null, 2));
  if (res.statusCode !== 201) {
    return Promise.reject(new Incident("send-message", "Received wrong return code"));
  }
  const parsed: messagesUri.MessageUri = messagesUri.parseMessage(res.headers["location"]);
  const body: SendMessageResponse = JSON.parse(res.body);
  return {
    clientMessageId: query.clientmessageid,
    arrivalTime: body.OriginalArrivalTime,
    textContent: query.content,
    MessageId: parsed.message,
  };
}

export default sendImage;
