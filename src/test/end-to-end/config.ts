// import {resolve as resolvePath} from "path";
// import {Incident} from "incident";
//
// import {Credentials} from "../../lib/interfaces/api/api";
//
// const TEST_CONFIG_PATH = "test-config.js";
//
// const projectRoot = resolvePath(__dirname, "../../../.."); // end-to-end, -> test -> test -> build -> root
// const testConfigPath = resolvePath(projectRoot, TEST_CONFIG_PATH);
//
// export interface TestConfig {
//   accounts: Credentials[];
//   verbose: boolean;
// }
//
// // tslint:disable-next-line:no-require-imports
// export const testConfig: TestConfig = require(testConfigPath); // Get the config file
//
// // Do some simple checks on the config file
// if (!Array.isArray(testConfig.accounts)) {
//   throw new Incident("invalid-config", "The test config must expose the array 'accounts'");
// }
//
// if (testConfig.accounts.length === 0) {
//   throw new Incident("invalid-config", "Supplied 'accounts' array is empty");
// }
//
// testConfig.accounts.forEach((credentials: Credentials, index: number) => {
//   if (!credentials) {
//     throw new Incident("invalid-config", `Falsy value in 'accounts' array at index ${index}`);
//   }
//   if (typeof credentials.username !== "string") {
//     throw new Incident("invalid-config", `non-string username in 'accounts' array at index ${index}`);
//   }
//   if (typeof credentials.password !== "string") {
//     throw new Incident("invalid-config", `non-string password in 'accounts' array at index ${index}`);
//   }
// });
//
// testConfig.verbose = Boolean(testConfig.verbose);
