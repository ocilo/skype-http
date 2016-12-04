import * as _ from "lodash";
import {Conversation, ThreadProperties} from "../interfaces/api/conversation";
import {Conversation as NativeConversation, Thread as NativeThread} from "../interfaces/native-api/conversation";
import {Contact} from "../interfaces/api/contact";
import {Contact as NativeContact} from "../interfaces/native-api/contact";
import {Incident} from "incident";
import {sanitizeXml, sanitize} from "./user-data-processor";

export function formatConversation (native: NativeConversation): Conversation {
  if (native.id.indexOf("19:") === 0) { // thread
    return native;
  } else { // private
    let contact = native.id;
    let result = <Conversation> native;
    result.members = [contact];
    return result;
  }
}

export function formatThread (native: NativeThread): Conversation {
  let members = _.map(native.members, (member => member.id));
  let properties: ThreadProperties = {};

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

  let result: Conversation = {
    threadProperties: properties,
    id: native.id,
    type: native.type,
    version: native.version,
    members: members
  };

  return result;
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

// github:demurgos/skype-web-reversed -> jSkype/modelHelpers/contacts/dataMappers/contactToPerson.js
function contactToPerson (native: NativeContact): Contact {
  const SUGGESTED_CONTACT_ACTIVITY_MESSAGE = "Skype";
  const authorizationStates = {
    UNKNOWN: "UNKNOWN",
    UNAUTHORIZED: "UNAUTHORIZED",
    PENDING_OUTGOING: "PENDING_OUTGOING",
    PENDING_INCOMING: "PENDING_INCOMING",
    AUTHORIZED: "AUTHORIZED",
    SUGGESTED: "SUGGESTED"
  };
  const showStrategies = {
    ALL: "ALL",
    AVAILABLE_ONLY: "AVAILABLE_ONLY",
    AGENTS_ONLY: "AGENTS_ONLY"
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

  let typeKey: string = contactTypeNameToContactTypeKey (native.type);
  let isAgent = native.type === "agent";

  let avatarUrl: string | null;

  if (native.avatar_url) {
    avatarUrl = ensureHttps(native.avatar_url);
    // TODO: ensure that the "cacheHeaders=1" queryString is there
  } else {
    avatarUrl = null;
  }

  let displayName = sanitizeXml(native.display_name);
  let firstName = sanitizeXml(native.name.first);
  let lastName: string | null = native.name.surname === undefined ? null : sanitizeXml(native.name.surname);

  let phoneNumbers: any[] = [];
  let locations: any[] = [];

  let result: Contact;
  result = {
    id: {
      id: native.id,
      typeKey: typeKey,
      typeName: native.type,
      raw: `${typeKey}:${native.id}`
    },
    avatarUrl: avatarUrl,
    phones: phoneNumbers,
    name: {
      first: firstName,
      surname: "",
      nickname: native.id
    },
    activityMessage: activityMessage,
    locations: locations
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
    default: throw new Incident ("unknown-contact-type-name", {typeName: typeName}, `Unknwon contact type name ${typeName}`);
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
    default: throw new Incident ("unknown-contact-type-key", {typeCode: typeKey}, `Unknwon contact type key ${typeKey}`);
  }
}

// github:demurgos/skype-web-reversed -> jSkype/modelHelpers/contacts/dataMappers/dataMaps.js
function phoneTypeNameToPhoneTypeKey (typeName: string) {
  switch (typeName) {
    case "Home": return "0";
    case "Work": return "1";
    case "Cell": return "2";
    case "Other": return "3";
    default: throw new Incident ("unknown-phone-type-name", {typeName: typeName}, `Unknwon phone type name ${typeName}`);
  }
}

// github:demurgos/skype-web-reversed -> jSkype/modelHelpers/contacts/dataMappers/dataMaps.js
function phoneTypeKeyToPhoneTypeName (typeKey: string) {
  switch (typeKey) {
    case "0": return "Home";
    case "1": return "Work";
    case "2": return "Cell";
    case "3": return "Other";
    default: throw new Incident ("unknown-phone-type-key", {typeCode: typeKey}, `Unknwon phone type key ${typeKey}`);
  }
}
