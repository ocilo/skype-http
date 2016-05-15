export interface Credentials {
  username: string;
  password: string;
}

export interface ParsedUserId {
  raw: string; // "{prefix}:{username}"
  prefix: number; // 8 for normal users
  username: string;
}
