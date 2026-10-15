#!/usr/bin/env node

import { defineCommand, runMain } from "citty";
import packageJson from "../package.json" with { type: "json" };
const { version } = packageJson;

const main = defineCommand({
  meta: {
    name: "ar-at-localhost",
    version,
    description: "CLI for managing `ar-at-localhost` repo.",
  },

  subCommands: {
    create: () => import("./create/index.ts").then((m) => m.createCommand),
  },
});

runMain(main).then(() => process.exit(0));
