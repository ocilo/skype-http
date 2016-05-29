import {resolve as resolveUri} from "url";
import {posix} from "path";

function joinPath(parts: string[]): string {
  return posix.join.apply(null, parts);
}

const CONTACTS_HOST: string = "contacts.skype.com";

// The following functions build an array of parts to build the path

// /contacts/v1
function buildV1(): string[] {
  return ["contacts/v1"];
}

// /contacts/v1/users
function buildUsers (): string[] {
  return buildV1().concat("users");
}

// /contacts/v1/users/:user
function buildUser (username: string): string[] {
  return buildUsers().concat(username);
}

// /contacts/v1/users/:user/contacts
function buildContacts (username: string): string[] {
  return buildUser(username).concat("contacts");
}

// /contacts/v1/users/:user/contacts/profiles
function buildContactProfiles (username: string): string[] {
  return buildContacts(username).concat("profiles");
}

// /contacts/v1/users/:user/contacts/:contactType
function buildContactsType (username: string, contactType: string): string[] {
  return buildContacts(username).concat(contactType);
}

// /contacts/v1/users/:user/contacts/:contactType/:contactId
function buildContact (username: string, contactType: string, contactId: string): string[] {
  return buildContactsType(username, contactType).concat(contactId);
}

// /contacts/v1/users/:user/contacts/:contactType/:contactId/block
function buildContactBlock (username: string, contactType: string, contactId: string): string[] {
  return buildContact(username, contactType, contactId).concat("block");
}

// /contacts/v1/users/:user/contacts/:contactType/:contactId/unblock
function buildContactUnlock (username: string, contactType: string, contactId: string): string[] {
  return buildContact(username, contactType, contactId).concat("unblock");
}

// /contacts/v1/users/:user/profile
function buildProfile (username: string): string[] {
  return buildUser(username).concat("profile");
}

// TODO (from skype-web-reversed):
// myContactsEndpoint: "contacts/${version}/users/${id}/contacts?$filter=type eq 'skype' or type eq 'msn' or type eq 'pstn' or type eq 'agent' or type eq 'lync'&reason=${reason}",
// myDeltaContactsEndpoint: "contacts/${version}/users/${id}/contacts?delta&$filter=type eq 'skype' or type eq 'msn' or type eq 'pstn' or type eq 'agent' or type eq 'lync'&reason=${reason}",

function getOrigin (): string {
  return "https://" + CONTACTS_HOST;
}

function get(path: string) {
  return resolveUri(getOrigin(), path);
}

// https://contacts.skype.com/contacts/v1/users/:username/contacts
export function contacts (username: string): string {
  return get(joinPath(buildContacts(username)));
}

// https://contacts.skype.com/contacts/v1/users/:username/contacts/profiles
export function contactProfiles (username: string): string {
  return get(joinPath(buildContactProfiles(username)));
}

// https://contacts.skype.com/contacts/v1/users/:username/contacts/:contactType/:contactId
export function contact (username: string, contactType: "skype" | "msn" | "pstn" | "agent" | "lync" | string, contact: string): string {
  return get(joinPath(buildContact(username, contactType, contact)));
}
