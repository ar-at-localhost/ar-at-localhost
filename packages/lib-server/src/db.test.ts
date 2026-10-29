import { afterEach, describe, expect, it, vi } from "vitest";
import { mongooseConnect, mongoosePlugin } from "./db";
import fastify from "fastify";
import mongoose from "mongoose";

describe("db", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe(
    "connect",
    () => {
      it("should connect", async () => {
        const mongoose = await mongooseConnect();
        expect(mongoose).toBeTruthy();
      });

      it("should fail to connect to bad URI", async () => {
        await expect(mongooseConnect("not-a-mongodb-uri")).rejects.toThrow();
      });
    },
    60 * 1000,
  );

  describe("fastify", () => {
    it("registers", async () => {
      vi.spyOn(mongoose, "connect").mockResolvedValue(mongoose);
      const app = fastify();
      app.register(mongoosePlugin);
      await app.ready();
      expect(mongoose.connect).toHaveBeenCalled();
    });
  });
});
