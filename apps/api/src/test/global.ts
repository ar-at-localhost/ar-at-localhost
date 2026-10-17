import { getPort } from "lib";
import { getApp } from "../app";

const app = getApp(!!process.env.SSL_CERT_PATH);

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
