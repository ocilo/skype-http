import chai from "chai";
import { JSON_READER } from "../../../lib/json-reader";
import {
  $ControlClearTypingMessage,
  ControlClearTypingMessage,
} from "../../../lib/types/resources/control-clear-typing-message";
import { MessageType } from "../../../lib/types/resources/message-type";
import { ResourceType } from "../../../lib/types/resources/resource-type";

describe("Read ControlClearTypingMessage", function () {
  interface TestItem {
    name: string;
    input: string;
    expected: ControlClearTypingMessage;
  }

  // tslint:disable:max-line-length
  const testItems: TestItem[] = [
    {
      name: "Simple Control/ClearTyping",
      input: `{
        "id": "1483879804631",
        "ackrequired": "https://db5-client-s.gateway.messenger.live.com/v1/users/ME/conversations/ALL/messages/1483879804631/ack",
        "originalarrivaltime": "2017-01-08T12:50:04.626Z",
        "imdisplayname": "Bob",
        "messagetype": "Control/ClearTyping",
        "conversationLink": "https://db5-client-s.gateway.messenger.live.com/v1/users/ME/conversations/8:bob",
        "composetime": "2017-01-08T12:50:04.626Z",
        "isactive": true,
        "from": "https://db5-client-s.gateway.messenger.live.com/v1/users/ME/contacts/8:bob",
        "type": "Message",
        "counterpartymessageid": "1483879804624",
        "version": "1483879804631"
      }`,
      expected: {
        id: "1483879804631",
        type: ResourceType.Message,
        messageType: MessageType.ControlClearTyping,
        ackRequired: "https://db5-client-s.gateway.messenger.live.com/v1/users/ME/conversations/ALL/messages/1483879804631/ack",
        originalArrivalTime: new Date("2017-01-08T12:50:04.626Z"),
        imDisplayName: "Bob",
        conversationLink: "https://db5-client-s.gateway.messenger.live.com/v1/users/ME/conversations/8:bob",
        composeTime: new Date("2017-01-08T12:50:04.626Z"),
        isActive: true,
        from: "https://db5-client-s.gateway.messenger.live.com/v1/users/ME/contacts/8:bob",
        counterpartyMessageId: "1483879804624",
        version: "1483879804631",
      },
    },
  ];

  for (const item of testItems) {
    it(`should read the item: ${item.name}`, function () {
      const actual: ControlClearTypingMessage = $ControlClearTypingMessage.read(JSON_READER, item.input);
      chai.assert.isTrue($ControlClearTypingMessage.equals(actual, item.expected));
    });
  }
});
