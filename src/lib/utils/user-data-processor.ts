import _ from "lodash";

// github:demurgos/skype-web-reversed -> utils/people/userDataProcessor.js
export function sanitizeXml(xmlString: string) {
  return _.isString(xmlString) ? _.escape(xmlString) : "";
}

// github:demurgos/skype-web-reversed -> utils/people/userDataProcessor.js
export function sanitize(str: string) {
  return String(str); // TODO!
  // if (_.isString(str)) {
  //   var t = str,
  //     u = i.build(r);
  //   if (str.match(o) === null) {
  //     var a = s.escapeIncomingHTML(str);
  //     t = u.encode(a, !1);
  //   }
  //   return s.escapeIncomingHTML(u.decode(t));
  // }
  // return "";
}
