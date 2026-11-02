import { testSetup, testTeardown } from "lib-server";

import { createApp } from "./app";

/**
 * Setup tests
 */
export const setup = async () =>
  await testSetup(() => createApp(), {
    port: 8002,
    before: async () => {},
  });
export const teardown = async () => await testTeardown();
