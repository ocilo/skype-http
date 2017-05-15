import {Incident} from "incident";
import * as _ from "lodash";
import {Contact} from "../interfaces/api/contact";
import {Conversation, ThreadProperties} from "../interfaces/api/conversation";
import { Contact as NativeContact, SearchContact as NativeSearchContact} from "../interfaces/native-api/contact";
import {  Conversation as NativeConversation, Thread as NativeThread,
  ThreadMember as NativeThreadMember,
} from "../interfaces/native-api/conversation";
import {sanitizeXml} from "./user-data-processor";

export function formatConversation (native: NativeConversation): Conversation {
  // TODO: parse id
  if (native.id.indexOf("19:") === 0) { // thread
    return native;
  } else { // private
    const contact: string = native.id;
    const result: Conversation = native;
    result.members = [contact];
    return result;
  }
}

export function formatThread (native: NativeThread): Conversation {
  const memberIds: string[] = _.map(native.members, ((member: NativeThreadMember): string => member.id));
  const properties: ThreadProperties = {};

  if ("properties" in native) {
    if ("topic" in native.properties) {
      properties.topic = native.properties.topic;
    }
    if ("lastjoinat" in native.properties) {
      properties.topic = native.properties.lastjoinat;
    }
    if ("version" in native.properties) {
      properties.topic = native.properties.version;
    }
  }

  return {
    threadProperties: properties,
    id: native.id,
    type: native.type,
    version: native.version,
    members: memberIds,
  };
}
export function formatSearchContact(native: NativeSearchContact): Contact {
  return searchContactToPerson(native);
}
export function formatContact (native: NativeContact): Contact {
  return contactToPerson(native);
}

// github:demurgos/skype-web-reversed -> jSkype/modelHelpers/contacts/dataMappers/agentToPerson.js
function agentToPerson (native: any): any {

}

// TODO: check that the uri uses the HTTPS protocol
function ensureHttps (uri: string) {
  return uri;
}

function define (...args: any[]) {
  return null;
}

function searchContactToPerson(native: NativeSearchContact): Contact {
  let avatarUrl: string | null;

  if (native.avatarUrl) {
    avatarUrl = ensureHttps(native.avatarUrl);
    // TODO: ensure that the "cacheHeaders=1" queryString is there
  } else {
    avatarUrl = null;
  }
  const displayName: string = sanitizeXml(native.displayname);
  const firstName: string | null = (native.firstname !== undefined) ? sanitizeXml(native.firstname) : null;
  const lastName: string | null =  (!native.lastname !== undefined) ? sanitizeXml(native.lastname) : null;

  const phoneNumbers: any[] = [];
  const locations: any[] = [];
  const type: string = "skype";
  const typeKey: string = contactTypeNameToContactTypeKey(type);
  let result: Contact;
  result = {
    id: {
      id: native.username,
      typeKey: typeKey,
      typeName: type,
      raw: `${typeKey}:${native.username}`,
    },
        emails: native.emails,
    avatarUrl: avatarUrl,
    phones: phoneNumbers,
    name: {
      first: firstName,
      surname: lastName,
      nickname: native.username,
      displayName: displayName,
    },
    activityMessage: native.mood,
    locations: locations,
  };
  return result;
}
// github:demurgos/skype-web-reversed -> jSkype/modelHelpers/contacts/dataMappers/contactToPerson.js
function contactToPerson (native: NativeContact): Contact {
  const SUGGESTED_CONTACT_ACTIVITY_MESSAGE: string = "Skype";

  // TODO(demurgos): typedef
  // tslint:disable-next-line:typedef
  const authorizationStates = {
    UNKNOWN: "UNKNOWN",
    UNAUTHORIZED: "UNAUTHORIZED",
    PENDING_OUTGOING: "PENDING_OUTGOING",
    PENDING_INCOMING: "PENDING_INCOMING",
    AUTHORIZED: "AUTHORIZED",
    SUGGESTED: "SUGGESTED",
  };

  // TODO(demurgos): typedef
  // tslint:disable-next-line:typedef
  const showStrategies = {
    ALL: "ALL",
    AVAILABLE_ONLY: "AVAILABLE_ONLY",
    AGENTS_ONLY: "AGENTS_ONLY",
  };

  let activityMessage: string | null;
  if (native.suggested === true) {
    activityMessage = SUGGESTED_CONTACT_ACTIVITY_MESSAGE;
  } else {
    activityMessage = native.mood === undefined ? null : native.mood;
  }

  let capabilities: string[];
  if (native.type === "agent") {
    capabilities = native.agent.capabilities;
  } else if (native.type === "pstn") {
    capabilities = ["audio.receive", "group.add"];
  } else {
    capabilities = [];
  }

  let authorizationState: string;
  if (native.authorized) {
    authorizationState = authorizationStates.AUTHORIZED;
  } else if (native.suggested) {
    authorizationState = authorizationStates.SUGGESTED;
  } else {
    authorizationState = authorizationStates.PENDING_OUTGOING;
  }

  const typeKey: string = contactTypeNameToContactTypeKey (native.type);
  const isAgent: boolean = native.type === "agent";

  let avatarUrl: string | null;

  if (native.avatar_url) {
    avatarUrl = ensureHttps(native.avatar_url);
    // TODO: ensure that the "cacheHeaders=1" queryString is there
  } else {
    avatarUrl = null;
  }

  const displayName: string = sanitizeXml(native.display_name);
  const firstName: string | null =
    (native.name && native.name.first !== undefined) ? sanitizeXml(native.name.first) : null;
  const lastName: string | null =
    (!native.name || native.name.surname === undefined) ? null : sanitizeXml(native.name.surname);

  const phoneNumbers: any[] = [];
  const locations: any[] = [];

  let result: Contact;
  result = {
    id: {
      id: native.id,
      typeKey: typeKey,
      typeName: native.type,
      raw: `${typeKey}:${native.id}`,
    },
    avatarUrl: avatarUrl,
    phones: phoneNumbers,
    name: {
      first: firstName,
    surname: lastName,
    nickname: native.id,
      displayName: displayName,
    },
    activityMessage: activityMessage,
    locations: locations,
  };
  return result;
}

