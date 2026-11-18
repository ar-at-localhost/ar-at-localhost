export interface LLMRunOpts {
  config: {
    provider: "Gemini";
    model:
      | "gemini-3.1-flash"
      | "gemini-3.1-flash-lite"
      | "gemini-3.1-flash-pro"
      | "gemini-3.5-flash"
      | "gemini-3.5-flash-lite"
      | "gemini-3.5-flash-pro"
      | "gemini-3.8-flash"
      | "gemini-4-carbon"
      | "gemini-4-hydrogen";
  };

  inputs: {
    systemPrompt: string;
    prompt: string;
    context: {
      key: string;
      content: string;
    }[];
  };
}

export interface LLMRun extends LLMRunOpts {
  output: string;
}

export interface LLMPipelineStep extends LLMRunOpts {
  order: number;
}

export type LLMPipeline = LLMRunOpts[];
