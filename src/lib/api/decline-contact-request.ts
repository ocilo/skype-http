import {Incident} from "incident";
import * as apiUri from "../api-uri";
import {Context} from "../interfaces/api/context";
import * as io from "../interfaces/http-io";

export async function declineContactRequest(
  io: io.HttpIo,
  apiContext: Context,
  contactUsername: string,
): Promise<void> {
  const requestOptions: io.GetOptions = {
    uri: apiUri.authRequestDecline(apiContext.username, contactUsername),
    cookies: apiContext.cookies,
    headers: {
      "X-Skypetoken": apiContext.skypeToken.value,
    },
  };
  const res: io.Response = await io.put(requestOptions);

  if (res.statusCode !== 201) {
    return Promise.reject(new Incident("net", "Failed to decline contact"));
  }
}

export default declineContactRequest;
