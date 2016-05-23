import * as Bluebird from "bluebird";
import * as _ from "lodash";
import {Incident} from "incident";

import * as io from "../interfaces/io";
import {Conversation} from "../interfaces/api";
import {Conversation as NativeConversation} from "../interfaces/native-api";
import {ApiContext} from "../interfaces/api-context";
import * as messagesUri from "../messages-uri";
import {formatConversation} from "../utils/formatters";

interface ConversationsBody {
  conversations: NativeConversation[];
  _metadata: {
    totalCount: number;
    forwardLink: string; // url
    backwardLink: string; // url
    syncState: string; // url
  }
}

interface GetConversationsQuery {
  startTime: number, // a timestamp ?
  view: "msnp24Equivalent" | string;
  targetType: string; // seen: Passport|Skype|Lync|Thread
}

export function getConversations (io: io.IO, apiContext: ApiContext): Bluebird<Conversation[]> {
  return Bluebird
    .try(() => {
      const query: GetConversationsQuery = {
        startTime: 0,
        view: "msnp24Equivalent",
        targetType: "Passport|Skype|Lync|Thread"
      };

      const requestOptions: io.GetOptions = {
        uri: messagesUri.conversations(apiContext.registrationToken.host, messagesUri.DEFAULT_USER),
        jar: apiContext.cookieJar,
        qs: query,
        headers: {
          "RegistrationToken": apiContext.registrationToken.raw
        }
      };
      return io.get(requestOptions);
    })
    .then((res: io.Response) => {
      if (res.statusCode !== 200) {
        return Bluebird.reject(new Incident("net", "Unable to fetch conversations"));
      }
      const body: ConversationsBody = JSON.parse(res.body);
      return _.map(body.conversations, formatConversation);
    });
}

export default getConversations;
