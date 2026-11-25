import { llmModelMap } from "lib";

import { llmProviderTable, llmTable } from "../../llm.db.ts";
import { db } from "../../pg.ts";
import { llmConfigs } from "./configs/index.ts";

export const llmSeeds = {
  llmProviders: async () => {
    await db
      .insert(llmProviderTable)
      .values([
        {
          id: "google",
          enabled: true,
        },
      ])
      .onConflictDoNothing({
        target: llmProviderTable.id,
      });
  },

  llms: async () => {
    await db
      .insert(llmTable)
      .values(
        llmModelMap.google.map((i) => ({
          id: i,
          provider: "google",
        })),
      )
      .onConflictDoNothing({
        target: [llmTable.provider, llmTable.id],
      });
  },
  ...llmConfigs,
};
