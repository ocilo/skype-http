import { Incident } from "incident";
import { JsonReader } from "kryo/readers/json";
import { UnexpectedHttpStatusError } from "../errors/http";
import { Context } from "../interfaces/api/context";
import * as io from "../interfaces/http-io";
import { Contact } from "../types/contact";
import { Invite } from "../types/invite";
import { Url } from "../types/url";
import { getContacts } from "./api/get-contacts";
import { $GetInvitesResult, GetInvitesResult } from "./api/get-invites";
import * as contactsUrl from "./contacts-url";
export interface ContactsInterface {
  /**
   * Get the pending incoming contact invitations.
   *
   * @param apiContext Current API context: with the skype token, cookies and username
   * @return The list of currently pending incoming contact invitations.
   */
  getInvites(apiContext: Context): Promise<Invite[]>;

  /**
   * Get the contacts of the current user.
   *
   * @param apiContext Current API context: with the skype token, cookies and username
   * @return The list of contacts.
   */
  getContacts(apiContext: Context): Promise<Contact[]>;
}

/**
 * @internal
 */
export class ContactsService {
  private readonly httpIo: io.HttpIo;

  constructor(httpIo: io.HttpIo) {
    this.httpIo = httpIo;
  }

  async getInvites(apiContext: Context): Promise<Invite[]> {
    const url: Url = contactsUrl.formatInvites(apiContext.username);
    const request: io.GetOptions = {
      uri: url,
      cookies: apiContext.cookies,
      headers: {
        "X-Skypetoken": apiContext.skypeToken.value,
      },
    };
    const response: io.Response = await this.httpIo.get(request);
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
    let result: GetInvitesResult;
    try {
        if ($GetInvitesResult.read) {
          result = $GetInvitesResult.read(reader, response.body);
        } else {
          throw Error("read should always be defined");
        }
    } catch (err) {
      throw new Incident(err, "UnexpectedResult", {body: parsed});
    }
    return result.inviteList;
  }

  async getContacts(apiContext: Context): Promise<Contact[]> {
    return getContacts(this.httpIo, apiContext);
  }
}
