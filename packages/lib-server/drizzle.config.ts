import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: [
    "./src/connect.ts",
    "./src/testimonial-request.ts",
    "./src/testimonial.ts",
    "./src/user.ts",
  ],
  dbCredentials: {
    url: process.env.DB_URI!,
  },
});
