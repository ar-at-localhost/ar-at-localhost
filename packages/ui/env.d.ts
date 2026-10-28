import "lib/env.d.ts";

declare namespace NodeJS {
  interface ProcessEnv {
    PUBLIC_SRV_URL: string;
    PORT: string;
  }
}

declare global {
  interface Window {
    turnstile: {
      render: (ref: string, opts: { sitekey: string; callback: (token: string) => void }) => void;
    };
  }
}
