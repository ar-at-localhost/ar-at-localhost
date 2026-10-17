export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MONGODB_URI: string;
    }
  }

  interface ImportMeta {
    env: Record<string, string>;
  }
}
