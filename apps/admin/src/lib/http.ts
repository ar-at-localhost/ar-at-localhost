import { PUBLIC_SRV_AUTH_URL } from "$app/env/public";
import { goto } from "$app/navigation";
import { refreshTokenSrv, type ReqArgs, type ReqOpts, type Srv } from "lib";

import { getRefreshToken, getToken, setAuth } from "./auth";

export const callSrv = <Resp = unknown, Args extends ReqArgs = ReqArgs>(
  srv: Srv<Resp, Args>,
  opts: ReqOpts<Args>,
) => {
  return srv({
    ...opts,
    bearer: getToken(),
    errorHandlers: {
      401: async (_, url, opts) => {
        return await refreshTokenSrv({
          bearer: getRefreshToken(),
          baseURL: PUBLIC_SRV_AUTH_URL,
        })
          .then((res) => {
            setAuth(res);
            return fetch(url, {
              ...opts,
              headers: {
                ...opts.headers,
                Authorization: `Bearer ${res.token}`,
              },
            });
          })
          .catch((err) => {
            console.error(err);
            goto("/auth/login");
          });
      },
    },
  });
};
