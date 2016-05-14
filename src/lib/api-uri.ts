/**
 * Returns an URI origin like: "https://host.com"
 */
function getOrigin (host: string) {
  return "https://" + host;
}

function get (host: string, path: string) {
  return getOrigin(host) + path;
}

function getV1 (host: string, path: string) {
  return getOrigin(host) + "/v1" +  path;
}

export function getEndpoints (host: string) {
  return getV1(host, "/users/ME/endpoints");
}

export function getSubscriptions (host: string) {
  return getV1(host, "/users/ME/endpoints/SELF/subscriptions");
}
