import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: ["./src/connect.ts"],
  dbCredentials: {
    url: process.env.DB_URI!,
  },
});
