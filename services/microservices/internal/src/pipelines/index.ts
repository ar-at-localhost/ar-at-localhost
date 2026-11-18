import { GoogleGenAI } from "@google/genai";
import type { FastifyPluginAsync } from "fastify";
import { getFile, idSchema, type LlmRunArgs, mkLlmRunArgsSchema, okSchema } from "lib-server";
import { type InferOutput, looseObject } from "valibot";

export * from "./llm.ts";
export * from "./leads.rest.ts";

const userParamsSchema = looseObject({
  user: idSchema,
});

type UserParams = InferOutput<typeof userParamsSchema>;

export const pipelineRest: FastifyPluginAsync = async (app) => {
  /*
   * Run an LLM pipeline
   */
  app.post(
    "/run/:user",
    {
      schema: {
        params: userParamsSchema,
        body: mkLlmRunArgsSchema("Gemini"),

        response: {
          200: okSchema,
        },
      },
    },
    async (req, res) => {
      const genai = new GoogleGenAI();
      const params = req.params as UserParams;
      const body = req.body as LlmRunArgs;

      const result = genai.models.generateContent({
        model: body.config.model,
        config: {
          systemInstruction: body.inputs.systemPrompt,
          temperature: body.config.temperature,
        },
        contents: [
          ...(body.inputs.prompt.parts ? body.inputs.prompt.parts : []),
          ...(body.inputs.prompt.source
            ? [
                await getFile(`user/${params.user}/${body.inputs.prompt.source.ref}`)
                  .download()
                  .then((i) => i[0].toString("utf8")),
              ]
            : []),
          ...body.inputs.context.map((i) => `<context>${i}</context>`),
        ],
      });

      res.status(200).send({
        message: (await result).candidates?.map((i) => i.content).join("\n"),
      });
    },
  );
};
