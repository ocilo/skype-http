import * as Bluebird from "bluebird";
import Incident from "incident";

import * as io from "../interfaces/io";
import {Contact} from "../interfaces/api";
import {ApiContext} from "../interfaces/api-context";
import * as contactsUri from "../contacts-uri";

interface ContactsBody {
  contacts: Contact[],
  count: number; // contacts.length
  scope: "full" | string; // an enum ?
}

export function getContacts(io: io.IO, apiContext: ApiContext): Bluebird<Contact[]> {
  return Bluebird
    .try(() => {
      const requestOptions: io.GetOptions = {
        uri: contactsUri.contacts(apiContext.username),
        jar: apiContext.cookieJar,
        headers: {
          "X-Skypetoken": apiContext.skypeToken.value
        }
      };
      return io.get(requestOptions);
    })
    .then((res: io.Response) => {
      if (res.statusCode !== 200) {
        return Bluebird.reject(new Incident("net", "Unable to fetch contacts"));
      }
      const body: ContactsBody = JSON.parse(res.body);
      return body.contacts;
    })
}

export default getContacts;
