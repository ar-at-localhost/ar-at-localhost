import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import mongoose, { type ConnectOptions } from "mongoose";
import { getLocalKMSProvider, getNamespace } from "./kms.ts";
import { getMongocryptPath } from "./env.ts";

export const mongooseConnect = async (
  uri?: string,
  opts?: ConnectOptions,
): Promise<typeof mongoose> => {
  return mongoose.connect(uri || process.env.MONGODB_URI!, {
    serverSelectionTimeoutMS: 60 * 1000,
    dbName: process.env.MONGODB_DB,

    autoEncryption: {
      keyVaultNamespace: getNamespace(),

      extraOptions: {
        cryptSharedLibPath: getMongocryptPath() as any,
        cryptSharedLibRequired: true,
      },

      kmsProviders: {
        local: getLocalKMSProvider(),
      },
    },

    ...opts,
  });
};

export const mongoosePlugin: FastifyPluginAsync = fp(async (app) => {
  await mongooseConnect()
    .then((res) => {
      app.log.info("Database is connected...");

      app.addHook("onClose", async () => {
        for (const connection of res?.connections || []) {
          await connection.close().catch(() => null);
          await connection.destroy().catch(() => null);
        }

        await mongoose.disconnect();
      });

      return true;
    })
    .catch((err: Error) => {
      app.log.error(`Error connecting to the database: ${err?.message || "Something went wrong"}`);
      app.log.debug(err);
      throw err;
    });
});
