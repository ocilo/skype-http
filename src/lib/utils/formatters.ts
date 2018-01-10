import { Incident } from "incident";
import _ from "lodash";
import { Contact } from "../interfaces/api/contact";
import { Conversation, ThreadProperties } from "../interfaces/api/conversation";
import { Contact as NativeContact, SearchContact as NativeSearchContact } from "../interfaces/native-api/contact";
import {
  Conversation as NativeConversation, Thread as NativeThread,
  ThreadMember as NativeThreadMember,
} from "../interfaces/native-api/conversation";
import { MriType, MriTypeCode, mriTypeFromTypeName, MriTypeName, mriTypeToTypeCode, mriTypeToTypeName } from "../mri";
import { sanitizeXml } from "./user-data-processor";

export function formatConversation(native: NativeConversation): Conversation {
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

export function formatThread(native: NativeThread): Conversation {
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

export function formatContact(native: NativeContact): Contact {
  return contactToPerson(native);
}

// github:demurgos/skype-web-reversed -> jSkype/modelHelpers/contacts/dataMappers/agentToPerson.js
function agentToPerson(native: any): any {

}

// TODO: check that the uri uses the HTTPS protocol
function ensureHttps(uri: string) {
  return uri;
}

function define(...args: any[]) {
  return null;
}

function searchContactToPerson(native: NativeSearchContact): Contact {
  let avatarUrl: string | null;

  if (typeof native.avatarUrl === "string") {
    avatarUrl = ensureHttps(native.avatarUrl);
    // TODO: ensure that the "cacheHeaders=1" queryString is there
  } else {
    avatarUrl = null;
  }
  const displayName: string = sanitizeXml(native.displayname);
  const firstName: string | null = (native.firstname !== undefined) ? sanitizeXml(native.firstname) : null;
  const lastName: string | null = (native.lastname !== undefined) ? sanitizeXml(native.lastname) : null;

  const phoneNumbers: any[] = [];
  const locations: any[] = [];
  const type: MriType = MriType.Skype;
  const typeKey: MriTypeCode = mriTypeToTypeCode(type);
  let result: Contact;
  result = {
    id: {
      id: native.username,
      typeKey,
      typeName: mriTypeToTypeName(type),
      raw: `${typeKey}:${native.username}`,
    },
    emails: native.emails,
    avatarUrl,
    phones: phoneNumbers,
    name: {
      first: firstName,
      surname: lastName,
      nickname: native.username,
      displayName,
    },
    activityMessage: native.mood,
    locations,
  };
  return result;
}

// github:demurgos/skype-web-reversed -> jSkype/modelHelpers/contacts/dataMappers/contactToPerson.js
function contactToPerson(native: NativeContact): Contact {
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
  if (native.suggested) {
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

  // We can safely cast here because `mriTypeFromTypeName` tests the validity of the name.
  const type: MriType = mriTypeFromTypeName(native.type as MriTypeName);
  const typeKey: MriTypeCode = mriTypeToTypeCode(type);
  const isAgent: boolean = native.type === "agent";

  let avatarUrl: string | null;

  if (typeof native.avatar_url === "string") {
    avatarUrl = ensureHttps(native.avatar_url);
    // TODO: ensure that the "cacheHeaders=1" queryString is there
  } else {
    avatarUrl = null;
  }

  const displayName: string = sanitizeXml(native.display_name);
  let firstName: string | null = null;
  let lastName: string | null = null;
  if (native.name !== undefined && native.name.first !== undefined) {
    firstName = sanitizeXml(native.name.first);
  }
  if (native.name !== undefined && native.name.surname !== undefined) {
    lastName = sanitizeXml(native.name.surname);
  }

  const phoneNumbers: any[] = [];
  const locations: any[] = [];

  let result: Contact;
  result = {
    id: {
      id: native.id,
      typeKey,
      typeName: native.type,
      raw: `${typeKey}:${native.id}`,
    },
    avatarUrl,
    phones: phoneNumbers,
    name: {
      first: firstName,
      surname: lastName,
      nickname: native.id,
      displayName,
    },
    activityMessage,
    locations,
  };
  return result;
}

// github:demurgos/skype-web-reversed -> jSkype/modelHelpers/contacts/dataMappers/dataMaps.js
function phoneTypeNameToPhoneTypeKey(typeName: string) {
  switch (typeName) {
    case "Home":
      return "0";
    case "Work":
      return "1";
    case "Cell":
      return "2";
    case "Other":
      return "3";
    default:
      throw new Incident(
        "unknown-phone-type-name",
        {typeName},
        `Unknwon phone type name ${typeName}`,
      );
  }
}

// github:demurgos/skype-web-reversed -> jSkype/modelHelpers/contacts/dataMappers/dataMaps.js
function phoneTypeKeyToPhoneTypeName(typeKey: string) {
  switch (typeKey) {
    case "0":
      return "Home";
    case "1":
      return "Work";
    case "2":
      return "Cell";
    case "3":
      return "Other";
    default:
      throw new Incident(
        "unknown-phone-type-key",
        {typeCode: typeKey},
        `Unknwon phone type key ${typeKey}`,
      );
  }
}
