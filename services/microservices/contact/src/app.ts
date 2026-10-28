import packageInfo from "../package.json" with { type: "json" };
import { type BaseAppOpts, getBaseApp } from "lib-server";
import { contactRest } from "./contact.ts";

const { name, version } = packageInfo;

export const createApp = async (opts?: BaseAppOpts) => {
  const app = await getBaseApp({
    name: opts?.name,
    noDatabase: opts?.noDatabase,
    dontAwaitDatabase: opts?.dontAwaitDatabase,
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

  app.register(contactRest);
  return app;
};
