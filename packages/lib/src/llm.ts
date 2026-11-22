import { omit, orderBy } from "es-toolkit";
import {
  array,
  check,
  forward,
  type InferInput,
  type InferOutput,
  minValue,
  nullish,
  number,
  object,
  picklist,
  pipe,
  string,
  transform,
  union,
} from "valibot";

import { mkClientSrv } from "./fetch.ts";
import { filePathSchema } from "./file.ts";
import { timestamps } from "./schema.ts";

export type LLM_PROVIDER = "anthropic" | "google" | "openai";
export const llmProviders = ["anthropic", "google", "openai"] as const;
export const llmProviderSet: Set<LLM_PROVIDER> = new Set(llmProviders);

export type LLM_MODELS =
  | "gemini-3.1-flash"
  | "gemini-3.1-flash-lite"
  | "gemini-3.1-flash-pro"
  | "gemini-3.5-flash"
  | "gemini-3.5-flash-lite"
  | "gemini-3.5-flash-pro"
  | "gemini-3.8-flash"
  | "gemini-4-carbon"
  | "gemini-4-hydrogen";

export const llmModels = [
  "gemini-3.1-flash",
  "gemini-3.1-flash-lite",
  "gemini-3.1-flash-pro",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.5-flash-pro",
  "gemini-3.8-flash",
  "gemini-4-carbon",
  "gemini-4-hydrogen",
] as const;

export const llmModelSet: Set<LLM_PROVIDER> = new Set(llmProviders);

export const llmModelMap: Record<LLM_PROVIDER, LLM_MODELS[]> = {
  anthropic: [],
  google: [
    "gemini-3.1-flash",
    "gemini-3.1-flash-lite",
    "gemini-3.1-flash-pro",
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.5-flash-pro",
    "gemini-3.8-flash",
    "gemini-4-carbon",
    "gemini-4-hydrogen",
  ],
  openai: [],
};

export type LLMInput = (
  | {
      rel: "system_prompt" | "prompt";
    }
  | {
      rel: "context";
      key: string;
    }
) &
  (
    | {
        kind: "file";
        ref: string;
      }
    | {
        kind: "text";
        text?: string;
      }
  );

const numeric = pipe(union([number(), string()]), transform(Number));

export const llmInputSchema = pipe(
  object({
    rel: picklist(["system_prompt", "prompt", "context"]),
    kind: picklist(["file", "text"], "Please choose type!"),
    key: nullish(string()),
    ref: nullish(filePathSchema),
    text: nullish(string()),
  }),

  forward(
    check((config) => config.kind !== "file" || !!config.rel, "File reference is required!"),
    ["ref"],
  ),

  forward(
    check((config) => config.kind !== "text" || !!config.text, "Content is required!"),
    ["text"],
  ),

  forward(
    check((config) => config.rel !== "context" || !!config.key, "Key is required!"),
    ["key"],
  ),
);

export const llmConfigCommonSchema = object({
  label: string(),
  user_id: pipe(numeric, minValue(1)),
  max_input_tokens: nullish(numeric),
  max_output_tokens: nullish(numeric),
  inputs: nullish(array(llmInputSchema), []),
  temperature: nullish(numeric),
});

export const llmConfigSchema = pipe(
  object({
    ...llmConfigCommonSchema.entries,

    llmProviders: array(
      object({
        provider: string(),
        priority: number(),

        llms: array(
          object({
            provider: string(),
            model: string(),
            priority: number(),
          }),
        ),
      }),
    ),

    ...timestamps.entries,
  }),

  check(
    (config) => config.inputs.some((i) => i.rel === "system_prompt"),
    "System prompt input is required!",
  ),
);

export const llmConfigFormSchema = pipe(
  object({
    ...llmConfigCommonSchema.entries,
    providers: array(pipe(picklist(llmProviders, "Please choose a valid provider!"))),
    models: array(pipe(picklist(llmModels, "Please choose a valid model!"))),
    systemPrompt: llmInputSchema,
    prompt: llmInputSchema,
  }),

  forward(
    check((config) => {
      const choices = config.providers.flatMap((provider) => llmModelMap[provider]);
      return config.models.every((model) => choices.includes(model));
    }, "Choose models from selected providers!"),
    ["models"],
  ),

  transform((config) => ({
    ...omit(config, ["systemPrompt", "prompt", "providers", "models"]),
    inputs: [config.systemPrompt, config.prompt, ...config.inputs] as LLMInput[],
    llmProviders: config.providers.map((provider, pidx) => ({
      provider,
      priority: pidx,
      llms: config.models.map((llm, lidx) => ({
        provider,
        model: llm,
        priority: pidx * 1000 + lidx,
      })),
    })),
  })),
);

export type LLMConfig = InferOutput<typeof llmConfigSchema>;
export type LLMConfigInput = InferInput<typeof llmConfigFormSchema>;
export type LLMConfigBody = InferOutput<typeof llmConfigCommonSchema>;

export const llmConfigToForm = (config: LLMConfig): LLMConfigInput => ({
  ...omit(config, ["llmProviders", "inputs"]),
  systemPrompt: config.inputs.find((i) => i.rel === "system_prompt")!,
  prompt: config.inputs.find((i) => i.rel === "prompt")!,
  inputs: config.inputs.filter((i) => i.rel === "context"),

  providers: orderBy(config.llmProviders, ["priority"], ["asc"]).map(
    (i) => i.provider,
  ) as LLM_PROVIDER[],

  models: config.llmProviders.flatMap((i) =>
    orderBy(i.llms, ["priority"], ["asc"]).map((i) => i.model),
  ) as LLM_MODELS[],
});

export const getLLMConfigParams = object({
  label: string(),
});

export type LLMConfigParams = InferOutput<typeof getLLMConfigParams>;
export type GetLLMConfigArgs = [LLMConfigParams, never, never];
export type UpdateLLMConfigArgs = [LLMConfigParams, never, LLMConfigBody];

export const getLLMConfigSrv = mkClientSrv<LLMConfig, GetLLMConfigArgs>({
  method: "GET",
  endpoint: "/auth/llm/config/:label",
});

export const updateLLMConfigSrv = mkClientSrv<LLMConfig, UpdateLLMConfigArgs>({
  method: "PATCH",
  endpoint: "/auth/llm/config/:label",
});
