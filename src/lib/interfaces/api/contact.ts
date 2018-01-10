import { Location } from "../../types/location";
import { FullId } from "./api";

export interface Phone {
  number: string; // pattern: /^+\d+$/  (with country code)
  type: number; // enum, seen: 2
}

export interface Contact {
  // TODO: Use MriKey
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
  birthday: any | null;
  language: "en" | string; // enum ?
  country: "us" | string; // enum ?
  province: any | null;
  city: any | null;
  homepage: any | null;
  about: any | null;
  emails: any[];
  phoneMobile: any | null;
  phoneHome: any | null;
  phoneOffice: any | null;
  mood: any | null;
  richMood: any | null;
  avatarUrl: any | null;
  username: string;
}
