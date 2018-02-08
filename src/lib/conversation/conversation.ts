import { Context } from "../interfaces/api/context";
import * as io from "../interfaces/http-io";
import { MriKey } from "../mri";
import { Conversation } from "../types/conversation";
import { getConversationById } from "./api/get-conversation-by-id";
import { getConversations } from "./api/get-conversations";

export interface ConversationServiceInterface {

  /**
   * Get the conversations of the current user.
   *
   * @param apiContext Current API context: with the skype token, cookies and username
   * @return The list of conversations.
   */
  getConversations(apiContext: Context): Promise<Conversation[]>;

  /**
   * Get a conversation by its id (MRI key)
   *
   * @param {Context} apiContext
   * @param conversationId For private conversations: id of the contact, otherwise thread id.
   *                       Examples:
   *                       - `"8:bob"`
   *                       - `"19:4dd7fb8cb8714b2c44a6467abe15effa@thread.skype"`
   * @return {Promise<Conversation>}
   */
  getConversationById(apiContext: Context, conversationId: MriKey): Promise<Conversation>;
}

/**
 * @internal
 */
export class ConversationService implements ConversationServiceInterface {
  private readonly httpIo: io.HttpIo;

  constructor(httpIo: io.HttpIo) {
    this.httpIo = httpIo;
  }

  /**
   * Get the conversations of the current user.
   *
   * @param apiContext Current API context: with the skype token, cookies and username
   * @return The list of conversations.
   */
  async getConversations(apiContext: Context): Promise<Conversation[]> {
    return getConversations(this.httpIo, apiContext);
  }

  async getConversationById(apiContext: Context, conversationId: MriKey): Promise<Conversation> {
    return getConversationById(this.httpIo, apiContext, conversationId);
  }
}
