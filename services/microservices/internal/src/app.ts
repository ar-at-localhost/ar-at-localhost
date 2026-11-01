import packageInfo from "../package.json" with { type: "json" };
import { type BaseAppOpts, getBaseApp, pgPlugin } from "lib-server";
import { connectIntRest } from "./connect.ts";

const { name, version } = packageInfo;

export const createApp = async (
  opts?: BaseAppOpts & {
    noDatabase?: boolean;
  },
) => {
  const app = await getBaseApp({
    name: opts?.name,
    swagger: {
      openapi: {
        openapi: "3.0.3",
        info: {
          title: name,
          version: version,
        },
      },
    },
  });

  if (!opts?.noDatabase) {
    await app.register(pgPlugin);
  }

  app.register(connectIntRest, {
    prefix: "connect",
  });

  return app;
};
