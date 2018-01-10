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
  const bodyNewObject: any = {
    type: "pish/image",
    permissions: {[conversationId]: ["read"]},
  };
  const bodyNewObjectStr: string = JSON.stringify(bodyNewObject);
  const requestOptionsNewObject: io.PostOptions = {
    uri: messagesUri.objects("api.asm.skype.com"),
    cookies: apiContext.cookies,
    body: bodyNewObjectStr,
    headers: {
      "Authorization": `skype_token ${apiContext.skypeToken.value}`,
      "Content-Type": "application/json",
      "Content-Length": bodyNewObjectStr.length.toString(10),
    },
  };
  const resNewObject: io.Response = await io.post(requestOptionsNewObject);

  if (resNewObject.statusCode !== 201) {
    return Promise.reject(new Incident("send-image", "Received wrong return code"));
  }
  const objectId: string = JSON.parse(resNewObject.body).id;

  const file: Buffer = await fs.readFile(img.file);
  const requestOptionsPutObject: io.PutOptions = {
    uri: messagesUri.objectContent("api.asm.skype.com", objectId, "imgpsh"),
    cookies: apiContext.cookies,
    body: file,
    headers: {
      "Authorization": `skype_token ${apiContext.skypeToken.value}`,
      "Content-Type": "multipart/form-data",
      "Content-Length": file.byteLength.toString(10),
    },
  };
  const resObject: io.Response = await io.put(requestOptionsPutObject);

  if (resObject.statusCode !== 201) {
    return Promise.reject(new Incident("send-image", "Received wrong return code"));
  }

  const pictureUri: string = messagesUri.object("api.asm.skype.com", objectId);
  const pictureThumbnailUri: string = messagesUri.objectView("api.asm.skype.com", objectId, "imgt1");

  const query: SendMessageQuery = {
    clientmessageid: String(getCurrentTime() + Math.floor(10000 * Math.random())),
    content: `
      <URIObject type="Picture.1" uri="${pictureUri}" url_thumbnail="${pictureThumbnailUri}">
        loading...
        <OriginalName v="${img.name}"/>
        <meta type="photo" originalName="${img.name}"/>
      </URIObject>
    `,
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
