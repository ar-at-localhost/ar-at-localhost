import { UTCDate } from "@date-fns/utc";
import { isEqual } from "es-toolkit";
import { fetchCommit, fetchUserReposAlt, type GHRepo, type UserInfo } from "lib";
import { getFile, type LLMRunOpts } from "lib-server";
import { concatMap, forkJoin, from, lastValueFrom, map, of, toArray } from "rxjs";

type GHSnapshot = {
  repos: (GHRepo & {})[];
  enabled: boolean;
  created: string;
  updated: string;
};

export const fetchGithubSnapshot = async (user: UserInfo) => {
  const now = new UTCDate().toISOString();
  const file = getFile(`users/${user.id}/ghs.json`);
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

export const getPortfolioLLM = async (user: UserInfo): Promise<LLMRunOpts> => {
  return lastValueFrom(
    forkJoin({
      about: from(
        getFile(`users/${user.id}/llm/portfolio-whoami.md`)
          .download()
          .then((res) => res[0].toString("utf8"))
          .catch(() => ""),
      ),

      githubSnapshot: from(fetchGithubSnapshot(user).then((sn) => JSON.stringify(sn))),

      systemPrompt: from(
        getFile(`users/${user.id}/llm/portfolio-sp.md`)
          .download()
          .then((res) => res[0].toString("utf8")),
      ),

      prompt: from(
        getFile(`users/${user.id}/llm/portfolio-p.md`)
          .download()
          .then((res) => res[0].toString("utf8")),
      ),
    }).pipe(
      map(
        ({ about, githubSnapshot, systemPrompt, prompt }) =>
          ({
            config: {
              provider: "Gemini",
              model: "gemini-3.5-flash",
            },

            inputs: {
              systemPrompt,
              prompt,
              context: [
                { key: "About", content: about },
                { key: "Github Snapshot", content: githubSnapshot },
              ].filter((i) => !!i.content),
            },
          }) satisfies LLMRunOpts,
      ),
    ),
  );
};

export const getLeadFindLLM = async (user: UserInfo): Promise<LLMRunOpts> => {
  return lastValueFrom(
    forkJoin({
      about: from(
        getFile(`users/${user.id}/llm/portfolio-whoami.md`)
          .download()
          .then((res) => res[0].toString("utf8"))
          .catch(() => ""),
      ),

      portfolio: from(
        getFile(`users/${user.id}/llm/portfolio.md`)
          .download()
          .then((res) => res[0].toString("utf8")),
      ),

      systemPrompt: from(
        getFile(`users/${user.id}/llm/leads-sp.md`)
          .download()
          .then((res) => res[0].toString("utf8")),
      ),

      prompt: of(`Today's date: 2026-11-18

This week's search angle:
- Segment: seed to Series B software product companies (SaaS, developer tools, fintech)
- Signal to look for: hiring backend or full-stack TypeScript engineers, posted in the last 3 months
- Region: [remote-friendly or worldwide]

Find up to 10 companies matching this angle and the ideal customer in
<Profile>. Return fewer, or none, rather than guess. Reply with the JSON
object only.`),
    }).pipe(
      map(
        ({ about, portfolio, systemPrompt, prompt }) =>
          ({
            config: {
              provider: "Gemini",
              model: "gemini-3.8-flash",
            },

            inputs: {
              systemPrompt,
              prompt,
              context: [
                { key: "About", content: about },
                { key: "Portfolio", content: portfolio },
              ].filter((i) => !!i.content),
            },
          }) satisfies LLMRunOpts,
      ),
    ),
  );
};
