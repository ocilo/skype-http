import { CookieJar } from "request";

export interface Context {
  username: string;
  cookieJar: CookieJar;
  cookieStore: any;
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
