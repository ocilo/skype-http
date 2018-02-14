import { Incident } from "incident";
import { Context } from "../interfaces/api/context";
import * as io from "../interfaces/http-io";
import { AllUsers, Members } from "../interfaces/native-api/conversation";
import * as messagesUri from "../messages-uri";
import { getMembers } from "../utils";

interface RequestBody {
  members: any[];
}

export async function createConversation(
  io: io.HttpIo,
  apiContext: Context,
  allUsers: AllUsers,
): Promise<any> {

  // Each member object consists of an ``id`` (user thread identifier), and role (either ``Admin`` or ``User``).
  const members: Members[] = getMembers(allUsers);
  const requestBody: RequestBody = {
    members,
  };

  const uri: string = messagesUri.threads(apiContext.registrationToken.host);

  const requestOptions: io.PostOptions = {
    uri,
    cookies: apiContext.cookies,
    body: JSON.stringify(requestBody),
    headers: {
      RegistrationToken: apiContext.registrationToken.raw,
      Location: "/",
    },
  };

  const res: io.Response = await io.post(requestOptions);

  if (res.statusCode !== 201) {
    throw new Incident("create-conversation", "Received wrong return code");
  }

  const location: string | undefined = res.headers.location;
  if (location === undefined) {
    throw new Incident("create-conversation", "Missing `Location` response header");
  }
  // TODO: Parse URL properly / more reliable checks
  const id: string | undefined = location.split("/").pop();
  if (id === undefined) {
    throw new Incident("create-conversation", "Unable to read conversation ID");
  }
  // conversation ID
  return id;
}
