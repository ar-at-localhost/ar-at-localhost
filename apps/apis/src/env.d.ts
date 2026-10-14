import "lib/env.d.ts";

declare namespace NodeJS {
  interface ProcessEnv {
    SRV_URL: string;
    PORT: string;
  }
}
