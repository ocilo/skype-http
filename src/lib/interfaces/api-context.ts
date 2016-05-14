import {CookieJar} from "request";

export interface ApiContext {
  username: string;
  cookieJar: CookieJar;
  skypeToken: SkypeToken;
  registrationToken: RegistrationToken;
}

export interface SkypeToken {
  value: string;
  expirationDate: Date;
}

export interface RegistrationToken {
  value: string;
  expirationDate: Date;
  endpointId: string;
  host: string;
  raw?: string;
}
