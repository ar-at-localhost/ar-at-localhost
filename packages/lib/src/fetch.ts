import { getAPIBaseURL, isDebug } from "./env.ts";

const jsonOrSth = async (res: Response, sth?: unknown) => {
  if (isDebug()) {
    try {
      const clone = res.clone();
      console.log(clone.status, clone.statusText, await clone.json());
    } catch {}
  }

  if (res.headers.get("CONTENT-TYPE")?.startsWith("application/json")) return await res.json();
  return sth;
};

export type ReqMethod = "DELETE" | "GET" | "PATCH" | "POST" | "PUT";
export type ReqErrHandler = (resp: Response, url: string, opts: RequestInit) => Promise<unknown>;
export type ReqErrHandlers = { [x: number]: ReqErrHandler };
export type URLValue = string | number | boolean;
export type URLValues = Record<string, string | number | boolean>;
export type ReqArgs<
  Params extends URLValues = {},
  Query extends URLValues = {},
  Body extends object = any,
> = [Params, Query, Body];
type Bearer = string | (() => string) | (() => Promise<string>);

export type SrvOpts<Args extends ReqArgs = ReqArgs> = {
  method: ReqMethod;
  endpoint?: string;
  params?: Args[0];
  query?: Args[1];
  body?: Args[2];
  baseURL?: string;
  headers?: Record<string, string>;
  bearer?: Bearer;

  /**
   * Error handling functions. If an error of given code occurs,
   * it will call handler associated with that code.
   * Handler may return an unknown response if it can recover from error.
   *
   * @note Handler must throw to keep error propogating.
   *
   * Example use cases:
   * - Retries
   * - Refresh token
   * - Uniform error interface
   */
  errorHandlers?: ReqErrHandlers;
};

export type ReqOpts<Args extends ReqArgs = ReqArgs> = Pick<
  SrvOpts<Args>,
  "baseURL" | "bearer" | "body" | "errorHandlers" | "headers" | "params" | "query"
>;

const resolveBearer = async (bearer?: Bearer) =>
  bearer ? (typeof bearer == "string" ? bearer : await bearer()) : null;

export const mkClientSrv = <Result = any, Args extends ReqArgs = ReqArgs>(
  srvOpts: SrvOpts<Args>,
) => {
  const func = async (reqOpts: ReqOpts<Args>) => {
    let endpoint = srvOpts.endpoint || "";

    if (reqOpts.params) {
      const params = reqOpts.params as Record<string, URLValue>;

      endpoint = endpoint
        .split("/")
        .map((seg) => {
          if (!seg.startsWith(":")) return seg;
          const segname = seg.substring(1);
          return params[segname] == null ? seg : encodeURIComponent(params[segname]);
        })
        .join("/");
    }

    const path = `${getAPIBaseURL(reqOpts?.baseURL ?? srvOpts?.baseURL)}${endpoint || "/"}`;
    const url = new URL(path);
    if (reqOpts.query) url.search = new URLSearchParams(reqOpts.query).toString();
    const bearer = (await resolveBearer(reqOpts.bearer)) || (await resolveBearer(srvOpts.bearer));

    const opts: RequestInit = {
      method: srvOpts.method,
      headers: {
        ...(reqOpts?.body && { "CONTENT-TYPE": "application/json" }),
        ...(bearer && { Authorization: `Bearer ${bearer}` }),
        ...reqOpts.headers,
      },
      body: reqOpts?.body && JSON.stringify(reqOpts.body),
    };

    return fetch(url, opts)
      .then(async (res) => {
        if (res.ok) {
          return jsonOrSth(res) as Promise<Result>;
        }

        const handler =
          reqOpts?.errorHandlers?.[res.status] || srvOpts?.errorHandlers?.[res.status];
        if (handler) return handler(res.clone(), url.toString(), opts);

        throw res;
      })
      .catch(async (err) => {
        if (isDebug()) {
          console.error(err);
        }

        const eo = {
          statusCode: 500,
          error: "Internal Server Error",
          message: "Something went wrong!",
        };

        if (err instanceof Response) {
          throw await jsonOrSth(err, {
            ...eo,
            statusCode: err.status,
            error: err.statusText,
          });
        }

        throw eo;
      }) as Promise<Result>;
  };

  return Object.assign(func, {
    method: srvOpts.method,
    endpoint: srvOpts.endpoint,
  });
};

export type APIService<Result = any, Args extends ReqArgs = ReqArgs> = ReturnType<
  typeof mkClientSrv<Result, Args>
>;
