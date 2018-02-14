import { Incident } from "incident";
import { Context } from "../interfaces/api/context";
import * as io from "../interfaces/http-io";
import * as messagesUri from "../messages-uri";

interface RequestBody {
  topic: string;
}

export async function setConversationTopic(
  io: io.HttpIo,
  apiContext: Context,
  conversationId: string,
  topic: string,
): Promise<void> {

  const requestBody: RequestBody = {
    topic,
  };

  const uri: string = messagesUri.properties(apiContext.registrationToken.host, conversationId);

  const requestOptions: io.PutOptions = {
    uri,
    cookies: apiContext.cookies,
    body: JSON.stringify(requestBody),
    queryString: {name: "topic"},
    headers: {
      "RegistrationToken": apiContext.registrationToken.raw,
      "Content-type": "application/json",
    },
  };
  const res: io.Response = await io.put(requestOptions);

  if (res.statusCode !== 200) {
    return Promise.reject(new Incident("set-conversation-topic", "Received wrong return code"));
  }
}
