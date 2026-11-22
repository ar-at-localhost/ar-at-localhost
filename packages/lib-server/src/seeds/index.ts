import { llmSeeds } from "./llm/index.ts";

export const seeds: Record<string, () => Promise<void>> = {
  ...llmSeeds,
};
