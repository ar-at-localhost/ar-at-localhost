import { getBaseURL, getPort } from "lib";
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
};

export const teardown = async () => {
  await app.close();
};

export const apiBaseURL = `${getBaseURL()}/api`;
