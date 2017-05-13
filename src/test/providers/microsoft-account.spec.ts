import {assert} from "chai";
import {MemoryCookieStore} from "tough-cookie";
import {SkypeToken} from "../../lib/interfaces/api/context";
import {
  login,
  LoginOptions,
  scrapLivePpftKey,
  scrapLiveToken,
  scrapSkypeTokenResponse,
  SkypeTokenResponse,
} from "../../lib/providers/microsoft-account";
import {requestIo} from "../../lib/request-io";
import testConfig from "../test-config";
import {readTextTestResource} from "../test-resources";

describe("Microsoft Account provider", function (this: Mocha.ISuiteCallbackContext) {
  describe.skip("login", async function (this: Mocha.ISuiteCallbackContext) {
    this.timeout(10 * 60 * 1000); // 10 minutes

    it("Should get a skype token for the main test account", async function () {
      const options: LoginOptions = {
        credentials: {
          login: testConfig.credentials.username,
          password: testConfig.credentials.password,
        },
        httpIo: requestIo,
        cookies: new MemoryCookieStore(),
      };
      const skypeToken: SkypeToken = await login(options);
      assert.property(skypeToken, "value");
      assert.property(skypeToken, "expirationDate");
      assert.isString(skypeToken.value);
      assert.instanceOf(skypeToken.expirationDate, Date);
    });
  });

  describe("scrapLivePpftKey", function () {
    interface Item {
      file: string;
      expectedPpftKey: string;
    }

    const items: Item[] = [
      {
        file: "login/sample3/03-get-login-skype-res.html",
        // tslint:disable-next-line:max-line-length
        expectedPpftKey: "DaXnH6igQ5hfj6IcHfvjNw3KJOikvnnUy41dLwniJp4XxlPzAh!EnnnhpRyXYNBk9bj7RMGIYbCzkQyU*xE!VT0FUc*WdycNMBFAK!HuIgXFDALW*KGQN!6FADsZgOb!qJmu9d29To!OOETpe74X93L2L6GRJ5GS0V8!trGJj6X95zr7SUwvsIDxtS*iEihnC8!8Xz!vEJzJk6cSwDLxBbqagBbEh71FuzqJThYMc3jnc6LYpNsKTvSvq6mN7rSOMVX6RDao6nGt4wvU5YeiQyE$",
      },
      {
        file: "login/sample4/res.html",
        // tslint:disable-next-line:max-line-length
        expectedPpftKey: "DdMW1J1ZaSCzux2dfnrhLJje8WVm6VGdNu8YKzBpAKUPNFY7bxdxq2!PCPxuPvzi2BlI6y3pMNEde2jajBB3Dp2WjFITJvc9pF5Kg2yJjMiGViWTiRd*BbVyEzo4MCWFIdnhQkTKi2U7trodsZ7z0ZZSQWRu395!QeRgN1JtD5NI1wjOx19WYzMyI8EX4FWm6m7LgwnqiAkibOBeotw3Adl3REmR94fXDiYkc5C6UUeAs4ZIM10FhshL1AUR2RymPA$$",
      },
      {
        file: "login/sample5/res.html",
        // tslint:disable-next-line:max-line-length
        expectedPpftKey: "Dchq*dhBHdIGxQR*wMUdeH3dJQjQ9cOG9kVrBXyR6VGLuNHQC98hipkpPTn8oocoAs2odfh1AzOgcgkddPGgiOC!uCnfk0Qe5OurJq6finsImsC1HnrjMbb0M0isr2ta0LE*BYVbjiE!LIo9urNM*h3Iozpss2RLOsTvFVGhWxc*QZav4Arog9rwYRqQmhWwE*o8eTPQ52B!ULYFBr69ZH8HZWVsi*TVScgQqxneHNfXzEMluAeJMCLe568upVQA9g$$",
      },
      {
        file: "login/sample6/res.html",
        // tslint:disable-next-line:max-line-length
        expectedPpftKey: "DWgwycaM3YOoZNZGblyRZdZNQMGy6G02oEc3yFJzQrkHdws9ex7auD!4G7DEYjg7F8g2hgFkbN!Hi0!oIbX6YXV3UCYA1wg3nZIYw*80UGdDbMSCkiw7FSvwql0DDu0pibcPYuCZfGuiwsX47wAHU2lfrnqe01kFgiYO!RBBuHvwy3fwvgyfOtHE7dDh!MkgduaXrb7Ytsz*vB4CY!o4DJAZ57MISLGyg0JZhXhd7esnCk6bCzcJcZwkUdY2jJeNzw$$",
      },
      {
        file: "login/sample7/03-res.html",
        // tslint:disable-next-line:max-line-length
        expectedPpftKey: "DZFvyrrWw6ndcWno9OQFNJrxUUGGkQsohrR8uVMYwSDfq1bw3zILntsnREJRhRdJeCnAbLbyx0VylQq3VP1A6roxfDj0dcGoVr4DxmxN2PNGoxM1YbnFa6QAiiX*uTaNjorzDX5Gp9b8FnH82SWMpxjN!yH*tksK36gyc2F!43J!nV50PeUvNFs9Dm3HSdupgN4f3BDMnfPZQf69r*3AYs0ZvUBgsux9ySdEQcZh8vnNjOnz5IWOhoZLizw7cDmtMVADHm097e9ltRt61jqxErQ$",
      },
    ];

    for (const item of items) {
      it(`file: ${JSON.stringify(item.file)}`, function () {
        const html: string = readTextTestResource(item.file);
        const actualPpftKey: string = scrapLivePpftKey(html);
        assert.strictEqual(actualPpftKey, item.expectedPpftKey);
      });
    }
  });

  describe("scrapLiveToken", function () {
    interface Item {
      file: string;
      expectedLiveToken: string;
    }

    const items: Item[] = [
      {
        file: "login/sample8/07-res2.html",
        // tslint:disable-next-line:max-line-length
        expectedLiveToken: "EgD5AQMAAAAEgAAADAABZOLMZSL5ujbZAell5FiUa6uxK8Eb4c4LW2/hEKtbBOCfxJ/rGHKJrazxk5ea1CPvuJkA9EYzXl/M7XhqRtXL6C+BaFH3lh0xxkwwnR22gY5yjB1kqfotcIoA/kt8cSalUlg2XkKbCc2KtiXlqgqH0AxvEKZuQCUsZFIxd4g5FebibYEtUOEATTwhvP6vzb1DFisjaIvoKEqOvbCsC7rWDeK/bBUswkuMi0K7RmE3wqWxaZBu9KETIHz0H2iKx63+4hd8BQHy01JGWnt/Vyg9lYX94Rre9JoetQ7TIQ/nukiHfhsbzSqbdXubmNlpeebsR6GizkVki8KGagqE6vVnaegAcQDoAP2/AwDhM7rmHXxxWB18cViqeQQAChEgQBAAAD4AAAAAAAABAAAAAAAAAAAAAAAAAAAAVUAgBEEACERlbXVyZ29zAAhEZW11cmdvcwAAAAAAAAAAAAAAAAAAAAAAAB/mZIhk+8NnAAAdfHFYHiPoWAAAAAAAAAAAAAAAAA0ANzkuOTQuMTMuMTE1AAQBAAAAAAAAAAAAAAAAAQQAAAAAAAAAAAAAAAAAAADaVSZ6F3OGYwAAAAAAAAAAAAAAAAAAAAAAAA0AZGVtdXJnb3MubmV0AAAAAAAAAAAAAAAAAAAAAAAAAA==",
      },
    ];

    for (const item of items) {
      it(`file: ${JSON.stringify(item.file)}`, function () {
        const html: string = readTextTestResource(item.file);
        const actualLiveToken: string = scrapLiveToken(html);
        assert.strictEqual(actualLiveToken, item.expectedLiveToken);
      });
    }
  });

  describe("scrapSkypeToken", function () {
    interface Item {
      file: string;
      expectedSkypeToken: string;
      expectedExpiresIn: number;
    }

    const items: Item[] = [
      {
        file: "login/sample9/11-req3.html",
        // tslint:disable-next-line:max-line-length
        expectedSkypeToken: "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IjEyIn0.eyJpYXQiOjE0ODM4MzQzODYsImV4cCI6MTQ4MzkyMDc4Niwic2t5cGVpZCI6ImRlbXVyZ29zLm5ldCIsInNjcCI6OTU4LCJjc2kiOiIwIiwiY2lkIjoiNjRmYmMzNjcxZmU2NjQ4OCIsImFhdCI6MTQ4MzgzNDMxNX0.ApFT6uA5e1VxBQ9tW7YOwIw_N0__YPwtVmqS0afA7Dx9SQGmpHTJCglOIUYYEjlG6ygJoAMTbItXOkDVcgZ86Dckfmy4bCpw9-gpvFxHNd11Pwe7SnS40mnTX_nyGy_jfmDMPkw2shrEZ4mLiznu5v7RuT9JAD0JsgjoFvFfzya17CL1CSK6B8WxJ0iIn_M8RoOogW5oEJUiYx6Q",
        expectedExpiresIn: 86400,
      },
    ];

    for (const item of items) {
      it(`file: ${JSON.stringify(item.file)}`, function () {
        const html: string = readTextTestResource(item.file);
        const actualSkypeToken: SkypeTokenResponse = scrapSkypeTokenResponse(html);
        assert.strictEqual(actualSkypeToken.skypetoken, item.expectedSkypeToken);
        assert.strictEqual(actualSkypeToken.expires_in, item.expectedExpiresIn);
      });
    }
  });
});
