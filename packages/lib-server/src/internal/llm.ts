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

export type LLM_PROVIDER = "Gemini";
export const llmProviderSet: Set<LLM_PROVIDER> = new Set(["Gemini"]);
export const llmProviders: LLM_PROVIDER[] = Array.from(llmProviderSet);

export const llmModals: Record<LLM_PROVIDER, string[]> = {
  Gemini: [],
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
