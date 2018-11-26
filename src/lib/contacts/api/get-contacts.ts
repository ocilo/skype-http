import { Incident } from "incident";
import { JsonReader } from "kryo/readers/json";
import { UnexpectedHttpStatusError } from "../../errors/http";
import { Context } from "../../interfaces/api/context";
import * as io from "../../interfaces/http-io";
import { Contact } from "../../types/contact";
import { Url } from "../../types/url";
import * as contactsUrl from "../contacts-url";
import { $GetUserResult, GetUserResult } from "./get-user";

export async function getContacts(httpIo: io.HttpIo, apiContext: Context): Promise<Contact[]> {
  // TODO: use the user contacts instead of just the user URL
  const url: Url = contactsUrl.formatUser(apiContext.username);
  const request: io.GetOptions = {
    uri: url,
    queryString: {page_size: "100", reason: "default"},
    cookies: apiContext.cookies,
    headers: {
      "X-Skypetoken": apiContext.skypeToken.value,
    },
  };
  const response: io.Response = await httpIo.get(request);
  if (response.statusCode !== 200) {
    UnexpectedHttpStatusError.create(response, new Set([200]), request);
  }
  let parsed: any;
  try {
    parsed = JSON.parse(response.body);
  } catch (err) {
    throw new Incident(err, "UnexpectedResponseBody", {body: response.body});
  }
  const reader: JsonReader = new JsonReader();
  let result: GetUserResult;
  try {

        if ($GetUserResult.read) {
          result = $GetUserResult.read(reader, response.body);
        } else {
          throw Error("read should always be defined");
        }
  } catch (err) {
    throw new Incident(err, "UnexpectedResult", {body: parsed});
  }
  return result.contacts;
}
