import { type AIProvider } from "@milkdown/crepe/feature/ai";

import { type GAIOpts, parseSSE } from "./shared";

type GAiStreamChunk = {
  index: number;
  delta: {
    text: string;
    event_type: string;
  };
};

export const gemini = (opts: GAIOpts): AIProvider =>
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
      if (payload === "[DONE]") return;

      let event: GAiStreamChunk;
      try {
        event = JSON.parse(payload) as GAiStreamChunk;
      } catch {
        continue;
      }

      const delta = event?.delta?.text;
      if (delta) yield delta;
    }
  };
