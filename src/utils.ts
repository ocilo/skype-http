// TODO: get rid of this function
export function throwError(message: any) {
    console.error('Something went wrong!' + message); //FIXME
}

/**
 * Returns the current timestamp in seconds.
 * @returns {number}
 */
export function getCurrentTime(): number {
  return (new Date().getTime()) / 1000;
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

export function  getTimezone() {
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
