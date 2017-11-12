import { Credentials } from "../lib/interfaces/api/api";

export interface TestConfig {
  /**
   * Perform online tests (default: false)
   */
  online: boolean;

  credentials: Credentials;

  secondaryAccounts: Credentials[];

  verbose: boolean;
}

const online: boolean = process.env["OCILO_TEST_ONLINE"] === "true";
const verbose: boolean = process.env["OCILO_TEST_VERBOSE"] === "true";
// TODO: Use environment (currently you have to edit this manually and remember to revert it before commiting :s)
const credentials: Credentials = {
  username: "SKYPE_USERNAME",
  password: "SKYPE_PASSWORD",
};

const secondaryAccounts: Credentials[] = [
  {
    // replace by your username
    username: "SKYPE_USERNAME",

    // replace by your password
    password: "SKYPE_PASSWORD",
  },
];

export const testConfig: TestConfig = {online, credentials, secondaryAccounts, verbose};
