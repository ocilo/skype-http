import * as Bluebird from "bluebird";
import {createInterface} from "readline";

import {Credentials} from "../lib/interfaces/api/api";
import * as events from "../lib/interfaces/api/events";
import {Contact} from "../lib/interfaces/api/contact";
import * as resources from "../lib/interfaces/api/resources";
import * as skypeHttp from "../lib/connect";
import {Api as SkypeApi} from "../lib/api";

function promptCredentials (): Bluebird<Credentials> {
  let cliInterface = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  let credentials: Credentials = {
    username: null,
    password: null
  };

  return Bluebird
    .fromCallback((cb) => {
      cliInterface.question("Username: ", (res) => cb(null, res));
    })
    .then((username: string) => {
      credentials.username = username;
      return Bluebird.fromCallback((cb) => {
        cliInterface.question("Password: ", (res) => cb(null, res));
      });
    })
    .then((password: string) => {
      credentials.password = password;
      return credentials;
    });
}

let username: string = null;
let password: string = null;

promptCredentials()
  .then((credentials: Credentials) => {
    let options = {
      credentials: credentials,
      verbose: true
    };
    return skypeHttp.connect(options);
  })
  .then((api: SkypeApi) => {
    // Log every event
    api.on("event", (ev: events.EventMessage) => {
      console.log(JSON.stringify(ev, null, 2));
    });

    let onMessage = (resource: resources.TextResource) => {
      if (resource.from.username === api.apiContext.username) {
        return;
      }

      console.log("Received text:");
      console.log(resource.content);
      const response: string = `Hi! You said "${resource.content}". SkypeHttp works!`;
      console.log(`Responding to conversation ${resource.conversation}`);
      console.log(response);
      return api.sendMessage({textContent: response}, resource.conversation);
    };

    api.on("Text", onMessage);
    api.on("RichText", onMessage);

    return api.getContacts()
      .then((contacts) => {
        console.log("Your contacts:");
        console.log(JSON.stringify(contacts, null, 2));
        return Bluebird.map(contacts, (contact: Contact) => {
          return null;
          // return api.getContact(contact.id)
          //   .then(contact => {
          //     console.log(JSON.stringify(contact, null, 2));
          //   });
        });
      })
      // .then(() => {
      //   return api.getConversations()
      //     .then((conversations: api.Conversation[]) => {
      //       console.log(JSON.stringify(conversations, null, 2));
      //       return Bluebird.map(conversations, (conversation: api.Conversation) => {
      //         return api.getConversation(conversation.id)
      //           .then(conv => {
      //             console.log(JSON.stringify(conv, null, 2));
      //           });
      //       });
      //     });
      // })
      .then(() => {
        console.log("Starting polling:");
        return api.listen();
      })
      .then((api: SkypeApi) => {
        api.setStatus("Online");
      });
  });
