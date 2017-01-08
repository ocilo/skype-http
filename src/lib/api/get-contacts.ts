import * as Bluebird from "bluebird";
import {Incident} from "incident";
import * as _ from "lodash";
import * as contactsUri from "../contacts-uri";
import {Contact} from "../interfaces/api/contact";
import {Context} from "../interfaces/api/context";
import * as io from "../interfaces/io";
import {Contact as NativeContact} from "../interfaces/native-api/contact";
import {formatContact} from "../utils/formatters";

interface ContactsResponse {
  contacts: NativeContact[];
  count: number; // contacts.length
  scope: "full" | string; // an enum ?
}

export function getContacts(io: io.HttpIo, apiContext: Context): Bluebird<Contact[]> {
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
      const body: ContactsResponse = JSON.parse(res.body);
      return _.map(body.contacts, formatContact);
    });
}

export default getContacts;
