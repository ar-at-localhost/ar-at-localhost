import { testSetup, testTeardown } from "lib-server";

import { createApp } from "./app";

/**
 * Setup tests
 */
export const baseURL = "http://localhost:8003";
export const setup = async () => await testSetup(() => createApp(), { port: 8003 });
export const teardown = async () => await testTeardown();
