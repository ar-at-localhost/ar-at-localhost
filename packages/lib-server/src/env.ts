/**
 * Get allowed CORS origins
 */
export const getCors = (): string[] => (process.env.CORS_ALLOW || "").split(",").filter((i) => !!i);

/**
 * Tells if running on production
 */
export const isProduction = () =>
  process.env.NODE_ENV === "production" && process.env.DEBUG !== "debug";

/**
 * Tells if running on local or unrecognized environment
 */
export const isDev = () => {
  return !["staging", "production"].includes(process.env.NODE_ENV || "");
};

export const getTurnstile = () => ({
  TURNSTILE_SITEKEY: process.env.PUBLIC_TURNSTILE_SITEKEY!,
  TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY!,
});
