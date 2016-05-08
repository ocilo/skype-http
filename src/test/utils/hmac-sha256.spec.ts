import {assert} from "chai";
import {hmacSha256, int32ToLittleEndianHexString} from "../../lib/utils/hmac-sha256";

describe("int32ToLittleEndianHexString", function () {
  const knownValues = [
    {int32: 0x0, expected: "00000000"},
    {int32: 0x1, expected: "01000000"},
    {int32: 0x10, expected: "10000000"},
    {int32: 0x100, expected: "00010000"},
    {int32: 0x1000, expected: "00100000"},
    {int32: 0x12345678, expected: "78563412"},
  ];

  for (let known of knownValues) {
    it(`should return "${known.expected}" for ${known.int32} (0x${known.int32.toString(16)})`, function () {
      let result: string = int32ToLittleEndianHexString(known.int32);
      assert.equal(result, known.expected);
    });
  }
});

describe("hmacSha256", function () {
  const knownHashes = [
    {
      input: "1462570297",
      id: "msmsgs@msnmsgr.com",
      key: "Q1P7W2E4J9R8U3S5",
      expected: "5ac181edee7f30db176aaef9a043bf8a"
    }
  ];

  for (let known of knownHashes) {
    it(`should return "${known.expected}" for ("${known.input}", "${known.id}", "${known.key}")`, function () {
      let inputBuffer = Buffer.from(String(known.input), "utf8");
      let idBuffer = Buffer.from(String(known.id), "utf8");
      let keyBuffer = Buffer.from(String(known.key), "utf8");

      let result: string = hmacSha256(inputBuffer, idBuffer, keyBuffer);
      assert.equal(result, known.expected);
    });
  }
});
