import {resolve as resolveUri, parse as parseUri} from "url";
import {posix} from "path";
import Incident from "incident";

export const DEFAULT_USER: string = "ME";
export const DEFAULT_ENDPOINT: string = "SELF";

const CONVERSATION_PATTERN = /^\/v1\/users\/([^/]+)\/conversations\/([^/]+)$/;
const CONTACT_PATTERN = /^\/v1\/users\/([^/]+)\/contacts\/([^/]+)$/;
const MESSAGES_PATTERN = /^\/v1\/users\/([^/]+)\/conversations\/([^/]+)\/messages$/;

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

function buildUser (userId: string): string[] {
  return buildUsers().concat(userId);
}

function buildEndpoints (userId: string): string[] {
  return buildUser(userId).concat("endpoints");
}

function buildEndpoint (userId: string, endpointId: string): string[] {
  return buildEndpoints(userId).concat(endpointId);
}

function buildSubscriptions (userId: string, endpointId: string): string[] {
  return buildEndpoint(userId, endpointId).concat("subscriptions");
}

function buildSubscription (userId: string, endpointId: string, subscriptionId: number): string[] {
  return buildSubscriptions(userId, endpointId).concat(String(subscriptionId));
}

function buildPoll (userId: string, endpointId: string, subscriptionId: number): string[] {
  return buildSubscription(userId, endpointId, subscriptionId).concat("poll");
}

function buildConversations (userId: string): string[] {
  return buildUser(userId).concat("conversations");
}

function buildConversation (userId: string, conversationId: string): string[] {
  return buildConversations(userId).concat(conversationId);
}

function buildMessages (userId: string, conversationId: string): string[] {
  return buildConversation(userId, conversationId).concat("messages");
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

export function poll (host: string, userId: string = DEFAULT_USER, endpointId: string = DEFAULT_ENDPOINT, subscriptionId: number = 0): string {
  return get(host, joinPath(buildPoll(userId, endpointId, subscriptionId)));
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

/**
 * Returns https://{host}/v1/users/{userId}/conversations/{conversationId}/messages
 * @param host
 * @param userId
 * @param conversationId
 */
export function messages (host: string, userId: string, conversationId: string): string {
  return get(host, joinPath(buildMessages(userId, conversationId)));
}

export interface ContactUri {
  host: string;
  user: string;
  contact: string;
}

export function parseContact (uri: string): ContactUri {
  const parsed = parseUri(uri);
  const match = CONTACT_PATTERN.exec(parsed.pathname);
  if (match === null) {
    throw new Incident("parse-error", "Expected URI to be a conversation uri");
  }
  return {
    host: parsed.host,
    user: match[1],
    contact: match[2]
  };
}

export interface ConversationUri {
  host: string;
  user: string;
  conversation: string;
}

export function parseConversation (uri: string): ConversationUri {
  const parsed = parseUri(uri);
  const match = CONVERSATION_PATTERN.exec(parsed.pathname);
  if (match === null) {
    throw new Incident("parse-error", "Expected URI to be a conversation uri");
  }
  return {
    host: parsed.host,
    user: match[1],
    conversation: match[2]
  };
}
