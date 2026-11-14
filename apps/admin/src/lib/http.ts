import { PUBLIC_SRV_URL } from "$app/env/public";
import { goto } from "$app/navigation";
import { refreshTokenSrv, type APIService, type ReqArgs, type ReqOpts } from "lib";

import { getRefreshToken, getToken, setAuth } from "./auth";

export const mkOpts = <Args extends ReqArgs = ReqArgs>(args: ReqOpts<Args>): ReqOpts<Args> => ({
  ...args,
  baseURL: args.baseURL || PUBLIC_SRV_URL,
  bearer: getToken(),
  errorHandlers: {
    401: async (_: Response, url: string, opts: RequestInit) => {
      return await refreshTokenSrv({
        bearer: getRefreshToken(),
        baseURL: PUBLIC_SRV_URL,
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
        .catch(() => {
          goto("/auth/login");
        });
    },
  },
});

export const callSrv = <Resp = unknown, Args extends ReqArgs = ReqArgs>(
  srv: APIService<Resp, Args>,
  opts: ReqOpts<Args>,
) => {
  return srv(mkOpts(opts));
};
