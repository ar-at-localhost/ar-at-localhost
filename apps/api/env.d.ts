import "lib/env.d.ts";

declare namespace NodeJS {
  interface ProcessEnv {
    PUBLIC_SRV_URL: string;
    PORT: string;
  }
}
