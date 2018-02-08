import { Incident } from "incident";
import { CaseStyle } from "kryo/case-style";
import { AnyType } from "kryo/types/any";
import { ArrayType } from "kryo/types/array";
import { DocumentIoType, DocumentType } from "kryo/types/document";
import { Ucs2StringType } from "kryo/types/ucs2-string";
import { UnexpectedHttpStatusError } from "../../errors/http";
import { Context } from "../../interfaces/api/context";
import * as io from "../../interfaces/http-io";
import { JSON_READER } from "../../json-reader";
import { $Contact, Contact } from "../../types/contact";
import { $ContactGroup, ContactGroup } from "../../types/contact-group";
import { Url } from "../../types/url";
import * as contactsUrl from "../contacts-url";

/**
 * @internal
 */
export interface GetUserResult {
  contacts: Contact[];
  // TODO(demurgos): Rename to `blockList`?
  // {mri: MriKey}[]
  blocklist: any[];
  groups: ContactGroup[];
  /**
   * `"full" | ...`
   */
  scope: string;
}

/**
 * @internal
 */
export const $GetUserResult: DocumentIoType<GetUserResult> = new DocumentType<GetUserResult>({
  properties: {
    contacts: {type: new ArrayType({itemType: $Contact, maxLength: Infinity})},
    blocklist: {type: new ArrayType({itemType: new AnyType(), maxLength: Infinity})},
    groups: {type: new ArrayType({itemType: $ContactGroup, maxLength: Infinity})},
    scope: {type: new Ucs2StringType({maxLength: Infinity})},
  },
  changeCase: CaseStyle.SnakeCase,
});

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
    throw UnexpectedHttpStatusError.create(response, new Set([200]), request);
  }
  let result: GetUserResult;
  try {
    result = $GetUserResult.read(JSON_READER, response.body);
  } catch (err) {
    throw new Incident(err, "UnexpectedResponseBody", {body: response.body});
  }
  return result.contacts;
}
