import * as Bluebird from "bluebird";
import {Incident} from "incident";
import * as apiUri from "../api-uri";
import {Contact} from "../interfaces/api/contact";
import {Context} from "../interfaces/api/context";
import * as io from "../interfaces/io";

export const VIRTUAL_CONTACTS: Set<string> = new Set(["concierge", "echo123"]);

export function getContact (io: io.HttpIo, apiContext: Context, contactId: string): Bluebird<Contact> {
  return Bluebird
    .try(() => {
      if (VIRTUAL_CONTACTS.has(contactId)) {
        // tslint:disable-next-line:max-line-length
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
