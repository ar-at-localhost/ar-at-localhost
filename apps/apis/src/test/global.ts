import { getPort } from "lib";
import { getApp } from "../app";

const app = getApp();

/**
 * Setup tests
 */
export const setup = async () => {
  await app.listen({
    port: getPort(),
  });

  await app.ready();
  // TODO: Cleanup database
};

export const teardown = async () => {
  await app.close();
  // TODO: Cleanup database
};
