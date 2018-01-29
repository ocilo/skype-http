import { Incident } from "incident";
import { UnexpectedHttpStatusError } from "../errors/http";
import { Context } from "../interfaces/api/context";
import * as io from "../interfaces/http-io";
import { JSON_READER } from "../json-reader";
import { MriKey } from "../mri";
import { Contact } from "../types/contact";
import { Invite } from "../types/invite";
import { Url } from "../types/url";
import { getContacts } from "./api/get-contacts";
import { $GetInvitesResult, GetInvitesResult } from "./api/get-invites";
import * as contactsUrl from "./contacts-url";

export interface ContactServiceInterface {
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

  getContactById(apiContext: Context, contactId: MriKey): Promise<Contact>;
}

/**
 * @internal
 */
export class ContactService implements ContactServiceInterface {

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
    let result: GetInvitesResult;
    try {
      result = $GetInvitesResult.read(JSON_READER, response.body);
    } catch (err) {
      throw new Incident(err, "UnexpectedResponseBody", {body: response.body});
    }
    return result.inviteList;
  }

  async getContacts(apiContext: Context): Promise<Contact[]> {
    return getContacts(this.httpIo, apiContext);
  }

  async getContactById(apiContext: Context, contactId: MriKey): Promise<Contact> {
    throw new Incident("NotImplemented", "getContactById");
  }
}
