import { UTCDate } from "@date-fns/utc";
import { isEqual } from "es-toolkit";
import { fetchCommit, fetchUserReposAlt, type GHRepo, type UserInfo } from "lib";
import { getFile } from "lib-server";
import { concatMap, from, lastValueFrom, map, toArray } from "rxjs";
import {
  array,
  check,
  literal,
  maxValue,
  minValue,
  number,
  object,
  optional,
  partial,
  picklist,
  pipe,
  string,
  variant,
  type InferOutput,
} from "valibot";

export type LLM_PROVIDER = "Google AI";
export const llmProviderSet: Set<LLM_PROVIDER> = new Set(["Google AI"]);
export const llmProviders: LLM_PROVIDER[] = Array.from(llmProviderSet);

export const llmModals: Record<LLM_PROVIDER, string[]> = {
  "Google AI": [],
};

/**
 * Part of LLM content
 */
export const llmPartSchema = object({
  text: string(),
});

/**
 * Part of LLM Prompt
 */
export const llmContentSchema = pipe(
  partial(
    object({
      parts: array(llmPartSchema),
      role: pipe(string(), picklist(["model", "user"])),
      source: variant("type", [
        object({
          type: literal("s3"),
          ref: pipe(
            string(),
            check((i) => !i.startsWith("/") && !/(^|\/)\.\.(\/|$)/.test(i)),
          ),
        }),
      ]),
    }),
  ),

  check((v) => Boolean(v.parts?.length || v.source)),
);

/**
 * LLM Run args
 */
export const mkLlmRunArgsSchema = <T extends LLM_PROVIDER>(provider: T) =>
  object({
    config: object({
      provider: pipe(string(), picklist(llmProviders)),
      model: pipe(string(), picklist(llmModals[provider])),
      temperature: optional(pipe(number(), minValue(0), maxValue(1))),
    }),

    inputs: object({
      systemPrompt: optional(llmContentSchema),
      prompt: llmContentSchema,
      context: optional(array(llmContentSchema), []),
    }),
  });

export type LlmRunArgs = InferOutput<ReturnType<typeof mkLlmRunArgsSchema>>;
export const preprocess = (_args: LlmRunArgs) => {};

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
