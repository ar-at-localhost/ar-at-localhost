import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: [
    "./src/*.db.ts",
    "./src/connect.ts",
    "./src/testimonial-request.ts",
    "./src/testimonial.ts",
  ],
  dbCredentials: {
    url: process.env.DB_URI!,
  },
});
