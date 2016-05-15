import Incident from "incident";
import * as _ from "lodash";
import {Dictionary} from "./interfaces/utils";

// TODO: get rid of this function
export function throwError(message: any) {
  console.error("Something went wrong!" + message); // FIXME
}

/**
 * Returns the current timestamp in seconds.
 * @returns {number}
 */
export function getCurrentTime(): number {
  return Math.floor((new Date().getTime()) / 1000);
}

/**
 * Adds zeros to the left of the string representation of number until its length is equal to len.
 * @param number
 * @param len
 * @returns {string}
 */
export function zeroPad(number: number | string, len: number): string {
  return padLeft(number, len, "0");
}

export function padLeft(str: any, len: number, char: string = " "): string {
  let result: string = String(str);
  const missing: number = len - result.length;
  if (missing > 0) {
    result = stringFromChar(char, missing) + str;
  }
  return result;
}

export function padRight(str: any, len: number, char: string = " "): string {
  let result: string = String(str);
  const missing: number = len - result.length;
  if (missing > 0) {
    result = str + stringFromChar(char, missing);
  }
  return result;
}

export function stringFromChar(char: string, count: number): string {
  return new Array(count - 1).join(char);
}

export function getTimezone() {
  let sign: string;
  let timezone = new Date().getTimezoneOffset() * (-1);
  if (timezone >= 0) {
    sign = "+";
  } else {
    sign = "-";
  }

  timezone = Math.abs(timezone);
  let minutes = timezone % 60;
  let hours = (timezone - minutes) / 60;

  return `${sign}${zeroPad(minutes, 2)}|${zeroPad(hours, 2)}`;
}

const HTTP_HEADER_SEPARATOR = ";";
const HTTP_HEADER_OPERATOR = "=";

export function stringifyHeaderParams (params: Dictionary<string>) {
  return _.map(params, (value, key) => {
    return `${key.replace(/%20/gm, "+")}=${value.replace(/%20/gm, "+")}`;
  }).join(HTTP_HEADER_SEPARATOR + " "); // The space after the separator is important, otherwise Skype is unable to parse the header
}

// TODO: check with skype-web-reversed
export function parseHeaderParams (params: string): Dictionary<string> {
  let result: Dictionary<string> = {};

  params
    .split(HTTP_HEADER_SEPARATOR)
    .forEach((paramString) => {
      paramString = _.trim(paramString);
      const operatorIdx = paramString.indexOf(HTTP_HEADER_OPERATOR);
      let key: string, val: string;
      if (operatorIdx >= 1 && operatorIdx + HTTP_HEADER_OPERATOR.length < paramString.length - 1) { // Ensure that the operator is in the middle of the string
        key = _.trim(paramString.substring(0, operatorIdx));
        val = _.trim(paramString.substring(operatorIdx + HTTP_HEADER_OPERATOR.length));
      } else {
        key = val = _.trim(paramString);
      }
      if (key.length > 0) {
        result[key] = val;
      }
    });

  return result;
}

export {hmacSha256 as getHMAC128} from "./utils/hmac-sha256";
