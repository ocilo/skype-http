import {resolve as resolveUri} from "url";
import {posix} from "path";
import {SKYPEWEB_CONTACTS_HOST} from "./consts";

function joinPath(parts: string[]): string {
  return posix.join.apply(null, parts);
}

// The following functions build an array of parts to build the path
function buildV1(): string[] {
  return ["contacts/v1"];
}

function buildUsers (): string[] {
  return buildV1().concat("users");
}

function buildUser (username: string): string[] {
  return buildUsers().concat(username);
}

function buildContacts (username: string): string[] {
  return buildUser(username).concat("contacts");
}

function getOrigin (): string {
  return "https://" + SKYPEWEB_CONTACTS_HOST;
}

function get(path: string) {
  return resolveUri(getOrigin(), path);
}

// https://contacts.skype.com/contacts/v1/users/{username}/contacts
export function contacts (username: string): string {
  return get(joinPath(buildContacts(username)));
}