// github:demurgos/skype-web-reversed -> jSkype/modelHelpers/contacts/dataMappers/dataMaps.js
function contactTypeNameToContactTypeKey (typeName: string) {
  switch (typeName) {
    case "msn": return "1";
    case "lync": return "2";
    case "pstn": return "4"; // Public switched telephone network
    case "skype": return "8";
    case "agent": return "28";
    default: throw new Incident (
      "unknown-contact-type-name",
      {typeName: typeName},
      `Unknwon contact type name ${typeName}`,
    );
  }
}

// github:demurgos/skype-web-reversed -> jSkype/modelHelpers/contacts/dataMappers/dataMaps.js
function contactTypeKeyToContactTypeName (typeKey: string) {
  switch (typeKey) {
    case "1": return "msn";
    case "2": return "lync";
    case "4": return "pstn"; // Public switched telephone network
    case "8": return "skype";
    case "28": return "agent";
    default: throw new Incident (
      "unknown-contact-type-key",
      {typeCode: typeKey},
      `Unknwon contact type key ${typeKey}`,
    );
  }
}

// github:demurgos/skype-web-reversed -> jSkype/modelHelpers/contacts/dataMappers/dataMaps.js
function phoneTypeNameToPhoneTypeKey (typeName: string) {
  switch (typeName) {
    case "Home": return "0";
    case "Work": return "1";
    case "Cell": return "2";
    case "Other": return "3";
    default: throw new Incident (
      "unknown-phone-type-name",
      {typeName: typeName},
      `Unknwon phone type name ${typeName}`,
    );
  }
}

// github:demurgos/skype-web-reversed -> jSkype/modelHelpers/contacts/dataMappers/dataMaps.js
function phoneTypeKeyToPhoneTypeName (typeKey: string) {
  switch (typeKey) {
    case "0": return "Home";
    case "1": return "Work";
    case "2": return "Cell";
    case "3": return "Other";
    default: throw new Incident (
      "unknown-phone-type-key",
      {typeCode: typeKey},
      `Unknwon phone type key ${typeKey}`,
    );
  }
}
