import { readFileSync } from "node:fs";

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
    email: process.env.MONGODB_DEK_CONTACT_EMAIL!,
    message: process.env.MONGODB_DEK_CONTACT_MESSAGE!,
  },
});

/**
 * Get allowed CORS origins
 */
export const getCors = (): string[] => (process.env.CORS_ALLOW || "").split(",").filter((i) => !!i);

export const getSSL = () => ({
  cert: readFileSync(process.env.SSL_CERT_PATH!),
  key: readFileSync(process.env.SSL_CERT_KEY_PATH!),
});
