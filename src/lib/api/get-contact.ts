import * as Bluebird from "bluebird";
import {Incident} from "incident";

import * as io from "../interfaces/io";
import {Contact} from "../interfaces/api/contact";
import {Context} from "../interfaces/api/context";
import * as contactsUri from "../contacts-uri";

export function getContact (io: io.IO, apiContext: Context, contactId: string): Bluebird<Contact> {
  return Bluebird
    .try(() => {
      console.log(contactId);
      const requestOptions: io.GetOptions = {
        uri: contactsUri.contact(apiContext.username, contactId),
        jar: apiContext.cookieJar,
        headers: {
          "X-Skypetoken": apiContext.skypeToken.value
        }
      };
      return io.get(requestOptions);
    })
    .then((res: io.Response) => {
      console.log(res);
      if (res.statusCode !== 200) {
        return Bluebird.reject(new Incident("net", "Unable to fetch contact"));
      }
      const body: Contact = JSON.parse(res.body);
      return body;
    });
}

export default getContact;
