export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      CHROMIUM_PATH: string;
      MONGODB_URI: string;
      PORT: string;
      TEST_PORT: string;
    }
  }

  interface ImportMeta {
    env: Record<string, string>;
  }
}
