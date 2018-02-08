import chai from "chai";
import { JSON_READER } from "../../../lib/json-reader";
import { ResourceType } from "../../../lib/types/resources/resource-type";
import { UserPresenceAvailability } from "../../../lib/types/resources/user-presence-availability";
import {
  $UserPresenceDocResource,
  UserPresenceDocResource,
} from "../../../lib/types/resources/user-presence-doc-resource";
import { UserPresenceStatus } from "../../../lib/types/resources/user-presence-status";

describe("Read UserPresenceDocResource", function () {
  interface TestItem {
    name: string;
    input: string;
    expected: UserPresenceDocResource;
  }

  // tslint:disable:max-line-length
  const testItems: TestItem[] = [
    {
      name: "Idle Online user",
      input: `{
        "id": "messagingService",
        "type": "UserPresenceDoc",
        "selfLink": "https://db4-client-s.gateway.messenger.live.com/v1/users/8:demurgos.net/presenceDocs/messagingService",
        "availability": "Online",
        "status": "Idle",
        "capabilities": "Video | Audio",
        "lastSeenAt": "2018-02-08T14:09:33.000Z",
        "endpointPresenceDocLinks": [
          "https://db4-client-s.gateway.messenger.live.com/v1/users/8:demurgos.net/endpoints/{a71de238-e491-4d3f-8610-96736bc17961}/presenceDocs/messagingService"
        ]
      }`,
      expected: {
        id: "messagingService",
        type: ResourceType.UserPresenceDoc,
        selfLink: "https://db4-client-s.gateway.messenger.live.com/v1/users/8:demurgos.net/presenceDocs/messagingService",
        availability: UserPresenceAvailability.Online,
        status: UserPresenceStatus.Idle,
        capabilities: "Video | Audio",
        lastSeenAt: new Date("2018-02-08T14:09:33.000Z"),
        endpointPresenceDocLinks: [
          "https://db4-client-s.gateway.messenger.live.com/v1/users/8:demurgos.net/endpoints/{a71de238-e491-4d3f-8610-96736bc17961}/presenceDocs/messagingService",
        ],
      },
    },
    {
      name: "Busy Online user",
      input: `{
        "id": "messagingService",
        "type": "UserPresenceDoc",
        "selfLink": "https://db4-client-s.gateway.messenger.live.com/v1/users/8:demurgos.net/presenceDocs/messagingService",
        "availability": "Online",
        "status": "Busy",
        "capabilities": "Seamless",
        "lastSeenAt": "2018-01-11T18:08:17.000Z",
        "endpointPresenceDocLinks": [
          "https://db4-client-s.gateway.messenger.live.com/v1/users/8:demurgos.net/endpoints/{1b6f5cbb-1790-30de-5818-3f199fc053d0}/presenceDocs/messagingService"
        ]
      }`,
      expected: {
        id: "messagingService",
        type: ResourceType.UserPresenceDoc,
        selfLink: "https://db4-client-s.gateway.messenger.live.com/v1/users/8:demurgos.net/presenceDocs/messagingService",
        availability: UserPresenceAvailability.Online,
        status: UserPresenceStatus.Busy,
        capabilities: "Seamless",
        lastSeenAt: new Date("2018-01-11T18:08:17.000Z"),
        endpointPresenceDocLinks: [
          "https://db4-client-s.gateway.messenger.live.com/v1/users/8:demurgos.net/endpoints/{1b6f5cbb-1790-30de-5818-3f199fc053d0}/presenceDocs/messagingService",
        ],
      },
    },
    {
      name: "Missing lastSeenAt",
      input: `{
        "id": "messagingService",
        "type": "UserPresenceDoc",
        "selfLink": "https://db4-client-s.gateway.messenger.live.com/v1/users/8:demurgos.net/presenceDocs/messagingService",
        "availability": "Online",
        "status": "Online",
        "capabilities": "Video | Audio",
        "endpointPresenceDocLinks": [
          "https://db4-client-s.gateway.messenger.live.com/v1/users/8:demurgos.net/endpoints/{67725fe0-35a7-49ea-87a3-557301b72cfb}/presenceDocs/messagingService"
        ]
      }`,
      expected: {
        id: "messagingService",
        type: ResourceType.UserPresenceDoc,
        selfLink: "https://db4-client-s.gateway.messenger.live.com/v1/users/8:demurgos.net/presenceDocs/messagingService",
        availability: UserPresenceAvailability.Online,
        status: UserPresenceStatus.Online,
        capabilities: "Video | Audio",
        endpointPresenceDocLinks: [
          "https://db4-client-s.gateway.messenger.live.com/v1/users/8:demurgos.net/endpoints/{67725fe0-35a7-49ea-87a3-557301b72cfb}/presenceDocs/messagingService",
        ],
      },
    },
  ];

  for (const item of testItems) {
    it(`should read the item: ${item.name}`, function () {
      const actual: UserPresenceDocResource = $UserPresenceDocResource.read(JSON_READER, item.input);
      chai.assert.isTrue($UserPresenceDocResource.equals(actual, item.expected));
    });
  }
});
