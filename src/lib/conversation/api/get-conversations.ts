import { Incident } from "incident";
import { $Uint53 } from "kryo/builtins/uint53";
import { ArrayType } from "kryo/types/array";
import { DocumentIoType, DocumentType } from "kryo/types/document";
import { UnexpectedHttpStatusError } from "../../errors/http";
import { Context } from "../../interfaces/api/context";
import * as io from "../../interfaces/http-io";
import { JSON_READER } from "../../json-reader";
import * as messagesUri from "../../messages-uri";
import { $Conversation, Conversation } from "../../types/conversation";
import { $Url } from "../../types/url";

interface GetConversationsMetadata {
  totalCount: number;
  forwardLink: string; // url
  backwardLink: string; // url
  syncState: string; // url
}

const $GetConversationsMetadata: DocumentIoType<GetConversationsMetadata> = new DocumentType({
  properties: {
    totalCount: {type: $Uint53},
    forwardLink: {type: $Url},
    backwardLink: {type: $Url},
    syncState: {type: $Url},
  },
});

interface GetConversationsResult {
  conversations: Conversation[];
  _metadata: GetConversationsMetadata;
}

const $GetConversationsResult: DocumentIoType<GetConversationsResult> = new DocumentType({
  properties: {
    conversations: {type: new ArrayType({itemType: $Conversation, maxLength: Infinity})},
    _metadata: {type: $GetConversationsMetadata},
  },
});

interface GetConversationsQuery {
  startTime: string; // a timestamp ?
  view: "msnp24Equivalent" | string;
  targetType: string; // seen: Passport|Skype|Lync|Thread
}

export async function getConversations(httpIo: io.HttpIo, apiContext: Context): Promise<Conversation[]> {
  const query: GetConversationsQuery = {
    startTime: "0",
    view: "msnp24Equivalent",
    targetType: "Passport|Skype|Lync|Thread",
  };

  const request: io.GetOptions = {
    uri: messagesUri.conversations(apiContext.registrationToken.host, messagesUri.DEFAULT_USER),
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
  let result: GetConversationsResult;
  try {
    result = $GetConversationsResult.read(JSON_READER, response.body);
  } catch (err) {
    throw new Incident(err, "UnexpectedResponseBody", {body: response.body});
  }
  return result.conversations;
}
