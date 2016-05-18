import * as Bluebird from "bluebird";
import {Incident} from "incident";

import * as api from "../interfaces/api";
import {ApiContext} from "../interfaces/api-context";
import * as io from "../interfaces/io";
import {getCurrentTime} from "../utils";
import * as messagesUri from "../messages-uri";

interface RequestBody {
  clientmessageid: string;
  content: string;
  messagetype: string;
  contenttype: string;
}

export function sendMessage(io: io.IO, apiContext: ApiContext, message: api.NewMessage, conversationId: string): Bluebird<any> {
  return Bluebird
    .try(() => {
      let requestBody: RequestBody = {
        clientmessageid: String(getCurrentTime()),
        content: String(message.textContent),
        messagetype: "RichText",
        contenttype: "text"
      };
      let requestOptions: io.PostOptions = {
        uri: messagesUri.messages(apiContext.registrationToken.host, messagesUri.DEFAULT_USER, conversationId),
        jar: apiContext.cookieJar,
        body: JSON.stringify(requestBody),
        headers: {
          "RegistrationToken": apiContext.registrationToken.raw
        }
      };
      return io.post(requestOptions);
    })
    .then((res: io.Response) => {
      if (res.statusCode !== 201) {
        return Bluebird.reject(new Incident("send-message", "Received wrong return code"));
      }
    });
}

export default sendMessage;
