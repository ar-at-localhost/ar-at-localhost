import { testSetup, testTeardown } from "lib-server";
import { createApp } from "./app";

/**
 * Setup tests
 */
export const setup = async () => await testSetup(await createApp());
export const teardown = async () => await testTeardown(await createApp());
