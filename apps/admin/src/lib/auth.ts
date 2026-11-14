import { PUBLIC_SRV_AUTH_URL } from "$app/env/public";
import { getProfileSrv, type LoginRespSchema, type UserInfo } from "lib";

import { mkOpts } from "./http";

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
};

export const getToken = () => localStorage.getItem(TokenKey) || "";
export const getRefreshToken = () => localStorage.getItem(RefreshTokenKey) || "";
export const isLoggedIn = () => !!getToken();

export const loadProfile = (() => {
  let profile: UserInfo | null = null;

  return async () => {
    if (profile) return profile;

    try {
      profile = JSON.parse(localStorage.getItem(ProfileKey)!);
    } catch {}

    if (!profile) {
      profile = await getProfileSrv(
        mkOpts({
          baseURL: PUBLIC_SRV_AUTH_URL,
          bearer: getToken(),
        }),
      )
        .then((res) => {
          localStorage.setItem(ProfileKey, JSON.stringify(res));
          return res;
        })
        .catch((err) => {
          console.error(err);
          return null;
        });
    }

    return profile;
  };
})();
