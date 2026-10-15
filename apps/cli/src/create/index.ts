import { defineCommand } from "citty";

export const createCommand = defineCommand({
  meta: {
    name: "create",
    description: "Creation helper",
  },

  subCommands: {
    dek: import("./dek.ts").then((m) => m.dekCommand),
  },
});
