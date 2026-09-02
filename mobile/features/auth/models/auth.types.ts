export type AuthTokens = {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresAt: number;
};

export type AuthUser = {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
};
