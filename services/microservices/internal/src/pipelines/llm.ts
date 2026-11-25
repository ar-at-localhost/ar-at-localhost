import { UTCDate } from "@date-fns/utc";
import { isEqual } from "es-toolkit";
import { fetchCommit, fetchUserReposAlt, type GHRepo, type UserInfo } from "lib";
import { getFile } from "lib-server";
import { concatMap, from, lastValueFrom, map, toArray } from "rxjs";

type GHSnapshot = {
  repos: (GHRepo & {})[];
  enabled: boolean;
  created: string;
  updated: string;
};

export const fetchGithubSnapshot = async (user: UserInfo) => {
  const now = new UTCDate().toISOString();
  const file = getFile(`users/${user.id}/llm/portfolio-ghs.json`);
  const bearer = user.keys.find((i) => i.type === "GitHub")?.key;
  const handle = user.handles.find((i) => i.type === "GitHub")?.handle;

  const content: GHSnapshot = await file
    .download()
    .then((r) => JSON.parse(r[0].toString("utf8")))
    .catch((e) => {
      if (e?.code === 404) return null;
      throw e;
    });

  const snapshot: GHSnapshot = {
    enabled: content?.enabled ?? true,
    created: content?.created || now,
    updated: content?.updated ?? "",

    repos: await fetchUserReposAlt({
      bearer,
      meta: {
        handle,
      },
    }),
  };

  if (!isEqual(snapshot, content)) {
    snapshot.updated = now;
    await file.save(JSON.stringify(snapshot));
  }

  return lastValueFrom(
    from(snapshot.repos).pipe(
      // map recent commit sha(s) to diff
      concatMap((repo) =>
        from(repo.recentCommits).pipe(
          concatMap((sha) =>
            fetchCommit({
              bearer,
              params: {
                owner: repo.owner?.login || "",
                repo: repo.name,
                sha,
              },
            }),
          ),

          toArray(),

          map((commits) => ({
            ...repo,
            recentCommits: commits,
          })),
        ),
      ),

      toArray(),

      map((repos) => ({
        ...snapshot,
        repos,
      })),
    ),
  );
};
