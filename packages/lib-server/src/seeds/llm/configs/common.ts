import { type InferInsertModel } from "drizzle-orm";
import { omit } from "es-toolkit";
import { concatMap, from, lastValueFrom, of, switchMap } from "rxjs";

import { llmConfigModelTable, llmConfigProviderTable, llmConfigTable } from "../../../llm.db.ts";
import { db, type DB } from "../../../pg.ts";

export type LLMConfigSeed = InferInsertModel<typeof llmConfigTable> & {
  llmProviders?: (InferInsertModel<typeof llmConfigProviderTable> & {
    llms?: InferInsertModel<typeof llmConfigModelTable>[];
  })[];
};

export const createConfig = async (config: LLMConfigSeed, dbConnection?: DB) => {
  const dbc = dbConnection || db;

  return dbc.transaction(async (tx) => {
    const [cfg] = await tx
      .insert(llmConfigTable)
      .values(omit(config, ["llmProviders"]))
      .returning();

    if (config.llmProviders?.length) {
      await lastValueFrom(
        of(cfg).pipe(
          switchMap((c) =>
            from((config.llmProviders || []).map((i) => ({ ...i, config: c.uuid }))),
          ),

          concatMap((provider) =>
            from(
              tx
                .insert(llmConfigProviderTable)
                .values(provider)
                .returning()
                .then(() =>
                  (provider.llms || []).map((i) => ({
                    ...i,
                    config: provider.config,
                    provider: provider.provider,
                  })),
                ),
            ),
          ),

          concatMap((models) => from(tx.insert(llmConfigModelTable).values(models))),
        ),
      );
    }

    const record = await tx.query.llmConfigTable.findFirst({
      where: {
        uuid: cfg.uuid,
      },

      with: {
        llmProviders: {
          orderBy: { priority: "asc" },
          with: {
            llms: {
              orderBy: { priority: "asc" },
            },
          },
        },
      },
    });

    if (!record) throw new Error("Unexpected, record could not be found after insertion!");
    return record;
  });
};
