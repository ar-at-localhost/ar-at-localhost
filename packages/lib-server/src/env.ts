import { UUID } from "mongodb";

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

/**
 * Get allowed CORS origins
 */
export const getCors = (): string[] => (process.env.CORS_ALLOW || "").split(",").filter((i) => !!i);
