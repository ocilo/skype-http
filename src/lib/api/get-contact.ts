import {Incident} from "incident";
import * as apiUri from "../api-uri";
import {Contact} from "../interfaces/api/contact";
import {Context} from "../interfaces/api/context";
import * as io from "../interfaces/io";

export const VIRTUAL_CONTACTS: Set<string> = new Set(["concierge", "echo123"]);

export async function getContact(io: io.HttpIo, apiContext: Context, contactId: string): Promise<Contact> {
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
      "X-Skypetoken": apiContext.skypeToken.value,
    },
  };
  const res: io.Response = await io.get(requestOptions);

  console.log(`Response for contact ${JSON.stringify(contactId)}:`);
  console.log(res);
  if (res.statusCode !== 200) {
    return Promise.reject(new Incident("net", "Unable to fetch contact"));
  }
  const body: Contact = JSON.parse(res.body);
  return body;
}

export default getContact;
