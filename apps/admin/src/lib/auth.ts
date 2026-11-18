import { type LoginRespSchema, type UserHandle, type UserInfo, type UserKey } from "lib";

const TokenKey = "token";
const RefreshTokenKey = "refresh-token";
const ProfileKey = "profile";

export const setAuth = (auth: LoginRespSchema) => {
  localStorage.setItem(TokenKey, auth.token);
  localStorage.setItem(RefreshTokenKey, auth.refreshToken);
};

export const delAuth = () => {
  localStorage.removeItem(TokenKey);
  localStorage.removeItem(RefreshTokenKey);
  localStorage.removeItem(ProfileKey);
};

export const getToken = () => localStorage.getItem(TokenKey) || "";
export const getRefreshToken = () => localStorage.getItem(RefreshTokenKey) || "";
export const isLoggedIn = () => !!getToken();
type KeysFlat = Record<UserKey, string | undefined>;
type HandlesFlat = Record<UserHandle, string | undefined>;
export type UserProfile = UserInfo & {
  keysFlat: KeysFlat;
  handlesFlat: HandlesFlat;
};

export const transform = (res: UserInfo): UserProfile => ({
  ...res,
  keysFlat: res.keys.reduce((o, n) => {
    o[n.type] = n.key;
    return o;
  }, {} as KeysFlat),
  handlesFlat: res.handles.reduce((o, n) => {
    o[n.type] = n.handle;
    return o;
  }, {} as HandlesFlat),
});
