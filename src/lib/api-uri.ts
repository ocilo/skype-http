import {resolve as resolveUri} from "url";
import {posix} from "path";
import {SKYPEWEB_API_SKYPE_HOST} from "./consts";

export const DEFAULT_USER: string = "self";

function joinPath(parts: string[]): string {
  return posix.join.apply(null, parts);
}

// The following functions build an array of parts to build the path
function buildV1(): string[] {
  return ["contacts/v1"];
}

function buildUsers (): string[] {
  return ["users"];
}

function buildUser (username: string): string[] {
  return buildUsers().concat(username);
}

function buildContacts (username: string): string[] {
  return buildUser(username).concat("contacts");
}

function buildAuthRequest (username: string, contact: string): string[] {
  return buildContacts(username).concat("auth-request", contact);
}

function buildAuthRequestAccept (username: string, contact: string): string[] {
  return buildAuthRequest(username, contact).concat("accept");
}

function buildAuthRequestDecline (username: string, contact: string): string[] {
  return buildAuthRequest(username, contact).concat("decline");
}

function getOrigin (): string {
  return "https://" + SKYPEWEB_API_SKYPE_HOST;
}

function get(path: string) {
  return resolveUri(getOrigin(), path);
}

export function authRequestAccept (username: string, contact: string): string {
  return get(joinPath(buildAuthRequestAccept(username, contact)));
}

export function authRequestDecline (username: string, contact: string): string {
  return get(joinPath(buildAuthRequestDecline(username, contact)));
}
