import {
  createMutation,
  type CreateMutationOptions,
  createQuery,
  CreateQueryOptions,
} from "@tanstack/svelte-query";
import { merge } from "es-toolkit";

import type { ReqArgs, APIService, ReqOpts } from "./fetch.ts";

type ServiceArgs<Service extends (...args: any) => any> = Parameters<Service>[0];

type QueryArg<Result = any, ServiceArgs = any> = {
  srvArgs?: ServiceArgs;
  opts?: Omit<CreateQueryOptions<Result, Error, Result>, "queryKey" | "queryFn">;
};

type QueryArgs<Result, Service> = QueryArg<Result, Service> | (() => QueryArg<Result, Service>);

/**
 * Creates a factory for Tan-Stack Svelte Query
 */
export const mkQuerySv =
  <Result = any, Args extends ReqArgs = ReqArgs>(service: APIService<Result, Args>) =>
  (opts: QueryArgs<Result, ServiceArgs<typeof service>>) =>
    createQuery(() => {
      const o = typeof opts == "function" ? opts() : opts;

      return {
        ...o.opts,
        queryKey: [service.method, service.endpoint, o.srvArgs?.params, o.srvArgs?.query],
        queryFn: ({ queryKey: [, , params, query] }) =>
          service(
            merge(o.srvArgs || {}, {
              params: params,
              query: query,
            }) as ReqOpts<Args>,
          ),
      };
    });

export type QueryFactorySv<Result = any, Args extends ReqArgs = ReqArgs> = typeof mkQuerySv<
  Result,
  Args
>;

export type QuerySv<Result = any, Args extends ReqArgs = ReqArgs> = ReturnType<
  QueryFactorySv<Result, Args>
>;

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
