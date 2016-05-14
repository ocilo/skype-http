import * as Bluebird from "bluebird";
import {createInterface} from "readline";

import {Credentials} from "../lib/interfaces/index";
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

promptCredentials()
  .then((credentials: Credentials) => {
    let options = {
      credentials: credentials,
      verbose: true
    };
    return skypeHttp.connect(options);
  })
  .then((api: SkypeApi) => {
    return api.getContacts()
      .then((contacts) => {
        console.log("Your contacts:");
        console.log(JSON.stringify(contacts, null, 2));
      });
  });
