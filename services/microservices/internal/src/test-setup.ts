import { testSetup, testTeardown } from "lib-server";
import { createApp } from "./app";

/**
 * Setup tests
 */
export const setup = async () => await testSetup(await createApp(), { port: 8001 });
export const teardown = async () => await testTeardown(await createApp());
