/**
 * Get allowed CORS origins
 */
export const getCors = (): string[] => (process.env.CORS_ALLOW || "").split(",").filter((i) => !!i);

/**
 * Get application stage (environment)
 */
export const getStage = () => process.env.PUBLIC_STAGE;

/**
 * Tells if running on production
 */
export const isProduction = () => getStage() === "prod";
export const isDev = () => getStage() === "dev";
export const isCI = () => getStage() === "ci";
export const isStaging = () => getStage() === "staging";

export const getTurnstile = () => ({
  TURNSTILE_SITEKEY: process.env.PUBLIC_TURNSTILE_SITEKEY!,
  TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY!,
});

const { CONTACT_PERSON_NAME, CONTACT_PERSON_EMAIL, MAIL_FROM } = process.env;

/**
 * Get contact person in mail recipient format
 *
 * @param strict Decides whether to fallback to `MAIL_FROM` or not
 */
export const getContactPerson = (strict?: boolean) =>
  CONTACT_PERSON_EMAIL
    ? `${CONTACT_PERSON_NAME} <${CONTACT_PERSON_EMAIL}>`
    : !strict
      ? MAIL_FROM
      : undefined;
