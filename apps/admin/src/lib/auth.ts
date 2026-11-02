import type { LoginRespSchema } from "lib";

const TokenKey = "token";
const RefreshTokenKey = "refresh-token";

export const setAuth = (auth: LoginRespSchema) => {
  localStorage.setItem(TokenKey, auth.token);
  localStorage.setItem(RefreshTokenKey, auth.refreshToken);
};

export const delAuth = () => {
  localStorage.removeItem(TokenKey);
  localStorage.removeItem(RefreshTokenKey);
};

export const getToken = () => localStorage.getItem(TokenKey) || "";
export const getRefreshToken = () => localStorage.getItem(RefreshTokenKey) || "";
export const isLoggedIn = () => !!getToken();
