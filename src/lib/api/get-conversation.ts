import * as Bluebird from "bluebird";
import {Incident} from "incident";
import {Context} from "../interfaces/api/context";
import {Conversation} from "../interfaces/api/conversation";
import * as io from "../interfaces/io";
import {
  Conversation as NativeConversation,
  Thread as NativeThread
} from "../interfaces/native-api/conversation";
import * as messagesUri from "../messages-uri";
import {formatConversation, formatThread} from "../utils/formatters";

interface ConversationBody {
  conversations: NativeConversation[];
  _metadata: {
    totalCount: number;
    forwardLink: string; // url
    backwardLink: string; // url
    syncState: string; // url
  };
}

interface GetConversationQuery {
  startTime: number; // a timestamp ?
  view: "msnp24Equivalent" | string;
  targetType: string; // seen: Passport|Skype|Lync|Thread
}

export function getConversation(io: io.HttpIo, apiContext: Context, conversationId: string): Bluebird<Conversation> {
  return Bluebird
    .try(() => {
      const query: GetConversationQuery = {
        startTime: 0,
        view: "msnp24Equivalent",
        targetType: "Passport|Skype|Lync|Thread"
      };

      let uri: string;
      if (conversationId.indexOf("19:") === 0) { // group discussion
        uri = messagesUri.thread(apiContext.registrationToken.host, conversationId);
      } else { // 8: private conversation
        uri = messagesUri.conversation(apiContext.registrationToken.host, messagesUri.DEFAULT_USER, conversationId);
      }

      const requestOptions: io.GetOptions = {
        uri: uri,
        jar: apiContext.cookieJar,
        queryString: query,
        headers: {
          RegistrationToken: apiContext.registrationToken.raw
        }
      };
      return io.get(requestOptions);
    })
    .then((res: io.Response) => {
      if (res.statusCode !== 200) {
        return Bluebird.reject(new Incident("net", "Unable to fetch conversation"));
      }
      const body: NativeConversation | NativeThread = JSON.parse(res.body);

      if (body.type === "Thread") {
        return Bluebird.resolve(formatThread(<NativeThread> body));
      } else if (body.type === "Conversation") {
        return Bluebird.resolve(formatConversation(<NativeConversation> body));
      } else {
        return Bluebird.reject(new Incident("unknonwn-type", "Unknown type for conversation..."));
      }
    });
}

export default getConversation;
