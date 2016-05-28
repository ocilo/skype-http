import * as _ from "lodash";
import {Conversation, ThreadProperties} from "../interfaces/api/conversation";
import {Conversation as NativeConversation, Thread as NativeThread} from "../interfaces/native-api/conversation";

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
