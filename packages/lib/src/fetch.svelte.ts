import { createQuery } from "@tanstack/svelte-query";

import { ReqArgs, APIService } from "./fetch";

export const mkQuerySv =
  <Result = any, Args extends ReqArgs = ReqArgs>(service: APIService<Result, Args>) =>
  (args: Parameters<typeof service>[0] | (() => Parameters<typeof service>[0])) =>
    createQuery(() => {
      const finalArgs = typeof args === "function" ? args() : args;
      return {
        queryKey: [finalArgs?.params, finalArgs?.query],
        queryFn: ({ queryKey }) =>
          service({
            ...finalArgs,
            params: queryKey[0],
            query: queryKey[1],
          }),
      };
    });

export type QueryFactorySv<Result = any, Args extends ReqArgs = ReqArgs> = typeof mkQuerySv<
  Result,
  Args
>;

export type QuerySv<Result = any, Args extends ReqArgs = ReqArgs> = ReturnType<
  QueryFactorySv<Result, Args>
>;
