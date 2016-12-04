import {login, LoginOptions} from "./login";
import testConfig from "../test/test-config";
import {requestIo} from "./request-io";
import {Context as ApiContext} from "./interfaces/api/context";

describe.skip("login", function(this: Mocha.IContextDefinition) {
  this.timeout(1000000); // 1000 seconds

  describe.only("login", async function() {
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
