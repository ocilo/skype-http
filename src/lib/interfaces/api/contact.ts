import {Nullable} from "../utils";

export interface Location {
  country: string; // almost certainly an enum...
  city?: string;
}

export interface Phone {
  number: string; // pattern: /^+\d+$/  (with country code)
  type: number; // enum, seen: 2
}

export interface Contact {
  id: string; // username
  person_id: string; // [0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}
  type: "skype" | "agent" | string; // enum ? maybe "facebook" ?
  display_name: "string";
  authorized: boolean; // accepted contact request ?
  blocked: boolean;
  avatar_url: string; // Canonical form: https://api.skype.com/users/{id}/profile/avatar
  locations?: Location[];
  phones?: Phone[];
  name: {
    first: string;
    surname?: string; // also last-name ?
    nickname: string; // username, it is NOT the local nickname that you can modify
  };
}

export interface Profile {
  fistname: string;
  lastname: string;
  birthday: Nullable<any>;
  language: "en" | string; // enum ?
  country: "us" | string; // enum ?
  province: Nullable<any>;
  city: Nullable<any>;
  homepage: Nullable<any>;
  about: Nullable<any>;
  emails: any[];
  phoneMobile: Nullable<any>;
  phoneHome: Nullable<any>;
  phoneOffice: Nullable<any>;
  mood: Nullable<any>;
  richMood: Nullable<any>;
  avatarUrl: Nullable<any>;
  username: string;
}
