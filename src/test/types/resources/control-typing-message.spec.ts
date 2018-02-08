import chai from "chai";
import { JSON_READER } from "../../../lib/json-reader";
import { $ControlTypingMessage, ControlTypingMessage } from "../../../lib/types/resources/control-typing-message";
import { MessageType } from "../../../lib/types/resources/message-type";
import { ResourceType } from "../../../lib/types/resources/resource-type";

describe("Read ControlTypingMessage", function () {
  interface TestItem {
    name: string;
    input: string;
    expected: ControlTypingMessage;
  }

  // tslint:disable:max-line-length
  const testItems: TestItem[] = [
    {
      name: "Simple Control/Typing",
      input: `{
        "id": "1483885996187",
        "ackrequired": "https://db5-client-s.gateway.messenger.live.com/v1/users/ME/conversations/ALL/messages/1483885996187/ack",
        "originalarrivaltime": "2017-01-08T14:33:16.196Z",
        "imdisplayname": "Bob",
        "messagetype": "Control/Typing",
        "conversationLink": "https://db5-client-s.gateway.messenger.live.com/v1/users/ME/conversations/8:bob",
        "composetime": "2017-01-08T14:33:16.196Z",
        "isactive": true,
        "from": "https://db5-client-s.gateway.messenger.live.com/v1/users/ME/contacts/8:bob",
        "type": "Message",
        "counterpartymessageid": "1483885996189",
        "version": "1483885996187"
      }`,
      expected: {
        id: "1483885996187",
        type: ResourceType.Message,
        messageType: MessageType.ControlTyping,
        ackRequired: "https://db5-client-s.gateway.messenger.live.com/v1/users/ME/conversations/ALL/messages/1483885996187/ack",
        originalArrivalTime: new Date("2017-01-08T14:33:16.196Z"),
        imDisplayName: "Bob",
        conversationLink: "https://db5-client-s.gateway.messenger.live.com/v1/users/ME/conversations/8:bob",
        composeTime: new Date("2017-01-08T14:33:16.196Z"),
        isActive: true,
        from: "https://db5-client-s.gateway.messenger.live.com/v1/users/ME/contacts/8:bob",
        counterpartyMessageId: "1483885996189",
        version: "1483885996187",
      },
    },
  ];

  for (const item of testItems) {
    it(`should read the item: ${item.name}`, function () {
      const actual: ControlTypingMessage = $ControlTypingMessage.read(JSON_READER, item.input);
      chai.assert.isTrue($ControlTypingMessage.equals(actual, item.expected));
    });
  }
});
