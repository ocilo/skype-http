import { VersionedType } from "kryo/types";
import { ArrayType } from "kryo/types/array";
import { DocumentType } from "kryo/types/document";
import { JsonType } from "kryo/types/json";
import { NullType } from "kryo/types/null";
import { TryUnionType } from "kryo/types/try-union";
import { Ucs2StringType } from "kryo/types/ucs2-string";
import { $Url, Url } from "./url";

function nullable(type: VersionedType<any, any, any, any>): VersionedType<any, any, any, any> {
  return new TryUnionType({
    variants: [
      new NullType(),
      type,
    ],
  });
}

/**
 * Represents a profile returned by the general API (api.skype.com)
 *
 * Examples:
 * ```
 * {
 *   "firstname": "Bob",
 *   "lastname": null,
 *   "birthday": null,
 *   "gender": null,
 *   "language": null,
 *   "country": null,
 *   "province": null,
 *   "city": null,
 *   "homepage": null,
 *   "about": null,
 *   "emails": [
 *     "bob@example.com"
 *   ],
 *   "jobtitle": null,
 *   "phoneMobile": null,
 *   "phoneHome": null,
 *   "phoneOffice": null,
 *   "mood": null,
 *   "richMood": null,
 *   "avatarUrl": "https://avatar.skype.com/v1/avatars/bob?auth_key=-2078211408",
 *   "username": "bob"
 * }
 * ```
 *
 * ```
 * {
 *   "firstname": "Pavel",
 *   "lastname": "Georgiy",
 *   "birthday": null,
 *   "gender": null,
 *   "language": null,
 *   "country": null,
 *   "province": null,
 *   "city": null,
 *   "homepage": null,
 *   "about": null,
 *   "emails": [
 *     "pavel.georgiy@yandex.ru"
 *   ],
 *   "jobtitle": null,
 *   "phoneMobile": null,
 *   "phoneHome": null,
 *   "phoneOffice": null,
 *   "mood": null,
 *   "richMood": null,
 *   "avatarUrl": null,
 *   "username": "live:pavel.georgiy"
 * }
 * ```
 *
 */
export interface ApiProfile {
  firstname: string;
  lastname: string | null;
  birthday: any | null;
  gender: any | null;
  language: any | null;
  country: any | null;
  province: any | null;
  city: any | null;
  homepage: any | null;
  about: any | null;
  emails: string[];
  jobtitle: any | null;
  phoneMobile: any | null;
  phoneHome: any | null;
  phoneOffice: any | null;
  mood: any | null;
  richMood: any | null;
  avatarUrl: Url;
  username: string;
}

export const $ApiProfile: DocumentType<ApiProfile> = new DocumentType<ApiProfile>({
  properties: {
    firstname: {type: new Ucs2StringType({maxLength: Infinity})},
    lastname: {type: nullable(new Ucs2StringType({maxLength: Infinity}))},
    birthday: {type: new JsonType()},
    gender: {type: new JsonType()},
    language: {type: new JsonType()},
    country: {type: new JsonType()},
    province: {type: new JsonType()},
    city: {type: new JsonType()},
    homepage: {type: new JsonType()},
    about: {type: new JsonType()},
    emails: {type: new ArrayType({itemType: new Ucs2StringType({maxLength: Infinity}), maxLength: Infinity})},
    jobtitle: {type: new JsonType()},
    phoneMobile: {type: new JsonType()},
    phoneHome: {type: new JsonType()},
    phoneOffice: {type: new JsonType()},
    mood: {type: new JsonType()},
    richMood: {type: new JsonType()},
    avatarUrl: {type: nullable($Url)},
    username: {type: new Ucs2StringType({maxLength: Infinity})},
  },
  ignoreExtraKeys: true,
});
