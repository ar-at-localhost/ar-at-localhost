import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import mongoose, { type ConnectOptions } from "mongoose";
import { getLocalKMSProvider, getNamespace } from "./kms.ts";
import { getMongocryptPath } from "./env.ts";

export const mongooseConnect = async (
  uri?: string,
  opts?: ConnectOptions,
): Promise<typeof mongoose> => {
  return mongoose.connect(
    uri || process.env.MONGODB_URI!,
    opts || {
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
    },
  );
};

export const mongoosePlugin: FastifyPluginAsync = fp(async (app) => {
  return await mongooseConnect()
    .then((res) => {
      app.log.info("Database is connected...");

      app.addHook("onClose", async () => {
        for (const connection of res?.connections || []) {
          await connection.close().catch(() => null);
          await connection.destroy().catch(() => null);
        }

        await mongoose.disconnect();
      });
    })
    .catch((err: Error) => {
      app.log.error(`Error connecting to the database: ${err?.message || "Something went wrong"}`);
      app.log.debug(err);
      app.log.debug(
        JSON.stringify({ uri: process.env.MONGODB_URI, database: process.env.MONGODB_DB }),
      );
    });
});
