import * as Bluebird from "bluebird";
import {SendMessageOptions} from "../api";
import {getCurrentTime} from "../utils";

export interface RequestBody {
  clientmessageid: string;
  content: string;
  messagetype: string;
  contenttype: string;
}

function getConversationUrl(conversationId: string) {
  return Consts.SKYPEWEB_HTTPS + skypeAccount.messagesHost + "/v1/users/ME/conversations/" + conversationId + "/messages";
}

export function sendMessage(ctx: any, conversationId: string, options: SendMessageOptions): Bluebird<any> {
  let requestBody: RequestBody = {
    clientmessageid: String(getCurrentTime()),
    content: options.body,
    messagetype: messagetype || "RichText",
    contenttype: contenttype || "text"
  };

  let query = JSON.stringify(requestBody);

  return Bluebird
    .fromCallback((cb) => {
      return ctx.requestWithJar.post({
        uri: getConversationUrl(conversationId),
        body: requestBody,
        headers: {
          "RegistrationToken": skypeAccount.registrationTokenParams.raw
        },
        callback: (err, res, body) => {
          if (err) {
            return cb(new Error("Failed to send message."));
            // ".\n Error code: " + response.statusCode +
            // ".\n Error: " + error +
            // ".\n Body: " + body
          }
          if (res.statusCode !== 201) {
            return cb(new Error("Wrong return code..."));
          }
          return cb(null, null);
        }
      });
    });
}

export default sendMessage;
