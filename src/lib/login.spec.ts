import testConfig from "../test/test-config";
import {Context as ApiContext} from "./interfaces/api/context";
import {login, LoginOptions} from "./login";
import {requestIo} from "./request-io";

describe.skip("login", function() {
  describe("login", async function(this: Mocha.ISuiteCallbackContext) {
    this.timeout(10 * 60 * 1000); // 10 minutes

    it("Should log into the main test account", async function() {
      const options: LoginOptions = {
        credentials: testConfig.credentials,
        io: requestIo
      };
      const apiContext: ApiContext = await login(options);
      console.log(apiContext);
    });
  });
});
