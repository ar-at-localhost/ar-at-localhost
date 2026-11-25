import { createLeadSchema, tooHigh, tooLow, type UserInfo } from "lib";
import { maxValue, minValue, number, object, omit, pipe } from "valibot";

import { fetchGithubSnapshot } from "./internal/llm.ts";
import { getLlmConfigByLabel as getConfigByLabel, toRunArgs } from "./llm.ts";
import { type DB } from "./pg.ts";

export const getSyncPortfolioLLM = async (db: DB, user: UserInfo) =>
  toRunArgs(await getConfigByLabel(db, "sync-portfolio", user.id), user, {
    "Github Snapshot": JSON.stringify(await fetchGithubSnapshot(user)),
  });

export const getJdToLeadLLM = async (db: DB, user: UserInfo, context?: Record<string, string>) =>
  toRunArgs(
    await getConfigByLabel(db, "jd-to-lead", user.id),
    user,
    context,
    object({
      ...omit(createLeadSchema, ["fit_score"]).entries,
      fit_score: pipe(
        number(),
        minValue(1, tooLow("Fit score", 1)),
        maxValue(10, tooHigh("Fit score", 10)),
      ),
    }),
  );

export const getFindLeadsLLM = async (db: DB, user: UserInfo) =>
  toRunArgs(await getConfigByLabel(db, "find-leads", user.id), user);
