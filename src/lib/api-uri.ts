import {resolve as resolveUri} from "url";
import {posix} from "path";
import {SKYPEWEB_API_SKYPE_HOST} from "./consts";

export const DEFAULT_USER: string = "self";

function joinPath(parts: string[]): string {
  return posix.join.apply(null, parts);
}

// The following functions build an array of parts to build the path

// /contacts/v1
function buildV1(): string[] {
  return ["contacts/v1"];
}

// /users
function buildUsers (): string[] {
  return ["users"];
}

// /users/:user
function buildUser (username: string): string[] {
  return buildUsers().concat(username);
}

// /users/:user/contacts
function buildContacts (username: string): string[] {
  return buildUser(username).concat("contacts");
}

// /users/:user/contacts/auth-request/:contact
function buildAuthRequest (username: string, contact: string): string[] {
  return buildContacts(username).concat("auth-request", contact);
}

// /users/:user/contacts/auth-request/:contact/accept
function buildAuthRequestAccept (username: string, contact: string): string[] {
  return buildAuthRequest(username, contact).concat("accept");
}

// /users/:user/contacts/auth-request/:contact/decline
function buildAuthRequestDecline (username: string, contact: string): string[] {
  return buildAuthRequest(username, contact).concat("decline");
}

// /users/:user/displayname
function buildDisplayName (username: string): string[] {
  return buildUser(username).concat("displayname");
}

// /users/:user/profile
function buildProfile (username: string): string[] {
  return buildUser(username).concat("profile");
}

function getOrigin (): string {
  return "https://" + SKYPEWEB_API_SKYPE_HOST;
}

function get(path: string) {
  return resolveUri(getOrigin(), path);
}

export function displayName (username: string): string {
  return get(joinPath(buildDisplayName(username)));
}

export function userProfile (username: string): string {
  return get(joinPath(buildProfile(username)));
}

export function authRequestAccept (username: string, contact: string): string {
  return get(joinPath(buildAuthRequestAccept(username, contact)));
}

export function authRequestDecline (username: string, contact: string): string {
  return get(joinPath(buildAuthRequestDecline(username, contact)));
}
