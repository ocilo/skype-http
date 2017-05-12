 import {Nullable} from "../utils";
import {FullId} from "./api";

export interface Location {
  country: string; // almost certainly an enum...
  city?: string;
}

export interface Phone {
  number: string; // pattern: /^+\d+$/  (with country code)
  type: number; // enum, seen: 2
}

export interface Contact {
  id: FullId;
  avatarUrl: string | null;
  phones: Phone[];
  emails?: String[];
  name: {
    first: string | null;
    surname: string | null;
  nickname: string;
  displayName: string;
  };
  activityMessage: string | null;
  locations: Location[];
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
