import * as _ from "lodash";
import * as api from "../interfaces/api";
import * as nativeApi from "../interfaces/native-api";

export function formatConversation (native: nativeApi.Conversation): api.Conversation {
  if (native.id.indexOf("19:") === 0) { // thread
    return native;
  } else { // private
    let contact = native.id;
    let result = <api.Conversation> native;
    result.members = [contact];
    return result;
  }
}

export function formatThread (native: nativeApi.Thread): api.Conversation {
  let members = _.map(native.members, (member => member.id));
  let properties: api.ThreadProperties = {};

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

  let result: api.Conversation = {
    threadProperties: properties,
    id: native.id,
    type: native.type,
    version: native.version,
    members: members
  };

  return result;
}
