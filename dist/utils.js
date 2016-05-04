"use strict";
function throwError(message) {
    console.error('Something went wrong!' + message);
}
exports.throwError = throwError;
function getCurrentTime() {
    return (new Date().getTime()) / 1000;
}
exports.getCurrentTime = getCurrentTime;
function zeroPad(number, len) {
    return padLeft(number, len, "0");
}
exports.zeroPad = zeroPad;
function padLeft(str, len, char) {
    if (char === void 0) { char = " "; }
    var result = String(str);
    var missing = len - result.length;
    if (missing > 0) {
        result = stringFromChar(char, missing) + str;
    }
    return result;
}
exports.padLeft = padLeft;
function padRight(str, len, char) {
    if (char === void 0) { char = " "; }
    var result = String(str);
    var missing = len - result.length;
    if (missing > 0) {
        result = str + stringFromChar(char, missing);
    }
    return result;
}
exports.padRight = padRight;
function stringFromChar(char, count) {
    return new Array(count - 1).join(char);
}
exports.stringFromChar = stringFromChar;
function getTimezone() {
    var sign;
    var timezone = new Date().getTimezoneOffset() * (-1);
    if (timezone >= 0) {
        sign = "+";
    }
    else {
        sign = "-";
    }
    timezone = Math.abs(timezone);
    var minutes = timezone % 60;
    var hours = (timezone - minutes) / 60;
    return "" + sign + zeroPad(minutes, 2) + "|" + zeroPad(hours, 2);
}
exports.getTimezone = getTimezone;
//# sourceMappingURL=utils.js.map