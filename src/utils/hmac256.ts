import {sha256} from "js-sha256";
import * as bigInt from "big-integer";
import {zeroPad, padRight} from "../utils";

function parseHexInt(hexStr: string): number {
  let result: number = parseInt(hexStr, 16);
  if (isNaN(result)) {
    throw new Error("Unable to parse hexadecimal string " + hexStr);
  }
  return result;
}

const HEX_CHARS = '0123456789abcdef';
function uint32ToHexString(uint32: number): string {
  let uint32 = uint32 % 4294967295; // Math.pow(2, 32) - 1;
  return zeroPad(uint32.toString(16), 8);
}

// TODO: return a bigInt
function uint64Xor(a: number, b: number): number {
  return bigInt(a).xor(b).toJSNumber();
}

// CS64 -> Challenge S... 64 bits ?
// ControlString ?
function cS64_C(pdwData: string[], hash128: bigInt.BigInt): [number, number] {
  const MAX_INT32 = bigInt(2147483647); // Math.pow(2, 31) - 1;

  if ((pdwData.length < 2) || ((pdwData.length & 1) === 1)) {
    return null;
  }

  // e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
  //                                 [CS64_d][CS64_c][CS64_b][CS64_a]

  let CS64_a = bigInt(hash128.shiftRight(0 * 32).and(MAX_INT32));
  let CS64_b = bigInt(hash128.shiftRight(1 * 32).and(MAX_INT32));
  let CS64_c = bigInt(hash128.shiftRight(2 * 32).and(MAX_INT32));
  let CS64_d = bigInt(hash128.shiftRight(3 * 32).and(MAX_INT32));
  let CS64_e = bigInt(242854337);

  let qwDatum = bigInt(0);
  let qwMAC = bigInt(0);
  let qwSum = bigInt(0);

  for (let i = 0; i < pdwData.length; i += 2) {
    qwDatum = bigInt(pdwData[i]);
    qwDatum.multiply(CS64_e).mod(MAX_INT32);

    qwMAC.add(qwDatum);
    qwMAC.multiply(CS64_a).add(CS64_b).mod(MAX_INT32);
    qwSum.add(qwMAC);

    qwMAC.add(bigInt(pdwData[i + 1]));
    qwMAC.multiply(CS64_c).add(CS64_d).mod(MAX_INT32);
    qwSum.add(qwMAC);
  }

  qwMAC.add(CS64_b).mod(MAX_INT32);
  qwSum.add(CS64_d).mod(MAX_INT32);

  return [qwMAC.toJSNumber(), qwSum.toJSNumber()];
}

// TODO: check, shouldn't buffer and appId be a buffer ?
/**
 * Computes a 128-bits Hash-based message authentication code (HMAC)
 * with the SHA256 hash function.
 * @param challenge
 * @param appId
 * @param key
 * @returns {string}
 */
export function getHMAC128(challenge: string, appId: string, key: any) {
  let clearText: string = challenge + appId;
  const remainderTo8 = clearText.length % 8 > 0;
  if (remainderTo8 > 0) { // Ensure that the number of chars is a multiple of 8 (8 chars = 256 bits)
    const nextMultipleOf8 = clearText.length - remainderTo8 + 8;
    clearText = padRight(clearText, clearText.length + remainder, "0");
  }

  // Build an array of 32 bits (4 chars) from the clearText
  let pClearText: number[] = [];
  for (let i = 0; i < clearText.length; i += 4) {
    let curVal: number = 0;
    curVal += clearText.charCodeAt(i);
    curVal += clearText.charCodeAt(i + 1) * 256;
    curVal += clearText.charCodeAt(i + 2) * 65536;
    curVal += clearText.charCodeAt(i + 3) * 16777216;
    pClearText.push(curVal);
  }

  let hash: string = sha256(challenge + key);
  let sha256Hash = bigInt(hash, 16);
  let truncatedHash = sha256Hash.and(bigInt(1).shiftLeft(128).minus(1));

  let macHash = cS64_C(pClearText, truncatedHash);
  var a = int64Xor(sha256Hash[0], macHash[0]);
  var b = int64Xor(sha256Hash[1], macHash[1]);
  var c = int64Xor(sha256Hash[2], macHash[0]);
  var d = int64Xor(sha256Hash[3], macHash[1]);

  return uint32ToHexString(a) + uint32ToHexString(b) + uint32ToHexString(c) + uint32ToHexString(d);
}
