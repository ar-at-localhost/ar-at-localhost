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

  interface ImportMetaEnv {
    PUBLIC_SRV_URL: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
