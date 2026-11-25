export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ADMIN_EMAIL: string;
      ADMIN_NAME: string;
      ADMIN_PASSWORD: string;
      AI_GITHUB_TOKEN: string;
      AI_GITHUB_HANDLE: string;
      AI_GOOGLE_GENERATIVE_API_KEY: string;
      CHROMIUM_PATH: string;
      MONGODB_URI: string;
      PORT: string;
      TEST_PORT: string;
      TF_VAR_jwt: string;
      TF_VAR_project_id: string;
      PUBLIC_SRV_INT_URL: string;
    }
  }

  interface ImportMetaEnv {
    PUBLIC_SRV_AUTH_URL: string;
    PUBLIC_SRV_URL: string;
    [key: string]: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
