import {Incident} from "incident";
import * as _ from "lodash";
import * as contactsUri from "../contacts-uri";
import {Contact} from "../interfaces/api/contact";
import {Context} from "../interfaces/api/context";
import * as io from "../interfaces/http-io";
import {Contact as NativeContact} from "../interfaces/native-api/contact";
import {formatContact} from "../utils/formatters";
interface ContactsResponse {
  contacts: NativeContact[];
  count: number; // contacts.length
  scope: "full" | string; // an enum ?
}

export async function getContacts(io: io.HttpIo, apiContext: Context): Promise<Contact[]> {
  const requestOptions: io.GetOptions = {
    uri: contactsUri.contacts(apiContext.username),
    cookies: apiContext.cookies,
    headers: {
      "X-Skypetoken": apiContext.skypeToken.value,
    },
  };
  const res: io.Response = await io.get(requestOptions);

  if (res.statusCode !== 200) {
    return Promise.reject(new Incident("net", "Unable to fetch contacts"));
  }
  const body: ContactsResponse = JSON.parse(res.body);
  return _.map(body.contacts, formatContact);
}

export default getContacts;
