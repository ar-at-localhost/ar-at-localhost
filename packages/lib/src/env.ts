/**
 * Get port of a running server
 */

export const getHost = () => {
  return process.env.HOST!;
};

/**
 * Get port of a running server
 */
export const getPort = () => {
  return parseInt(process.env.PORT!);
};

/**
 * Get base URL of a running server
 */
export const getBaseURL = () => {
  let url: string = "";

  if (globalThis["process"]) {
    url = new URL(process.env.PUBLIC_SRV_URL!).toString();
  } else if (import.meta["env"]) {
    url = new URL(import.meta.env.PUBLIC_SRV_URL!).toString();
  }

  return url.toString().replace(/\/$/, "");
};

export const getAPIBaseURL = (base?: string) => `${base || getBaseURL()}/api`;
