import { authPlugin, type BaseAppOpts, getBaseApp, pgPlugin } from "lib-server";

import packageInfo from "../package.json" with { type: "json" };
import { contactRest } from "./connect.rest.ts";
import { testimonialRest } from "./testimonial.ts";

const { name, version } = packageInfo;

export const createApp = async (
  opts?: BaseAppOpts & {
    noDatabase?: boolean;
  },
) => {
  const app = await getBaseApp({
    name: "contact",
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

  app.register(authPlugin);
  app.register(contactRest);
  app.register(testimonialRest, {
    prefix: "/testimonial",
  });
  return app;
};
