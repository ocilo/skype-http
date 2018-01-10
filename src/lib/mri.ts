// tslint:disable:max-line-length
/**
 * This module handles MRI keys
 *
 * MRI may stand for MSN Resource Identifier (open an issue if you have a better idea).
 *
 * An MRI key is a string of the format: `${type}:${id}` where `id` can be a string of (at least)
 * ascii letters and digits (it cannot start by `\d+:`) and `type` is a decimal code.
 *
 * Examples:
 * - `1:bob`
 * - `4:+15553485`
 * - `8:bob`
 * - `8:guest:bob`
 * - `8:live:bob`
 *
 * @see https://github.com/demurgos/skype-web-reversed/tree/bb30da685fb7d2d06f1ba740283d6cbbaeb2c502/skype/latest/decompiled/fullExperience/rjs%24%24swx-mri/lib
 */
// tslint:enable

import { Incident } from "incident";

/**
 * Represents a well-formed MRI key.
 */
export type MriKey = string;

/**
 * Represents a parsed MRI key
 */
export interface ParsedMriKey {
  /**
   * MRI type.
   */
  type: MriType;

  /**
   * MRI id, cannot begin by `\d+:`.
   */
  id: string;
}

export enum MriType {
  Agent = "agent",
  Lync = "lync",
  Msn = "msn",
  Skype = "skype",
  /**
   * Public switched telephone network
   */
  Pstn = "pstn",

  /**
   * This is not the official name (but it is likely).
   * This MRI type was added to properly handle the type code `19`.
   */
  GroupConversation = "group_conversation",
}

/**
 * Represents a valid MRI type code.
 *
 * @internal
 */
export type MriTypeCode = "1" | "2" | "4" | "8" | "19" | "28";

const MRI_TYPE_TO_TYPE_CODE: Map<MriType, MriTypeCode> = new Map<MriType, MriTypeCode>([
  [MriType.Agent, "28"],
  [MriType.Lync, "2"],
  [MriType.Msn, "1"],
  [MriType.Skype, "8"],
  [MriType.Pstn, "4"],
  [MriType.GroupConversation, "19"],
]);

const MRI_TYPE_FROM_TYPE_CODE: Map<MriTypeCode, MriType> = reverseMap(MRI_TYPE_TO_TYPE_CODE);

/**
 * Represents a valid MRI type name.
 *
 * @internal
 */
export type MriTypeName = "agent" | "lync" | "msn" | "skype" | "pstn" | "group_conversation";

const MRI_TYPE_TO_TYPE_NAME: Map<MriType, MriTypeName> = new Map<MriType, MriTypeName>([
  [MriType.Agent, "agent"],
  [MriType.Lync, "lync"],
  [MriType.Msn, "msn"],
  [MriType.Skype, "skype"],
  [MriType.Pstn, "pstn"],
  [MriType.GroupConversation, "group_conversation"],
]);

const MRI_TYPE_FROM_TYPE_NAME: Map<MriTypeName, MriType> = reverseMap(MRI_TYPE_TO_TYPE_NAME);

// TODO: Move outside of this module
function reverseMap<K, V>(source: Map<K, V>): Map<V, K> {
  const result: Map<V, K> = new Map();
  for (const [key, value] of source.entries()) {
    if (result.has(value)) {
      throw new Incident("DuplicateValue", {map: source});
    }
    result.set(value, key);
  }
  return result;
}

/**
 * Converts an MRI type to the corresponding MRI type code.
 *
 * @param type The MRI type.
 * @return The corresponding MRI type code.
 * @internal
 */
export function mriTypeToTypeCode(type: MriType): MriTypeCode {
  const result: MriTypeCode | undefined = MRI_TYPE_TO_TYPE_CODE.get(type);
  if (result === undefined) {
    throw new Incident("UnknownMriType", {type});
  }
  return result;
}

/**
 * Converts an MRI type code to the corresponding MRI type.
 *
 * @param typeCode The MRI type code.
 * @return The corresponding MRI type.
 * @internal
 */
export function mriTypeFromTypeCode(typeCode: MriTypeCode): MriType {
  const result: MriType | undefined = MRI_TYPE_FROM_TYPE_CODE.get(typeCode);
  if (result === undefined) {
    throw new Incident("UnknownMriTypeCode", {typeCode});
  }
  return result;
}

