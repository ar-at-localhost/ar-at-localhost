import { defineEnvVars } from "@sveltejs/kit/env";

export const variables = defineEnvVars({
  PUBLIC_SRV_AUTH_URL: {
    public: true,
    static: true,
  },

  PUBLIC_SRV_CONTACT_URL: {
    public: true,
    static: true,
  },

  PUBLIC_SRV_URL: {
    public: true,
    static: true,
  },
});
