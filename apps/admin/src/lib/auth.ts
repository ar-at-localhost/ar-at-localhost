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
  localStorage.removeItem(ProfileKey);
};

export const getToken = () => localStorage.getItem(TokenKey) || "";
export const getRefreshToken = () => localStorage.getItem(RefreshTokenKey) || "";
export const isLoggedIn = () => !!getToken();

type AssistantsFlat = {
  claude: {
    key?: string;
  };
  gemini: {
    key?: string;
  };
  openapi: {
    key?: string;
  };
};

export const loadProfile = (() => {
  let profile:
    | (UserInfo & {
        assistantsFlat: AssistantsFlat;
      })
    | null = null;

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
          return {
            ...res,
            assistantsFlat: res.assistants.reduce(
              (o, n) => {
                o[n.assistant] = {
                  key: n.key,
                };

                return o;
              },
              {} as Record<"claude" | "gemini" | "openapi", { key?: string }>,
            ),
          };
        })
        .catch((err) => {
          console.error(err);
          return null;
        });

      localStorage.setItem(ProfileKey, JSON.stringify(profile));
    }

    return profile;
  };
})();