/**
 * Converts an MRI type to the corresponding MRI type name.
 *
 * @param type The MRI type.
 * @return The corresponding MRI type name.
 * @internal
 */
export function mriTypeToTypeName(type: MriType): MriTypeName {
  const result: MriTypeName | undefined = MRI_TYPE_TO_TYPE_NAME.get(type);
  if (result === undefined) {
    throw new Incident("UnknownMriType", {type});
  }
  return result;
}

/**
 * Converts an MRI type name to the corresponding MRI type.
 *
 * @param typeName The MRI type name.
 * @return The corresponding MRI type.
 * @internal
 */
export function mriTypeFromTypeName(typeName: MriTypeName): MriType {
  const result: MriType | undefined = MRI_TYPE_FROM_TYPE_NAME.get(typeName);
  if (result === undefined) {
    throw new Incident("UnknownMriTypeName", {typeName});
  }
  return result;
}

/**
 * Pattern matching MRI keys. It has two capture groups:
 * - Group 1: Type code
 * - Group 2: Id
 *
 * The universal matcher for the id part matches the behavior found in
 * skype-web-reversed (v1.107.13).
 * There is still a difference: we assume that there is a single type code prefix while
 * the retrieved regexp is `/^(?:(\d+):)+/`.
 * This means that they can parse `4:8:bob` to the type code `"8"` and id `"bob"`.
 * Instead of that, our pattern parses to the type code `"4"` and id `"8:bob"` (but then
 * the parse function throws an error because the `id` is invalid).
 */
const MRI_KEY_PATTERN: RegExp = /^(\d+):([\s\S]+)$/;

export function getId(mriKey: MriKey): string {
  return parse(mriKey).id;
}

export function getType(mriKey: MriKey): MriType {
  return parse(mriKey).type;
}

/**
 * Tests if an id is Phone Switched Telephone Network (PSTN) identifier (a phone number).
 *
 * A PSTN id is a decimal number, optionally prefixed by a plus sign (`+`).
 *
 * @param id ID to test
 * @return Boolean indicating if `id` is a PSTN id
 */
export function isPstnId(id: string): boolean {
  return /^(?:\+)?\d+$/.test(id);
}

/**
 * Tests if an id is guest identifier.
 *
 * A guest id starts by `guest:`.
 *
 * @param id ID to test
 * @return Boolean indicating if `id` is a guest id
 */
export function isGuestId(id: string): boolean {
  return /^guest:/.test(id);
}

/**
 * Tests if a string is a well-formed MRI key.
 *
 * @param str The string to test
 * @return Boolean indicating if `str` is a well-formed MRI key
 */
export function isMriKey(str: string): str is MriKey {
  return /^(?:(\d+):)+/.test(str);
}

/**
 * Creates an MRI key if needed
 *
 * If `mriKeyOrId` is already an MRI key, returns it immediately.
 * Otherwise, creates an MRI key with the type `type` and id `mriKeyOrId`.
 *
 * @param {MriKey | string} mriKeyOrId
 * @param {MriType} type
 * @return {string}
 */
export function asMriKey(mriKeyOrId: MriKey | string, type: MriType): MriKey {
  if (isMriKey(mriKeyOrId)) {
    return mriKeyOrId;
  }
  const id: string = mriKeyOrId;
  if (isPstnId(id)) {
    // TODO: We are enforcing the PSTN type. We should check the value of `type` and raise a
    //       warning if it is not Pstn.
    return format({type: MriType.Pstn, id});
  } else {
    return format({type, id});
  }
}

function isValidId(id: string): boolean {
  return !MRI_KEY_PATTERN.test(id);
}

export function format(mri: ParsedMriKey): MriKey {
  if (!isValidId(mri.id)) {
    throw new Incident("InvalidMriId", {id: mri.id});
  }
  return `${mriTypeToTypeCode(mri.type)}:${mri.id}`;
}

export function parse(mri: MriKey): ParsedMriKey {
  const match: RegExpExecArray | null = MRI_KEY_PATTERN.exec(mri);
  if (match === null) {
    throw new Incident("InvalidMriKey", {key: mri});
  }
  // We can cast here because `mriTypeFromTypeCode` tests the validity of the MRI code.
  const type: MriType = mriTypeFromTypeCode(match[1] as MriTypeCode);
  const id: string = match[2];
  if (isValidId(id)) {
    throw new Incident("InvalidMriId", {id});
  }
  return {type, id};
}
