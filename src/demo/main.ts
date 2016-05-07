import * as Bluebird from "bluebird";
import {createInterface} from "readline";

import Skyweb from "../lib/skyweb";

interface Credentials {
  username: string;
  password: string;
}

function promptCredentials (): Bluebird<Credentials> {
  let cliInterface = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  let credentials: Credentials = {
    username: null,
    password: null
  };

  return Bluebird.fromCallback((cb) => {
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

let skyweb = new Skyweb();

promptCredentials()
  .then((credentials: Credentials) => {
    username = credentials.username;
    password = credentials.password;
    return skyweb.login(username, password);
  })
  .then((skypeAccount) => {
    console.log("Skyweb is initialized now");
    console.log("Here is some info about you:" + JSON.stringify(skyweb.skypeAccount.selfInfo, null, 2));
    console.log("Your contacts : " + JSON.stringify(skyweb.contactsService.contacts, null, 2));
    console.log("Going incognito.");
    skyweb.setStatus("Hidden");
  });

skyweb.authRequestCallback = (requests) => {
  requests.forEach((request) => {
    skyweb.acceptAuthRequest(request.sender);
    skyweb.sendMessage("8:" + request.sender, "I accepted you!");
  });
};

skyweb.messagesCallback = (messages) => {
  messages.forEach((message)=> {
    if (message.resource.from.indexOf(username) === -1 && message.resource.messagetype !== "Control/Typing" && message.resource.messagetype !== "Control/ClearTyping") {
      let conversationLink = message.resource.conversationLink;
      let conversationId = conversationLink.substring(conversationLink.lastIndexOf("/") + 1);
      skyweb.sendMessage(conversationId, message.resource.content + ". Cats will rule the World");
    }
  });
};
