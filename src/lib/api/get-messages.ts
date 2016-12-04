// import * as Bluebird from "bluebird";
// import * as _ from "lodash";
// import {Incident} from "incident";
//
// import * as io from "../interfaces/io";
// import {Conversation} from "../interfaces/api";
// import {Conversation as NativeConversation} from "../interfaces/native-api";
// import {ApiContext} from "../interfaces/api-context";
// import * as messagesUri from "../messages-uri";
// import {formatConversation} from "../utils/formatters";
//
// interface GetMessagesQuery {
//   startTime: number, // a timestamp ?
//   view: "msnp24Equivalent" | string;
//   targetType: string; // seen: Passport|Skype|Lync|Thread
// }
//
// export function getMessages (io: io.HttpIo, apiContext: ApiContext, conversationId: string): Bluebird<Message[]> {
//   return Bluebird
//     .try(() => {
//       const query: GetMessagesQuery = {
//         startTime: 0,
//         view: "msnp24Equivalent",
//         targetType: "Passport|Skype|Lync|Thread"
//       };
//
//       const requestOptions: io.GetOptions = {
//         uri: messagesUri.conversation(apiContext.registrationToken.host, messagesUri.DEFAULT_USER, conversationId),
//         jar: apiContext.cookieJar,
//         qs: query,
//         headers: {
//           "RegistrationToken": apiContext.registrationToken.raw
//         }
//       };
//       return io.get(requestOptions);
//     })
//     .then((res: io.Response) => {
//       if (res.statusCode !== 200) {
//         return Bluebird.reject(new Incident("net", "Unable to fetch conversations"));
//       }
//       const body: ConversationsBody = JSON.parse(res.body);
//       return _.map(body.conversations, formatConversation);
//     });
// }
//
// export default getMessages;
