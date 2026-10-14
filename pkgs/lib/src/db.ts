import type { FastifyPluginAsync } from "fastify";
import mongoose, { type ConnectOptions } from "mongoose";

export const connect = (uri?: string, opts?: ConnectOptions) =>
  mongoose.connect(uri || process.env.MONGODB_URI, opts);

export const fastifyPlugin: FastifyPluginAsync = async (app) => {
  await connect()
    .then(() => app.log.info("Database is connected..."))
    .catch((err: Error) => {
      app.log.error(`Error connecting to the database: ${err?.message || "Something went wrong"}`);
      app.log.debug(err);
    });
};
