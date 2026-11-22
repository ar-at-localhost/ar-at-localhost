import { llmModelMap } from "lib";

import { createConfig } from "./common.ts";

export const leadLLMConfigs = {
  syncPortfolio: async () => {
    await createConfig({
      label: "sync-portfolio",
      temperature: 0.1,
      inputs: [
        {
          rel: "system_prompt",
          kind: "file",
          ref: "llm/portfolio-sp.md",
        },
        {
          rel: "prompt",
          kind: "file",
          ref: "llm/portfolio-p.md",
        },
        {
          rel: "context",
          kind: "file",
          ref: "llm/portfolio-whoami.md",
          key: "Profile",
        },
        {
          rel: "context",
          kind: "file",
          ref: "llm/portfolio-ghs.json",
          key: "Github Snapshot",
        },
      ],
      llmProviders: [
        {
          config: "",
          provider: "google",
          llms: llmModelMap.google.map((model) => ({
            model: model,
            config: "",
            provider: "",
          })),
        },
      ],
    });
  },

  jdToLead: async () => {
    await createConfig({
      label: "jd-to-lead",
      temperature: 0.1,
      inputs: [
        {
          rel: "system_prompt",
          kind: "file",
          ref: "llm/jd-to-lead-sp.md",
        },
        {
          rel: "prompt",
          kind: "file",
          ref: "llm/jd-to-lead-p.md",
        },
        {
          rel: "context",
          kind: "file",
          ref: "llm/portfolio-whoami.md",
          key: "Profile",
        },
        {
          rel: "context",
          kind: "file",
          ref: "llm/portfolio.md",
          key: "Portfolio",
        },
        {
          rel: "context",
          kind: "text",
          key: "Job Description",
          text: "# Job Description\n---\nReplace everything with valid job description.",
        },
      ],
      llmProviders: [
        {
          config: "",
          provider: "google",
          llms: llmModelMap.google.map((model) => ({
            model: model,
            config: "",
            provider: "",
          })),
        },
      ],
    });
  },

  findLeads: async () => {
    await createConfig({
      label: "find-leads",
      temperature: 0.25,
      inputs: [
        {
          rel: "system_prompt",
          kind: "file",
          ref: "llm/leads-sp.md",
        },
        {
          rel: "prompt",
          kind: "file",
          ref: "llm/leads-p.md",
        },
        {
          rel: "context",
          kind: "file",
          ref: "llm/portfolio-whoami.md",
          key: "Profile",
        },
        {
          rel: "context",
          kind: "file",
          ref: "llm/portfolio.md",
          key: "Portfolio",
        },
      ],
      llmProviders: [
        {
          config: "",
          provider: "google",
          llms: llmModelMap.google.map((model) => ({
            model: model,
            config: "",
            provider: "",
          })),
        },
      ],
    });
  },
};
