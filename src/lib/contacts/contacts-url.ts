import { Url } from "../types/url";

import path from "path";
import url from "url";

const CONTACTS_HOST: string = "contacts.skype.com";

export function formatInvites(userId: string): Url {
  return url.format({
    protocol: "https",
    host: CONTACTS_HOST,
    pathname: path.posix.join("contacts", "v2", "users", userId, "invites"),
  });
}

export function formatUser(userId: string): Url {
  return url.format({
    protocol: "https",
    host: CONTACTS_HOST,
    pathname: path.posix.join("contacts", "v2", "users", userId),
  });
}
