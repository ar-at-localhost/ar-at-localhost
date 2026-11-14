export type BaseProviderOpts = {
  apiKey?: string;
  model?: string;
};

export interface GeminiOpts extends BaseProviderOpts {}
export type AIProviders = "gemini";

export interface ProviderOpts {
  gemini: GeminiOpts;
}

export async function* parseSSE(response: Response, signal: AbortSignal): AsyncGenerator<string> {
  if (!response.body) return;
  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  try {
    while (true) {
      if (signal.aborted) return;
      const { done, value } = await reader.read();
      if (signal.aborted) return;
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let nl: number;
      while ((nl = buffer.indexOf("\n")) >= 0) {
        const raw = buffer.slice(0, nl);
        buffer = buffer.slice(nl + 1);
        const line = raw.endsWith("\r") ? raw.slice(0, -1) : raw;
        if (line.startsWith("data: ")) {
          yield line.slice(6);
        } else if (line.startsWith("data:")) {
          yield line.slice(5);
        }
      }
    }
    // Flush a trailing data line that carries no newline. Strip only a
    // trailing `\r`, which covers a CRLF without its LF. Never call
    // `trim()` here, because whitespace at either edge of the payload is
    // significant for streamed token content.
    const tail = buffer.endsWith("\r") ? buffer.slice(0, -1) : buffer;
    if (tail.startsWith("data: ")) yield tail.slice(6);
    else if (tail.startsWith("data:")) yield tail.slice(5);
  } finally {
    reader.releaseLock();
  }
}
