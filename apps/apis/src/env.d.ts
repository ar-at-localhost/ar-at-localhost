import "lib/env.d.ts";

declare namespace NodeJS {
  interface ProcessEnv {
    BASE_URL: string;
    PORT: string;
  }
}
