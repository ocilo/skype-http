import {resolve as resolveUri} from "url";
import {posix} from "path";

const DEFAULT_USER = "ME";
const DEFAULT_ENDPOINT = "SELF";

function joinPath(parts: string[]): string {
  return posix.join.apply(null, parts);
}

// The following functions build an array of parts to build the path
function buildV1(): string[] {
  return ["v1"];
}

function buildUsers(): string[] {
  return buildV1().concat("users");
}

function buildUser (userId: string = DEFAULT_USER): string[] {
  return buildUsers().concat(userId);
}

function buildEndpoints (userId: string = DEFAULT_USER): string[] {
  return buildUser(userId).concat("endpoints");
}

function buildEndpoint (userId: string = DEFAULT_USER, endpointId: string = DEFAULT_ENDPOINT): string[] {
  return buildEndpoints(userId).concat(endpointId);
}

export function buildSubscriptions (userId: string = DEFAULT_USER, endpointId: string = DEFAULT_ENDPOINT): string[] {
  return buildEndpoint(userId, endpointId).concat("subscriptions");
}

/**
 * Returns an URI origin like: "https://host.com"
 * If host is `null`, returns an empty string
 */
function getOrigin (host: string): string {
  return host === null ? "": "https://" + host;
}

function get(host: string, path: string) {
  return resolveUri(getOrigin(host), path);
}

export function users (host: string): string {
  return get(host, joinPath(buildUsers()));
}

export function user (host: string, userId: string = DEFAULT_USER): string {
  return get(host, joinPath(buildUser(userId)));
}

export function endpoints (host: string, userId: string = DEFAULT_USER): string {
  return get(host, joinPath(buildEndpoints(userId)));
}

export function endpoint (host: string, userId: string = DEFAULT_USER, endpointId: string = DEFAULT_ENDPOINT): string {
  return get(host, joinPath(buildEndpoint(userId, endpointId)));
}

/**
 * Returns https://{host}/v1/users/{userId}/endpoints/{endpointId}/subscriptions
 * @param host
 * @param userId
 * @param endpointId
 */
export function subscriptions (host: string, userId: string = DEFAULT_USER, endpointId: string = DEFAULT_ENDPOINT): string {
  return get(host, joinPath(buildSubscriptions(userId, endpointId)));
}
