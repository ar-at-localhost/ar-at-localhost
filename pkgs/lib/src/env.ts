import { UUID } from "mongodb";

export const getCtx = () => {
  return process.env.NODE_ENV || "";
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
  const url = new URL(process.env.SRV_URL!);
  url.port = getPort().toString();
  return url.toString().replace(/\/$/, "");
};

/**
 * Retrieve MongoDB Crypt library path
 */
export const getMongocryptPath = (): string => {
  return process.env.MONGO_CRYPT_LIB!;
};

/**
 * Retrieve MongoDB Data Encryption key
 */
export const getMongoDEKs = () => ({
  contact: {
    email: new UUID(process.env.MONGODB_DEK_CONTACT_EMAIL),
    message: new UUID(process.env.MONGODB_DEK_CONTACT_MESSAGE),
  },
});
