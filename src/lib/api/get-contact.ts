import * as Bluebird from "bluebird";
import {Incident} from "incident";

import * as io from "../interfaces/io";
import {Contact} from "../interfaces/api/contact";
import {Context} from "../interfaces/api/context";
import * as apiUri from "../api-uri";
import * as contactsUri from "../contacts-uri";

export const virtualContacts: Set<string> = new Set(["concierge", "echo123"]);

export function getContact (io: io.HttpIo, apiContext: Context, contactId: string): Bluebird<Contact> {
  return Bluebird
    .try(() => {
      if (virtualContacts.has(contactId)) {
        throw new Error(`${JSON.stringify(contactId)} is not a real contact, you cannot get data for ${JSON.stringify(contactId)}`);
      }
      // concierge
      console.log(`Getting contact: ${contactId}`);
      const requestOptions: io.GetOptions = {
        uri: apiUri.userProfile(contactId),
        jar: apiContext.cookieJar,
        headers: {
          "X-Skypetoken": apiContext.skypeToken.value
        }
      };
      return io.get(requestOptions);
    })
    .then((res: io.Response) => {
      console.log(`Response for contact ${JSON.stringify(contactId)}:`);
      console.log(res);
      if (res.statusCode !== 200) {
        return Bluebird.reject(new Incident("net", "Unable to fetch contact"));
      }
      const body: Contact = JSON.parse(res.body);
      return body;
    });
}

export default getContact;
