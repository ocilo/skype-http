import { assert } from "chai";
import { hmacSha256, int32ToLittleEndianHexString } from "../../lib/utils/hmac-sha256";

describe("int32ToLittleEndianHexString", function () {
  interface Item {
    int32: number;
    expected: string;
  }

  const items: Item[] = [
    {int32: 0x0, expected: "00000000"},
    {int32: 0x1, expected: "01000000"},
    {int32: 0x10, expected: "10000000"},
    {int32: 0x100, expected: "00010000"},
    {int32: 0x1000, expected: "00100000"},
    {int32: 0x12345678, expected: "78563412"},
  ];

  for (const item of items) {
    it(`should return "${item.expected}" for ${item.int32} (0x${item.int32.toString(16)})`, function () {
      const actual: string = int32ToLittleEndianHexString(item.int32);
      assert.equal(actual, item.expected);
    });
  }
});

describe("hmacSha256", function () {
  interface Item {
    input: string;
    id: string;
    key: string;
    expected: string;
  }

  const items: Item[] = [
    {
      input: "1462570297",
      id: "msmsgs@msnmsgr.com",
      key: "Q1P7W2E4J9R8U3S5",
      expected: "5ac181edee7f30db176aaef9a043bf8a",
    },
  ];

  for (const item of items) {
    it(`should return "${item.expected}" for ("${item.input}", "${item.id}", "${item.key}")`, function () {
      const inputBuffer: Buffer = Buffer.from(item.input, "utf8");
      const idBuffer: Buffer = Buffer.from(item.id, "utf8");
      const keyBuffer: Buffer = Buffer.from(item.key, "utf8");
      const actual: string = hmacSha256(inputBuffer, idBuffer, keyBuffer);
      assert.equal(actual, item.expected);
    });
  }
});
