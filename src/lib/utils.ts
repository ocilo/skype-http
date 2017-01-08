import * as _ from "lodash";
import {Dictionary} from "./interfaces/utils";

/**
 * Returns the number of seconds since epoch.
 *
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
  // TODO: count+1 ?
  return new Array(count - 1).join(char);
}

export function getTimezone(): string {
  let sign: string;
  const timezone: number = (new Date()).getTimezoneOffset() * (-1);
  if (timezone >= 0) {
    sign = "+";
  } else {
    sign = "-";
  }

  const absTmezone: number = Math.abs(timezone);
  const minutes: number = absTmezone % 60;
  const hours: number = (absTmezone - minutes) / 60;

  return `${sign}${zeroPad(hours, 2)}|${zeroPad(minutes, 2)}`;
}

const HTTP_HEADER_SEPARATOR: string = ";";
const HTTP_HEADER_OPERATOR: string = "=";

export function stringifyHeaderParams (params: Dictionary<string>) {
  const headerPairs: string[] = _.map(params, (value: string, key: string) => {
    if (value === undefined) {
      throw new Error(`Undefined value for the header: ${key}`);
    }
    return `${key.replace(/%20/gm, "+")}=${value.replace(/%20/gm, "+")}`;
  });

  // The space after the separator is important, otherwise Skype is unable to parse the header
  return headerPairs.join(HTTP_HEADER_SEPARATOR + " ");
}

// TODO: check with skype-web-reversed
export function parseHeaderParams (params: string): Dictionary<string> {
  const result: Dictionary<string> = {};

  params
    .split(HTTP_HEADER_SEPARATOR)
    .forEach((paramString) => {
      paramString = _.trim(paramString);
      const operatorIdx: number = paramString.indexOf(HTTP_HEADER_OPERATOR);
      let key: string;
      let val: string;
      // Ensure that the operator is not at the start or end of the parameters string
      if (1 <= operatorIdx && operatorIdx + HTTP_HEADER_OPERATOR.length < paramString.length - 1) {
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
