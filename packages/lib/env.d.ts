export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      CHROMIUM_PATH: string;
      MONGODB_URI: string;
    }
  }

  interface ImportMeta {
    env: Record<string, string>;
  }
}
