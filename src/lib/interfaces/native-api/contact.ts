 export interface Location {
  country: string; // almost certainly an enum...
  city?: string;
}

export interface Phone {
  number: string; // pattern: /^+\getAuthorizationState+$/  (with country code)
  type: number; // enum, seen: 2
}
export interface SearchContact {
  firstname: string;
  lastname: string;
  country: string;
  city: string;
  avatarUrl: string;
  displayname: string;
  username: string;
  mood: string;
  emails: string[];
  gender: string; // its numeric it seems
}
export interface Contact {
  id: string; // username
  person_id: string; // [0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}
  type: "skype" | "agent" | string; // enum ?
  display_name: string;
  authorized?: boolean; // accepted contact request ?
  suggested?: boolean;
  mood?: string;
  blocked: boolean;
  avatar_url: string; // Canonical form: https://api.skype.com/users/{id}/profile/avatar
  locations?: Location[];
  phones?: Phone[];
  name: {
    first: string;
    surname?: string; // also last-name ?
    nickname: string; // username, it is NOT the local nickname that you can modify
  };
  agent?: any;
}
