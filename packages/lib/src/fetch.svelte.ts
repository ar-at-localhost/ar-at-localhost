import { createMutation, type CreateMutationOptions, createQuery } from "@tanstack/svelte-query";
import { merge } from "es-toolkit";

import type { ReqArgs, APIService } from "./fetch.ts";

/**
 * Creates a factory for Tan-Stack Svelte Query
 */
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

type ServiceArgs<Service extends (...args: any) => any> = Parameters<Service>[0];
type MuatationArg<Result = any, ServiceArgs = any> = {
  srvArgs?: ServiceArgs;
  opts?: CreateMutationOptions<Result, Error, Partial<ServiceArgs>>;
};

/**
 * Creates a factory for Tan-Stack Svelte Mutation
 */
export const mkMutationSv =
  <Result = any, Args extends ReqArgs = ReqArgs>(service: APIService<Result, Args>) =>
  (opts: MuatationArg<Result, ServiceArgs<typeof service>>) =>
    createMutation(() => {
      return {
        ...opts.opts,
        mutationFn: (args: Parameters<typeof service>[0]) =>
          service(merge(opts.srvArgs || {}, args)),
      };
    });

export type MutationFactorySv<Result = any, Args extends ReqArgs = ReqArgs> = typeof mkQuerySv<
  Result,
  Args
>;

export type MutationSv<Result = any, Args extends ReqArgs = ReqArgs> = ReturnType<
  MutationFactorySv<Result, Args>
>;
