import { Context as ApiContext } from "../lib/interfaces/api/context";
import { login, LoginOptions } from "../lib/login";
import { requestIo } from "../lib/request-io";
import { testConfig } from "./test-config";

describe.skip("login", function () {
  describe("login", async function (this: Mocha.ISuiteCallbackContext) {
    this.timeout(10 * 60 * 1000); // 10 minutes

    it("Should log into the main test account", async function () {
      const options: LoginOptions = {
        credentials: testConfig.credentials,
        io: requestIo,
      };
      const apiContext: ApiContext = await login(options);
      console.log(apiContext);
    });
  });
});
