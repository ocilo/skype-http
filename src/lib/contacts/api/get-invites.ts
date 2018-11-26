import { CaseStyle } from "kryo/case-style";
import { ArrayType } from "kryo/types/array";
import { DocumentType } from "kryo/types/document";
import { $Invite, Invite } from "../../types/invite";

/**
 * @internal
 */
export interface GetInvitesResult {
  inviteList: Invite[];
}

/**
 * @internal
 */
export const $GetInvitesResult: DocumentType<GetInvitesResult> = new DocumentType<GetInvitesResult>({
  properties: {
    inviteList: {type: new ArrayType({itemType: $Invite, maxLength: Infinity})},
  },
  changeCase: CaseStyle.SnakeCase,
});
