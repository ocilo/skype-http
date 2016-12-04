import * as Bluebird from "bluebird";
import {createInterface} from "readline";

import {Credentials} from "../lib/interfaces/api/api";
import * as events from "../lib/interfaces/api/events";
import {Contact} from "../lib/interfaces/api/contact";
import * as resources from "../lib/interfaces/api/resources";
import * as skypeHttp from "../lib/connect";
import {Api as SkypeApi} from "../lib/api";
import {virtualContacts} from "../lib/api/get-contact";

async function promptCredentials (): Promise<Credentials> {
  let cliInterface = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const username: string = await Bluebird
    .fromCallback((cb) => {
      cliInterface.question("Username? ", (res) => cb(null, res));
    });

  const password: string = await Bluebird
    .fromCallback((cb) => {
      cliInterface.question("Password? ", (res) => cb(null, res));
    });

  return {username, password};
}

async function run(): Promise<void> {
  const credentials: Credentials = await promptCredentials();
  const options = {
    credentials: credentials,
    verbose: true
  };
  const api: SkypeApi = await skypeHttp.connect(options);

  // Log every event
  api.on("event", (ev: events.EventMessage) => {
    console.log(JSON.stringify(ev, null, 2));
  });

  // Log every error
  api.on("error", (err: Error) => {
    console.error("An error was detected:");
    console.error(err);
  });

  let onMessage = (resource: resources.TextResource) => {
    if (resource.from.username === api.context.username) {
      return;
    }

    console.log("Received text:");
    console.log(resource.content);
    const response: string = `Hi! You said "${resource.content}". skype-http works!`;
    console.log(`Responding to conversation ${resource.conversation}`);
    console.log(response);
    return api.sendMessage({textContent: response}, resource.conversation);
  };

  api.on("Text", onMessage);
  api.on("RichText", onMessage);

  const contacts = await api.getContacts();
  console.log("Your contacts:");
  console.log(JSON.stringify(contacts, null, 2));

  await Promise.all(contacts.map(async function (contact: Contact) {
    try {
      if (virtualContacts.has(contact.id.id)) {
        return;
      }
      const fullContact = await api.getContact(contact.id.id);
      console.log(JSON.stringify(fullContact, null, 2));
    } catch (err) {
      console.warn(err);
    }
  }));

  console.log("Starting polling:");
  await api.listen();
  await api.setStatus("Online");
  console.log("Ready");
}

run().then(console.log, console.error);
