import { Incident } from "incident";
import { UnexpectedHttpStatusError } from "../../errors/http";
import { Context } from "../../interfaces/api/context";
import * as io from "../../interfaces/http-io";
import { JSON_READER } from "../../json-reader";
import * as messagesUri from "../../messages-uri";
import { MriKey, MriType, parse } from "../../mri";
import { $Conversation, Conversation } from "../../types/conversation";

interface GetConversationQuery {
  startTime: string; // a timestamp ?
  view: "msnp24Equivalent" | string;
  targetType: string; // seen: Passport|Skype|Lync|Thread
}

export async function getConversationById(
  httpIo: io.HttpIo,
  apiContext: Context,
  conversationMri: MriKey,
): Promise<Conversation> {
  const query: GetConversationQuery = {
    startTime: "0",
    view: "msnp24Equivalent",
    targetType: "Passport|Skype|Lync|Thread",
  };

  let uri: string;
  if (parse(conversationMri).type === MriType.Thread) {
    uri = messagesUri.thread(apiContext.registrationToken.host, conversationMri);
  } else { // 8: private conversation
    uri = messagesUri.conversation(apiContext.registrationToken.host, messagesUri.DEFAULT_USER, conversationMri);
  }

  const request: io.GetOptions = {
    uri,
    cookies: apiContext.cookies,
    queryString: query,
    headers: {
      RegistrationToken: apiContext.registrationToken.raw,
    },
  };

  const response: io.Response = await httpIo.get(request);
  if (response.statusCode !== 200) {
    UnexpectedHttpStatusError.create(response, new Set([200]), request);
  }
  let result: Conversation;
  try {
    result = $Conversation.read(JSON_READER, response.body);
  } catch (err) {
    throw new Incident(err, "UnexpectedResponseBody", {body: response.body});
  }
  return result;
}
