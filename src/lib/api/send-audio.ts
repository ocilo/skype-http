import * as fs from "async-file";
import { Incident } from "incident";
import * as api from "../interfaces/api/api";
import { Context } from "../interfaces/api/context";
import * as io from "../interfaces/http-io";
import * as messagesUri from "../messages-uri";
import { getCurrentTime } from "../utils";

interface SendMessageQuery {
  clientmessageid: string;
  content: string;
  messagetype: string;
  contenttype: string;
  amsreferences: string[];
}

interface SendMessageResponse {
  OriginalArrivalTime: number;
}

export async function sendAudio(
  io: io.HttpIo,
  apiContext: Context,
  document: api.NewMediaMessage,
  conversationId: string,
): Promise<api.SendMessageResult> {
  const bodyNewObject: any = {
    filename: document.name,
    type: "sharing/audio",
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
      "X-Client-Version": "0/0.0.0.0",
    },
  };

  const resNewObject: io.Response = await io.post(requestOptionsNewObject);

  if (resNewObject.statusCode !== 201) {
    return Promise.reject(new Incident("send-audio", "Received wrong return code"));
  }
  const objectId: string = JSON.parse(resNewObject.body).id;
  const file: Buffer = await fs.readFile(document.file);
  const requestOptionsPutObject: io.PutOptions = {
    uri: messagesUri.objectContent("api.asm.skype.com", objectId, "audio"),
    cookies: apiContext.cookies,
    body: file,
    headers: {
      "Authorization": `skype_token ${apiContext.skypeToken.value}`,
      "Content-Type": "application",
      "Content-Length": file.length.toString(10),
    },
  };

  const resObject: io.Response = await io.put(requestOptionsPutObject);
  if (resObject.statusCode !== 201) {
    return Promise.reject(new Incident("send-audio", "Received wrong return code in upload"));
  }

  const objectContent: string = messagesUri.object("api.asm.skype.com", objectId);
  const thumbnail: string = messagesUri.objectView("api.asm.skype.com", objectId, "audio");
  const query: SendMessageQuery = {
    clientmessageid: String(getCurrentTime() + Math.floor(10000 * Math.random())),
    content: `
      <URIObject uri="${objectContent}" url_thumbnail="${thumbnail}" type="Audio.1" doc_id="${objectId}">
        loading...
        <OriginalName v="${document.name}"></OriginalName>
        <FileSize v="${file.length}"></FileSize>
      </URIObject>
    `,
    messagetype: "RichText/Media_GenericFile",
    contenttype: "text",
    amsreferences: [objectId],
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
    return Promise.reject(new Incident("send-audio", "Received wrong return code in send document"));
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
