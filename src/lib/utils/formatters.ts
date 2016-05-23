import * as api from "../interfaces/api";
import * as nativeApi from "../interfaces/native-api";

export function formatConversation (native: nativeApi.Conversation): api.Conversation {
  return native;
}
