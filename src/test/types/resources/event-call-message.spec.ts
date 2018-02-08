import chai from "chai";
import { JSON_READER } from "../../../lib/json-reader";
import {
  $ControlClearTypingMessage,
  ControlClearTypingMessage,
} from "../../../lib/types/resources/control-clear-typing-message";
import { $EventCallMessage, EventCallMessage } from "../../../lib/types/resources/event-call-message";
import { MessageType } from "../../../lib/types/resources/message-type";
import { ResourceType } from "../../../lib/types/resources/resource-type";

describe("Read EventCallMessage", function () {
  interface TestItem {
    name: string;
    input: string;
    expected: EventCallMessage;
  }

  // tslint:disable:max-line-length
  const testItems: TestItem[] = [
    {
      name: "Simple Event/Call",
      input: `{
        "clientmessageid": "16930058130863214577",
        "composetime": "2017-01-08T14:49:20.395Z",
        "messagetype": "Event/Call",
        "originalarrivaltime": "2017-01-08T14:49:20.395Z",
        "type": "Message",
        "version": "1483886960408",
        "isactive": true,
        "from": "https://db5-client-s.gateway.messenger.live.com/v1/users/ME/contacts/8:bob",
        "id": "1483886960408",
        "conversationLink": "https://db5-client-s.gateway.messenger.live.com/v1/users/ME/conversations/8:bob",
        "counterpartymessageid": "1483886960402",
        "imdisplayname": "Bob",
        "ackrequired": "https://db5-client-s.gateway.messenger.live.com/v1/users/ME/conversations/ALL/messages/1483886960408/ack",
        "content": "<partlist type=\\"started\\" alt=\\"\\">\\n  <part identity=\\"bob\\">\\n    <name>Bob</name>\\n  </part>\\n</partlist>",
        "skypeguid": "2ff47f4b-5b79-4076-a1ae-d34d6d89b135"
      }`,
      expected: {
        id: "1483886960408",
        type: ResourceType.Message,
        messageType: MessageType.EventCall,
        composeTime: new Date("2017-01-08T14:49:20.395Z"),
        originalArrivalTime: new Date("2017-01-08T14:49:20.395Z"),
        version: "1483886960408",
        isActive: true,
        from: "https://db5-client-s.gateway.messenger.live.com/v1/users/ME/contacts/8:bob",
        conversationLink: "https://db5-client-s.gateway.messenger.live.com/v1/users/ME/conversations/8:bob",
        counterpartyMessageId: "1483886960402",
        imDisplayName: "Bob",
        ackRequired: "https://db5-client-s.gateway.messenger.live.com/v1/users/ME/conversations/ALL/messages/1483886960408/ack",
        content: "<partlist type=\"started\" alt=\"\">\n  <part identity=\"bob\">\n    <name>Bob</name>\n  </part>\n</partlist>",
        skypeGuid: "2ff47f4b-5b79-4076-a1ae-d34d6d89b135",
      },
    },
  ];

  for (const item of testItems) {
    it(`should read the item: ${item.name}`, function () {
      const actual: EventCallMessage = $EventCallMessage.read(JSON_READER, item.input);
      chai.assert.isTrue($EventCallMessage.equals(actual, item.expected));
    });
  }
});
