import { assert } from "chai";
import { ISuiteCallbackContext } from "mocha";
import { Api } from "../../lib/api";
import * as SkypeHttp from "../../lib/connect";
import { Credentials } from "../../lib/interfaces/api/api";
import { testConfig } from "../test-config";

const mainAccount: Credentials = testConfig.credentials;

describe.skip("SkypeHttp", function (this: ISuiteCallbackContext) {
  this.timeout(20000); // 20 seconds

  it("should connect to the main account trough authentication", async function () {
    return SkypeHttp.connect({credentials: mainAccount, verbose: testConfig.verbose})
      .then((api: Api) => {
        assert.equal(api.context.username, mainAccount.username);
      });
  });
});
