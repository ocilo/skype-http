import * as Bluebird from "bluebird";
import {createInterface} from "readline";

import {Credentials} from "../lib/interfaces/index";
import * as api from "../lib/interfaces/api";
import * as skypeHttp from "../lib/skype-http";
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
    api.on("event", (ev: api.EventMessage) => {
      console.log(JSON.stringify(ev, null, 2));
    });

    let onMessage = (resource: api.TextResource) => {
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
        console.log("Starting polling:");
        return api.listen();
      });
  });
