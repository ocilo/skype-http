import bigInt from "big-integer";
import sha256 from "js-sha256";

const HEX_CHARS: string = "0123456789abcdef";
const MAX_INT32: number = 0x7fffffff; // Math.pow(2, 31) - 1 (the leading sign bit is 0);

/**
 * Creates an uint32 array by copying and shifting the uint8 of the argument by groups of four.
 * @param uint8Array Its length has to be a multiple of 4
 * @returns {Uint32Array}
 */
export function uint8ArrayToUint32Array(uint8Array: Uint8Array): Uint32Array {
  const len: number = uint8Array.length;
  if (len % 4 !== 0) {
    throw new Error("uint8Array.length must be a multiple of 4");
  }
  const uint32Array: Uint32Array = new Uint32Array(len / 4);
  for (let i: number = 0, j: number = 0; i < len; i += 4, j++) {
    uint32Array[j] += uint8Array[i] * (1 << 0);
    uint32Array[j] += uint8Array[i + 1] * (1 << 8);
    uint32Array[j] += uint8Array[i + 2] * (1 << 16);
    uint32Array[j] += uint8Array[i + 3] * (1 << 24);
  }
  return uint32Array;
}

/**
 * Returns a zero-padded (8 chars long) hex-string of the little-endian representation the argument.
 *
 * The relation between the characters of `.toString(16)` (big-endian) is:
 * .toString(16):                <76543210>
 * int32ToLittleEndianHexString: <10325476>
 *
 * Example:
 * .toString(16):                ed81c15a
 * int32ToLittleEndianHexString: 5ac181ed
 *
 * @param int32
 * @returns {string}
 */
export function int32ToLittleEndianHexString(int32: number): string {
  let result: string = "";
  for (let i: number = 0; i < 4; i++) {
    result = result + HEX_CHARS.charAt((int32 >> i * 8 + 4) & 15);
    result = result + HEX_CHARS.charAt((int32 >> i * 8) & 15);
  }
  return result;
}

// tslint:disable-next-line:max-line-length
// https://github.com/Demurgos/skype-web-reversed/blob/fe3931c4f091af06f6b2c2e8c14608aebf87448b/skype/latest/decompiled/fullExperience/rjs%24%24msr-crypto/lib/sha256Auth.js#L62
/**
 * Returns 64 bits (an Uint32 array of length 2) computed from the challengeParts and hashParts.
 * This is retrieved from the source of Skype's web application.
 *
 * See _cS64_C in sha256Auth.js at skype-web-reversed for the original implementation:
 *
 * @param challengeParts
 * @param hashParts An Uint32Array of length 4
 * @returns {null}
 */
function checkSum64(challengeParts: Uint32Array, hashParts: Uint32Array): Uint32Array {
  if (challengeParts.length < 2 || challengeParts.length % 2 !== 0) {
    throw new Error("Invalid parameters");
  }
  const MAGIC: number = 0x0e79a9c1; // A magic constant
  const HASH_0: number = hashParts[0] & MAX_INT32; // Remove the sign bit
  const HASH_1: number = hashParts[1] & MAX_INT32;
  const HASH_2: number = hashParts[2] & MAX_INT32;
  const HASH_3: number = hashParts[3] & MAX_INT32;

  let low: bigInt.BigInteger = bigInt.zero; // 0-31 bits of the result
  let high: bigInt.BigInteger = bigInt.zero; // 32-63 bits of the result
  let temp: bigInt.BigInteger;

  const len: number = challengeParts.length;
  for (let i: number = 0; i < len; i += 2) {
    temp = bigInt(challengeParts[i]).multiply(MAGIC).mod(MAX_INT32);
    low = low.add(temp).multiply(HASH_0).add(HASH_1).mod(MAX_INT32);
    high = high.add(low);

    temp = bigInt(challengeParts[i + 1]);
    low = low.add(temp).multiply(HASH_2).add(HASH_3).mod(MAX_INT32);
    high = high.add(low);
  }

  low = low.add(HASH_1).mod(MAX_INT32);
  high = high.add(HASH_3).mod(MAX_INT32);

  return new Uint32Array([low.toJSNumber(), high.toJSNumber()]);
}

// tslint:disable-next-line:max-line-length
// https://github.com/Demurgos/skype-web-reversed/blob/fe3931c4f091af06f6b2c2e8c14608aebf87448b/skype/latest/decompiled/fullExperience/rjs$$msr-crypto/lib/sha256Auth.js#L48
/**
 * This computes the Hash-based message authentication code (HMAC) of the input buffer by using
 * SHA-256 and the checkSum64 function.
 * This is retrieved from the source of Skype's web application.
 *
 * See getMacHash in sha256Auth.js at skype-web-reversed for the original implementation
 * tslint:disable-next-line:max-line-length
 *
 * @param input
 * @param productId
 * @param productKey
 * @returns {string} An hexadecimal 32-chars long string
 */
export function hmacSha256(input: Buffer, productId: Buffer, productKey: Buffer): string {
  let message: Buffer = Buffer.concat([input, productId]);
  // adjust length to be a multiple of 8 with right-padding of character '0'
  if (message.length % 8 !== 0) {
    const fix: number = 8 - (message.length % 8);
    const padding: Buffer = Buffer.alloc(fix, "0", "utf8");
    padding.fill("0");
    message = Buffer.concat([message, padding]);
  }

  const challengeParts: Uint32Array = uint8ArrayToUint32Array(message);

  const sha256HexString: string = sha256.sha256(Buffer.concat([input, productKey]));
  const sha256Buffer: Buffer = Buffer.from(sha256HexString, "hex");

  // Get half of the sha256 as 4 uint32
  const sha256Parts: Uint32Array = uint8ArrayToUint32Array(sha256Buffer.slice(0, 16));

  const checkSumParts: Uint32Array = checkSum64(challengeParts, sha256Parts);

  sha256Parts[0] ^= checkSumParts[0];
  sha256Parts[1] ^= checkSumParts[1];
  sha256Parts[2] ^= checkSumParts[0];
  sha256Parts[3] ^= checkSumParts[1];

  return int32ToLittleEndianHexString(sha256Parts[0])
    + int32ToLittleEndianHexString(sha256Parts[1])
    + int32ToLittleEndianHexString(sha256Parts[2])
    + int32ToLittleEndianHexString(sha256Parts[3]);
}
