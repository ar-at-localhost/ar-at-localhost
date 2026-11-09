import { type BaseAppOpts, getBaseApp, pgPlugin } from "lib-server";

import packageInfo from "../package.json" with { type: "json" };
import { connectIntRest } from "./connect.ts";
import { testimonialRest } from "./testimonial.rest.ts";

const { name, version } = packageInfo;

export const createApp = async (
  opts?: BaseAppOpts & {
    noDatabase?: boolean;
  },
) => {
  const app = await getBaseApp({
    name: "internal",
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

  app.register(testimonialRest, {
    prefix: "testimonial",
  });

  return app;
};
