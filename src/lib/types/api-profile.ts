import { AnyType } from "kryo/types/any";
import { ArrayType } from "kryo/types/array";
import { DocumentType } from "kryo/types/document";
import { NullType } from "kryo/types/null";
import { TryUnionType } from "kryo/types/try-union";
import { Ucs2StringType } from "kryo/types/ucs2-string";
import { $Url, Url } from "./url";
/*  Codln't figure out how to por this code, mainly how to make TryUnionType work with NullType

import { VersionedType } from "kryo/core";
function nullable(type: VersionedType<any, any, any, any>): VersionedType<any, any, any, any> {
  return new TryUnionType({
    variants: [
      new NullType(),
      type,
    ],
  });
}
*/
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
  avatarUrl: any | null;
  username: string;
}

export const $ApiProfile: DocumentType<ApiProfile> = new DocumentType<ApiProfile>({
  properties: {
    firstname: {type: new Ucs2StringType({maxLength: Infinity})},
    lastname: {type: new Ucs2StringType({maxLength: Infinity})},
    birthday: {type: new AnyType()},
    gender: {type: new AnyType()},
    language: {type: new AnyType()},
    country: {type: new AnyType()},
    province: {type: new AnyType()},
    city: {type: new AnyType()},
    homepage: {type: new AnyType()},
    about: {type: new AnyType()},
    emails: {type: new ArrayType({itemType: new Ucs2StringType({maxLength: Infinity}), maxLength: Infinity})},
    jobtitle: {type: new AnyType()},
    phoneMobile: {type: new AnyType()},
    phoneHome: {type: new AnyType()},
    phoneOffice: {type: new AnyType()},
    mood: {type: new AnyType()},
    richMood: {type: new AnyType()},
    avatarUrl: {type: new AnyType()},
    username: {type: new Ucs2StringType({maxLength: Infinity})},
  },
  noExtraKeys: true,
});
