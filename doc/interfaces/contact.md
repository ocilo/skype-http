# Contact

````ts
interface Contact {
  id: string; // username
  person_id: string; // [0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}
  type: "skype" | string; // enum ?
  display_name: "string";
  authorized: boolean; // accepted contact request ?
  blocked: boolean;
  avatar_url: string; // Canonical form: https://api.skype.com/users/{id}/profile/avatar
  locations?: Location[];
  phones?: Phone[];
  name: {
    first: string;
    surname?: string; // also last-name ?
    nickname: string; // username, this is NOT the local nickname that you can modify
  };
}

interface Location {
  country: string; // almost certainly an enum...
  city?: string;
}

interface Phone {
  number: string; // pattern: /^+\d+$/  (with country code)
  type: number; // enum ? seen: [2]
}
````
