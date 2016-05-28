import * as Bluebird from "bluebird";
import {Incident} from "incident";

import * as api from "../interfaces/api/api";
import {Context} from "../interfaces/api/context";
import * as io from "../interfaces/io";
import * as messagesUri from "../messages-uri";

interface RequestBody {
  status: string;
}

export function setStatus (io: io.IO, apiContext: Context, status: api.Status): Bluebird<any> {
  return Bluebird
    .try(() => {
      let requestBody: RequestBody = {
        status: status
      };
      let requestOptions: io.PostOptions = {
        uri: messagesUri.userMessagingService(apiContext.registrationToken.host),
        jar: apiContext.cookieJar,
        body: JSON.stringify(requestBody),
        headers: {
          "RegistrationToken": apiContext.registrationToken.raw
        }
      };
      return io.put(requestOptions);
    })
    .then((res: io.Response) => {
      if (res.statusCode !== 200) {
        return Bluebird.reject(new Incident("send-message", "Received wrong return code"));
      }
    });
}

export default setStatus;
