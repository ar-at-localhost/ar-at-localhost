import { createGoogle } from "@ai-sdk/google";
import { valibotSchema } from "@ai-sdk/valibot";
import { APICallError, generateText, Output } from "ai";
import { and, eq } from "drizzle-orm";
import { pick } from "es-toolkit";
import type { LLMConfigBody, LLMInput, UserInfo, UserKeysFlat } from "lib";
import { catchError, defer, from, lastValueFrom, map, of, switchMap, tap, throwError } from "rxjs";
import type { GenericSchema } from "valibot";

import { llmConfigTable, type LLMConfigModel } from "./llm.db.ts";
import type { DB } from "./pg.ts";
import { createConfig, type LLMConfigSeed } from "./seeds/llm/configs/common.ts";
import { getFile } from "./storage.ts";

/**
 * Copy template llm config for specific user
 */
export const copyToUser = async (config: LLMConfigSeed, user: number, db: DB) => {
  return createConfig(
    {
      ...config,
      user_id: user,
      uuid: undefined,
    },
    db,
  );
};

export const getLlmConfigByLabel = async (db: DB, label: string, user?: number) => {
  const result = await db.query.llmConfigTable.findFirst({
    where: {
      label,
      OR: [{ user_id: user }, { user_id: { isNull: true } }],
    },

    orderBy: {
      user_id: "asc",
    },

    with: {
      llmProviders: {
        orderBy: {
          priority: "asc",
        },

        with: {
          llms: {
            orderBy: {
              priority: "asc",
            },
          },
        },
      },
    },
  });

  if (!result) throw new Error("No such config!");

  if (user && !result?.user_id) {
    return copyToUser(result, user, db);
  }

  return result!;
};

export const updateLlmConfigByLabel = async (
  db: DB,
  label: string,
  config: LLMConfigBody,
  user?: number,
) => {
  const [result] = await db
    .update(llmConfigTable)
    .set({
      ...pick(config, ["max_input_tokens", "max_output_tokens", "temperature"]),
      inputs: config.inputs as LLMInput[],
    })
    .where(
      and(eq(llmConfigTable.label, label), user ? eq(llmConfigTable.user_id, user) : undefined),
    )
    .returning();

  if (!result) throw new Error("Error updating config!");
  return getLlmConfigByLabel(db, label, user);
};

export type LLMConfig = Awaited<ReturnType<typeof getLlmConfigByLabel>>;
export type ResolveInput = string;

const resolveInput = async (input?: LLMInput, user?: number) => {
  if (!input) return undefined;
  let text = "";

  if (input.kind === "file") {
    text = await getFile(`${user ? `users/${user}/` : ""}${input.ref}`)
      .download()
      .then((res) => res[0].toString("utf8"));
  } else {
    text = input.text || "";
    if (input.rel === "context") {
      text = `<context key="${input.key}">\n${text}</content>`;
    }
  }

  return text;
};

export type LlmRunOptsProcessed = Pick<
  LLMConfig,
  "label" | "llmProviders" | "max_input_tokens" | "max_output_tokens" | "temperature"
> & {
  systemPrompt?: string;
  prompt: string;
  candidates: LLMConfigModel[];
  candidate: number;
  keys: UserKeysFlat;

  /**
   * Schema for output validation
   */
  output?: GenericSchema;

  _processed: true;
};

export const toRunArgs = async (
  config: LLMConfig,
  user?: UserInfo,
  context?: Record<string, string>,
  schema?: GenericSchema,
): Promise<LlmRunOptsProcessed> => {
  return {
    _processed: true,
    candidate: 0,
    output: schema,

    candidates: config.llmProviders
      .flatMap((p, pidx) => p.llms.map((l) => ({ ...l, priority: p.priority + pidx + l.priority })))
      .sort((a, b) => a.priority - b.priority),

    ...pick(config, [
      "temperature",
      "max_input_tokens",
      "max_output_tokens",
      "label",
      "llmProviders",
    ]),

    keys: Object.fromEntries((user?.keys || []).map((i) => [i.type, i.key])) as UserKeysFlat,

    systemPrompt: await resolveInput(
      config.inputs?.find((i) => i.rel === "system_prompt"),
      user?.id,
    )!,
    prompt: (
      (await resolveInput(
        config.inputs?.find((i) => i.rel === "prompt"),
        user?.id,
      )) || ""
    )
      .concat("\n")
      .concat(
        (
          await Promise.all(
            config.inputs
              ?.filter((i) => i.rel === "context")
              .map(
                (i) =>
                  resolveInput(
                    {
                      ...i,
                      ...(i.kind === "text" ? { text: context?.[i.key] || "" } : undefined),
                    },
                    user?.id,
                  ) || "",
              ) || [],
          )
        )
          .filter((i) => i)
          .join("\n"),
      ),
  };
};

const attempt$ = (args: LlmRunOptsProcessed) =>
  defer(() => {
    const llm = args.candidates.at(args.candidate++);
    if (!llm) {
      throw new Error("No more providers!");
    }

    const providerOptions = {
      gateway: {
        byok: {
          anthropic: [{ apiKey: args.keys["Anthropic"] }],
          google: [{ apiKey: args.keys["Google AI"] }],
          openai: [{ apiKey: args.keys["OpenAI"] }],
        },
      },
    };

    let model = null;
    if (llm.provider === "google") {
      model = createGoogle({
        apiKey: args.keys["Google AI"],
      });
    }

    if (!model) {
      throw new Error(`Unsupported provider: ${llm.provider}`);
    }

    return from(
      generateText({
        model: model(llm.model),
        instructions: args.systemPrompt,
        prompt: args.prompt!,
        maxRetries: 2,
        providerOptions: providerOptions,
        output: args.output ? Output.object({ schema: valibotSchema(args.output) }) : undefined,
      }),
    );
  });

export const runLLM = (args: LlmRunOptsProcessed): Promise<string> => {
  return lastValueFrom(
    of(args).pipe(
      tap(console.log),
      switchMap((args) => attempt$(args)),
      map((result) => result.text),

      catchError((err) => {
        if (APICallError.isInstance(err)) {
          if ([400, 404, 429, 500].includes(err.statusCode!)) {
            // retry with alterate providers
            return from(runLLM(args));
          }
        }

        return throwError(() => err);
      }),
    ),
  );
};
