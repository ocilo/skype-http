import * as assert from "assert";
import {hmacSha256} from "../utils/hmac-sha256";

let input = Buffer.from("1462570297", "utf8");
let appId = Buffer.from("msmsgs@msnmsgr.com", "utf8");
let appKey = Buffer.from("Q1P7W2E4J9R8U3S5", "utf8");

let result: string = hmacSha256(input, appId, appKey);

assert.deepStrictEqual(result, "5ac181edee7f30db176aaef9a043bf8a");
