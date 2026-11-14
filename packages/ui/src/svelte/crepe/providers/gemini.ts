import { type AIProvider } from "@milkdown/crepe/feature/ai";

import { type GeminiOpts, parseSSE } from "./shared";

type GeminiStreamChunk = {
  index: number;
  delta: {
    text: string;
    event_type: string;
  };
};

export const gemini = (opts: GeminiOpts): AIProvider =>
  async function* (context, signal) {
    const config = {
      prompt: `${context.instruction}Do not add any extra context to your response.\n${context.selection}`,
    };

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/interactions?alt=sse",
      {
        body: JSON.stringify({
          model: opts.model || "gemini-3.5-flash-lite",
          input: config.prompt,
          stream: true,
        }),

        headers: opts.apiKey
          ? {
              "X-goog-api-key": opts.apiKey,
            }
          : {},

        method: "POST",
        signal,
      },
    );

    if (!response.ok || !response.body) throw new Error("AI request failed");

    for await (const payload of parseSSE(response, signal)) {
      console.log(payload);
      if (payload === "[DONE]") return;

      let event: GeminiStreamChunk;
      try {
        event = JSON.parse(payload) as GeminiStreamChunk;
      } catch {
        console.error("Payload:", payload);
        continue;
      }

      console.log("Event:", event);
      const delta = event?.delta?.text;
      if (delta) yield delta;
    }
  };
