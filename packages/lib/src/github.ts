import { concatMap, filter, firstValueFrom, forkJoin, from, map, toArray } from "rxjs";

import { mkClientSrv } from "./fetch.ts";

export type GHRepo = {
  archived: boolean;
  default_branch: string;
  description: string;
  fork: boolean;
  git_url: string;
  id: number;
  is_template: boolean;
  languages?: Record<string, number>;
  license?: {
    spdx_id: number;
  };
  name: string;
  owner?: {
    id: number;
    login: string;
  };
  readme: string;
  recentCommits: string[];
  size: number;
  topics: string[];
};

export type RepoDetail = {};
export const GITHUB_API = "https://api.github.com";
type RepoParams = { owner: string; repo: string };

/**
 * Fetch readme content of a repo
 */
export const fetchRepoReadme = mkClientSrv<string, [RepoParams, never, never]>({
  baseURL: "",
  endpoint: "/repos/:owner/:repo/readme",
  method: "GET",

  transformer: async (res) => {
    const r = res as { content: string; encoding: "base64" };

    if (r.content?.length && r.encoding === "base64") {
      return Buffer.from(r.content, "base64").toString("utf8");
    }

    return "";
  },
});

/**
 * Fetch repo languages
 */
export const fetchLanguages = mkClientSrv<Record<string, number>, [RepoParams, never, never]>({
  baseURL: "",
  endpoint: "/repos/:owner/:repo/languages",
  method: "GET",
});

/**
 * List commit
 */
export const fetchRecentCommits = mkClientSrv<
  { url: string; sha: string }[],
  [RepoParams, { sha?: string; author?: string; page?: number; per_page: number }, never]
>({
  baseURL: GITHUB_API,
  endpoint: "/repos/:owner/:repo/commits",
  method: "GET",
});

/**
 * Fetch commit content
 */
export const fetchCommit = mkClientSrv<string, [RepoParams & { sha: string }, never, never]>({
  baseURL: GITHUB_API,
  endpoint: "/repos/:owner/:repo/commits/:sha",
  method: "GET",
  headers: {
    accept: "application/vnd.github.diff",
  },

  transformer: async (resp) => {
    return (resp as Response).clone().text();
  },
});

/**
 * Fetch user repositories
 */
export const fetchUserRepos = mkClientSrv<GHRepo[]>({
  baseURL: "https://api.github.com",
  endpoint: "/user/repos",
  method: "GET",

  query: {
    sort: "pushed",
    direction: "desc",
    per_page: 100,
    page: 1,
  },

  transformer: async (input: any, _, r, meta) => {
    const handle = meta?.meta?.handle as unknown as string;

    const repos = input as GHRepo[];
    return Promise.all(
      repos
        .map(
          (repo) =>
            ({
              archived: repo.archived,
              default_branch: repo.default_branch,
              description: repo.description,
              fork: repo.fork,
              name: repo.name,
              git_url: repo.git_url,
              id: repo.id,
              is_template: repo.is_template,
              license: repo.license
                ? {
                    spdx_id: repo.license?.spdx_id,
                  }
                : undefined,
              owner: repo.owner
                ? {
                    id: repo.owner.id,
                    login: repo.owner.login,
                  }
                : undefined,
              readme: "",
              recentCommits: [],
              size: repo.size,
              topics: repo.topics,
            }) satisfies GHRepo,
        )
        .filter((repo) => repo.owner?.login === handle)
        .map((repo) =>
          (async () => {
            const bearer = (r?.headers as Record<string, string>)?.Authorization?.split(" ")[1];
            const params = { owner: repo.owner?.login ?? "", repo: repo.name };
            const commits = await fetchRecentCommits({
              bearer,
              params: {
                ...params,
              },
              query: {
                per_page: 3,
              },
            });

            const recentCommits: string[] = [];
            for (const commit of commits) {
              recentCommits.push(
                await fetchCommit({
                  bearer,
                  params: {
                    ...params,
                    sha: commit.sha,
                  },
                }),
              );
            }

            return {
              ...repo,
              readme: repo.owner
                ? await fetchRepoReadme({
                    bearer,
                    params: {
                      owner: repo.owner.login,
                      repo: repo.name,
                    },
                  }).catch(() => "")
                : "",
              recentCommits,
            } satisfies GHRepo;
          })(),
        ),
    );
  },
});

/**
 * Fetch user repositories
 */
export const fetchUserReposAlt = mkClientSrv<GHRepo[]>({
  baseURL: "https://api.github.com",
  endpoint: "/user/repos",
  method: "GET",

  query: {
    sort: "pushed",
    direction: "desc",
    per_page: 100,
    page: 1,
  },

  transformer: async (input: any, _, r, meta) => {
    const handle = meta?.handle as unknown as string;
    const bearer = (r?.headers as Record<string, string>)?.Authorization?.split(" ")[1];

    const repos = input as GHRepo[];
    return firstValueFrom(
      from(repos).pipe(
        filter((repo) => repo?.owner?.login === handle),

        map((repo) => ({
          archived: repo.archived,
          default_branch: repo.default_branch,
          description: repo.description,
          fork: repo.fork,
          name: repo.name,
          git_url: repo.git_url,
          id: repo.id,
          is_template: repo.is_template,
          license: repo.license
            ? {
                spdx_id: repo.license?.spdx_id,
              }
            : undefined,
          owner: repo.owner
            ? {
                id: repo.owner.id,
                login: repo.owner.login,
              }
            : undefined,
          readme: "",
          recentCommits: [],
          size: repo.size,
          topics: repo.topics,
        })),

        concatMap((repo) =>
          forkJoin({
            readme: from(
              fetchRepoReadme({
                bearer,
                params: {
                  owner: repo.owner?.login || "",
                  repo: repo.name,
                },
              }).catch(() => ""),
            ),

            languages: from(
              fetchLanguages({
                bearer,
                params: {
                  owner: repo.owner?.login || "",
                  repo: repo.name,
                },
              }).catch(() => undefined),
            ),

            recentCommits: from(
              fetchRecentCommits({
                bearer,
                params: {
                  owner: repo.owner?.login || "",
                  repo: repo.name,
                },
                query: {
                  per_page: 5,
                },
              }).catch(() => []),
            ),
          }).pipe(
            map(
              ({ readme, languages, recentCommits }) =>
                ({
                  ...repo,
                  languages,
                  readme,
                  recentCommits: recentCommits.map((i) => i.sha),
                }) satisfies GHRepo,
            ),
          ),
        ),

        toArray(),
      ),
    );
  },
});
