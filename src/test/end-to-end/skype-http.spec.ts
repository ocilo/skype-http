import {assert} from "chai";

import * as SkypeHttp from "../../lib/connect";
import {Credentials} from "../../lib/interfaces/index";
import {Api} from "../../lib/api";

import {testConfig} from "./config";

const mainAccount: Credentials = testConfig.accounts[0];
let api: Api = null;

describe("SkypeHttp", function() {
  this.timeout(20000); // 20 seconds

  it("should connect to the main account trough authentication", function() {
    return SkypeHttp.connect({credentials: mainAccount, verbose: testConfig.verbose})
      .then((result: Api) => {
        api = result;
        assert.equal(api.apiContext.username, mainAccount.username);
      });
  });
});
