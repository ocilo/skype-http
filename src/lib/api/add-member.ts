import { Incident } from "incident";
import { Context } from "../interfaces/api/context";
import * as io from "../interfaces/http-io";
import * as messagesUri from "../messages-uri";

interface RequestBody {
  role: "User" | "Admin" | string;
}

export async function addMemberToConversation(
  io: io.HttpIo,
  apiContext: Context,
  memberId: string,
  converstionId: string,
  role = "User",
): Promise<void> {

  // `https://{host}}/v1/threads/${converstionId}/members/${memberId}`,
  const uri: string = messagesUri.member(apiContext.registrationToken.host, converstionId, memberId);

  const requestBody: RequestBody = { role };
  const requestOptions: io.PutOptions = {
    uri,
    cookies: apiContext.cookies,
    body: JSON.stringify(requestBody),
    headers: {
      "RegistrationToken": apiContext.registrationToken.raw,
      "Content-type": "application/json",
    },
  };

  const res: io.Response = await io.put(requestOptions);

  if (res.statusCode !== 200) {
    return Promise.reject(new Incident("add-member", "Received wrong return code"));
  }
}
