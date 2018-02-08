import chai from "chai";
import { JSON_READER } from "../../../lib/json-reader";
import { EventResourceType } from "../../../lib/types/events/event-resource-type";
import { EventType } from "../../../lib/types/events/event-type";
import { $SkypeEvent, SkypeEvent } from "../../../lib/types/events/skype-event";
import { MessageType } from "../../../lib/types/resources/message-type";
import { ResourceType } from "../../../lib/types/resources/resource-type";
import { UserPresenceAvailability } from "../../../lib/types/resources/user-presence-availability";
import { UserPresenceStatus } from "../../../lib/types/resources/user-presence-status";

describe("Read SkypeEvent", function () {
  interface TestItem {
    name: string;
    input: string;
    expected: SkypeEvent;
  }

  // tslint:disable:max-line-length
  const testItems: TestItem[] = [
    {
      name: "Simple UserPresence",
      input: `{
        "id":1001,
        "type": "EventMessage",
        "resourceType": "UserPresence",
        "time": "2018-02-08T14:40:10Z",
        "resourceLink": "https://db4-client-s.gateway.messenger.live.com/v1/users/ME/contacts/8:demurgos.net/presenceDocs/messagingService",
        "resource": {
          "id": "messagingService",
          "type": "UserPresenceDoc",
          "selfLink": "https://db4-client-s.gateway.messenger.live.com/v1/users/8:demurgos.net/presenceDocs/messagingService",
          "availability": "Offline",
          "status": "Offline",
          "capabilities": "Video | Audio",
          "lastSeenAt": "2018-02-08T13:13:02.000Z",
          "endpointPresenceDocLinks": [
            "https://db4-client-s.gateway.messenger.live.com/v1/users/8:demurgos.net/endpoints/{67725fe0-35a7-49ea-87a3-557301b72cfb}/presenceDocs/messagingService"
          ]
        }
      }`,
      expected: {
        id: 1001,
        type: EventType.EventMessage,
        resourceType: EventResourceType.UserPresence,
        time: new Date("2018-02-08T14:40:10Z"),
        resourceLink: "https://db4-client-s.gateway.messenger.live.com/v1/users/ME/contacts/8:demurgos.net/presenceDocs/messagingService",
        resource: {
          id: "messagingService",
          type: ResourceType.UserPresenceDoc,
          selfLink: "https://db4-client-s.gateway.messenger.live.com/v1/users/8:demurgos.net/presenceDocs/messagingService",
          availability: UserPresenceAvailability.Offline,
          status: UserPresenceStatus.Offline,
          capabilities: "Video | Audio",
          lastSeenAt: new Date("2018-02-08T13:13:02.000Z"),
          endpointPresenceDocLinks: [
            "https://db4-client-s.gateway.messenger.live.com/v1/users/8:demurgos.net/endpoints/{67725fe0-35a7-49ea-87a3-557301b72cfb}/presenceDocs/messagingService",
          ],
        },
      },
    },
    {
      name: "Simple EndpointPresence",
      input: `{
        "id": 1002,
        "type": "EventMessage",
        "resourceType": "EndpointPresence",
        "time": "2018-02-08T14:40:10Z",
        "resourceLink":"https://db4-client-s.gateway.messenger.live.com/v1/users/8:demurgos.net/endpoints/{67725fe0-35a7-49ea-87a3-557301b72cfb}/presenceDocs/messagingService",
        "resource": {
          "id": "messagingService",
          "type":"EndpointPresenceDoc",
          "selfLink": "https://db4-client-s.gateway.messenger.live.com/v1/users/8:demurgos.net/endpoints/{67725fe0-35a7-49ea-87a3-557301b72cfb}/presenceDocs/messagingService",
          "publicInfo": {
            "capabilities": "Video | Audio",
            "typ": "14",
            "skypeNameVersion": "1431/8.13.0.2/SkypeX",
            "nodeInfo": "xx",
            "version": "15"
          },
          "privateInfo": {
          }
        }
      }`,
      expected: {
        id: 1002,
        type: EventType.EventMessage,
        resourceType: EventResourceType.EndpointPresence,
        time: new Date("2018-02-08T14:40:10Z"),
        resourceLink: "https://db4-client-s.gateway.messenger.live.com/v1/users/8:demurgos.net/endpoints/{67725fe0-35a7-49ea-87a3-557301b72cfb}/presenceDocs/messagingService",
        resource: {
          id: "messagingService",
          type: ResourceType.EndpointPresenceDoc,
          selfLink: "https://db4-client-s.gateway.messenger.live.com/v1/users/8:demurgos.net/endpoints/{67725fe0-35a7-49ea-87a3-557301b72cfb}/presenceDocs/messagingService",
          publicInfo: {
            capabilities: "Video | Audio",
            typ: "14",
            skypeNameVersion: "1431/8.13.0.2/SkypeX",
            nodeInfo: "xx",
            version: "15",
          },
          privateInfo: {},
        },
      },
    },
    {
      name: "Own EndpointPresence of the current user",
      input: `{
        "id": 1008,
        "type": "EventMessage",
        "resourceType": "EndpointPresence",
        "time": "2018-02-08T14:40:10Z",
        "resourceLink": "https://db4-client-s.gateway.messenger.live.com/v1/users/8:bob/endpoints/{22e46ac1-5c0e-465f-927b-c7e50b69c3e2}/presenceDocs/messagingService",
        "resource": {
          "id": "messagingService",
          "type": "EndpointPresenceDoc",
          "selfLink": "https://db4-client-s.gateway.messenger.live.com/v1/users/8:bob/endpoints/{22e46ac1-5c0e-465f-927b-c7e50b69c3e2}/presenceDocs/messagingService",
          "publicInfo": {
            "capabilities": "Video | Audio",
            "typ": "",
            "skypeNameVersion": "skype.com",
            "nodeInfo": "xx",
            "version": "908/1.30.0.128//skype.com"
          },
          "privateInfo": {
            "epname": "skype"
          }
        }
      }`,
      expected: {
        id: 1008,
        type: EventType.EventMessage,
        resourceType: EventResourceType.EndpointPresence,
        time: new Date("2018-02-08T14:40:10Z"),
        resourceLink: "https://db4-client-s.gateway.messenger.live.com/v1/users/8:bob/endpoints/{22e46ac1-5c0e-465f-927b-c7e50b69c3e2}/presenceDocs/messagingService",
        resource: {
          id: "messagingService",
          type: ResourceType.EndpointPresenceDoc,
          selfLink: "https://db4-client-s.gateway.messenger.live.com/v1/users/8:bob/endpoints/{22e46ac1-5c0e-465f-927b-c7e50b69c3e2}/presenceDocs/messagingService",
          publicInfo: {
            capabilities: "Video | Audio",
            typ: "",
            skypeNameVersion: "skype.com",
            nodeInfo: "xx",
            version: "908/1.30.0.128//skype.com",
          },
          privateInfo: {
            epName: "skype",
          },
        },
      },
    },
    {
      name: "New Control/Typing message",
      input: `{
        "id": 1032,
        "type": "EventMessage",
        "resourceType": "NewMessage",
        "time": "2018-02-08T16:51:46Z",
        "resourceLink": "https://db4-client-s.gateway.messenger.live.com/v1/users/ME/conversations/8:demurgos.net/messages/1518108706884",
        "resource": {
          "type": "Message",
          "messagetype": "Control/Typing",
          "originalarrivaltime": "2018-02-08T16:51:46.808Z",
          "version": "1518108706884",
          "contenttype": "Application/Message",
          "origincontextid": "0",
          "isactive": true,
          "from": "https://db4-client-s.gateway.messenger.live.com/v1/users/ME/contacts/8:demurgos.net",
          "id": "1518108706884",
          "conversationLink": "https://db4-client-s.gateway.messenger.live.com/v1/users/ME/conversations/8:demurgos.net",
          "counterpartymessageid": "1518108706884",
          "imdisplayname": "demurgos.net",
          "ackrequired": "https://db4-client-s.gateway.messenger.live.com/v1/users/ME/conversations/ALL/messages/1518108706884/ack",
          "composetime": "2018-02-08T16:51:46.808Z"
        }
      }`,
      expected: {
        id: 1032,
        type: EventType.EventMessage,
        resourceType: EventResourceType.NewMessage,
        time: new Date("2018-02-08T16:51:46Z"),
        resourceLink: "https://db4-client-s.gateway.messenger.live.com/v1/users/ME/conversations/8:demurgos.net/messages/1518108706884",
        resource: {
          id: "1518108706884",
          type: ResourceType.Message,
          messageType: MessageType.ControlTyping,
          originalArrivalTime: new Date("2018-02-08T16:51:46.808Z"),
          version: "1518108706884",
          contentType: "Application/Message",
          originContextId: "0",
          isActive: true,
          from: "https://db4-client-s.gateway.messenger.live.com/v1/users/ME/contacts/8:demurgos.net",
          conversationLink: "https://db4-client-s.gateway.messenger.live.com/v1/users/ME/conversations/8:demurgos.net",
          counterpartyMessageId: "1518108706884",
          imDisplayName: "demurgos.net",
          ackRequired: "https://db4-client-s.gateway.messenger.live.com/v1/users/ME/conversations/ALL/messages/1518108706884/ack",
          composeTime: new Date("2018-02-08T16:51:46.808Z"),
        },
      },
    },
    {
      name: "New Control/ClearTyping message",
      input: `{
        "id": 1033,
        "type": "EventMessage",
        "resourceType": "NewMessage",
        "time": "2018-02-08T16:51:48Z",
        "resourceLink": "https://db4-client-s.gateway.messenger.live.com/v1/users/ME/conversations/8:demurgos.net/messages/1518108708775",
        "resource": {
          "type": "Message",
          "messagetype": "Control/ClearTyping",
          "originalarrivaltime": "2018-02-08T16:51:48.696Z",
          "version": "1518108708775",
          "contenttype": "Application/Message",
          "origincontextid": "0",
          "isactive": true,
          "from": "https://db4-client-s.gateway.messenger.live.com/v1/users/ME/contacts/8:demurgos.net",
          "id": "1518108708775",
          "conversationLink": "https://db4-client-s.gateway.messenger.live.com/v1/users/ME/conversations/8:demurgos.net",
          "counterpartymessageid": "1518108708775",
          "imdisplayname": "demurgos.net",
          "ackrequired": "https://db4-client-s.gateway.messenger.live.com/v1/users/ME/conversations/ALL/messages/1518108708775/ack",
          "composetime": "2018-02-08T16:51:48.696Z"
        }
      }`,
      expected: {
        id: 1033,
        type: EventType.EventMessage,
        resourceType: EventResourceType.NewMessage,
        time: new Date("2018-02-08T16:51:48Z"),
        resourceLink: "https://db4-client-s.gateway.messenger.live.com/v1/users/ME/conversations/8:demurgos.net/messages/1518108708775",
        resource: {
          id: "1518108708775",
          clientMessageId: "30120195694598267",
          type: ResourceType.Message,
          messageType: MessageType.ControlClearTyping,
          originalArrivalTime: new Date("2018-02-08T16:51:48.696Z"),
          version: "1518108708775",
          contentType: "Application/Message",
          originContextId: "0",
          isActive: true,
          from: "https://db4-client-s.gateway.messenger.live.com/v1/users/ME/contacts/8:demurgos.net",
          conversationLink: "https://db4-client-s.gateway.messenger.live.com/v1/users/ME/conversations/8:demurgos.net",
          counterpartyMessageId: "1518108708775",
          imDisplayName: "demurgos.net",
          ackRequired: "https://db4-client-s.gateway.messenger.live.com/v1/users/ME/conversations/ALL/messages/1518108708775/ack",
          composeTime: new Date("2018-02-08T16:51:48.696Z"),
        },
      },
    },
    {
      name: "New RichText message",
      input: `{
        "id": 1034,
        "type": "EventMessage",
        "resourceType": "NewMessage",
        "time": "2018-02-08T16:51:49Z",
        "resourceLink": "https://db4-client-s.gateway.messenger.live.com/v1/users/ME/conversations/8:demurgos.net/messages/1518108709179",
        "resource": {
          "clientmessageid": "30120195694598267",
          "type": "Message",
          "messagetype": "RichText",
          "originalarrivaltime": "2018-02-08T16:51:48.692Z",
          "version": "1518108709179",
          "contenttype": "text",
          "origincontextid": "0",
          "isactive": true,
          "from": "https://db4-client-s.gateway.messenger.live.com/v1/users/ME/contacts/8:demurgos.net",
          "id": "1518108709179",
          "conversationLink": "https://db4-client-s.gateway.messenger.live.com/v1/users/ME/conversations/8:demurgos.net",
          "counterpartymessageid": "1518108709179",
          "imdisplayname": "Demurgos",
          "ackrequired": "https://db4-client-s.gateway.messenger.live.com/v1/users/ME/conversations/ALL/messages/1518108709179/ack",
          "content": "Hello, World!",
          "composetime": "2018-02-08T16:51:48.692Z"
        }
      }`,
      expected: {
        id: 1034,
        type: EventType.EventMessage,
        resourceType: EventResourceType.NewMessage,
        time: new Date("2018-02-08T16:51:49Z"),
        resourceLink: "https://db4-client-s.gateway.messenger.live.com/v1/users/ME/conversations/8:demurgos.net/messages/1518108709179",
        resource: {
          id: "1518108709179",
          clientMessageId: "30120195694598267",
          type: ResourceType.Message,
          messageType: MessageType.RichText,
          originalArrivalTime: new Date("2018-02-08T16:51:48.692Z"),
          version: "1518108709179",
          contentType: "text",
          originContextId: "0",
          isActive: true,
          from: "https://db4-client-s.gateway.messenger.live.com/v1/users/ME/contacts/8:demurgos.net",
          conversationLink: "https://db4-client-s.gateway.messenger.live.com/v1/users/ME/conversations/8:demurgos.net",
          counterpartyMessageId: "1518108709179",
          imDisplayName: "Demurgos",
          ackRequired: "https://db4-client-s.gateway.messenger.live.com/v1/users/ME/conversations/ALL/messages/1518108709179/ack",
          content: "Hello, World!",
          composeTime: new Date("2018-02-08T16:51:48.692Z"),
        },
      },
    },
  ];

  for (const item of testItems) {
    it(`should read the item: ${item.name}`, function () {
      const actual: SkypeEvent = $SkypeEvent.read(JSON_READER, item.input);
      chai.assert.isTrue($SkypeEvent.equals(actual, item.expected));
    });
  }
});
