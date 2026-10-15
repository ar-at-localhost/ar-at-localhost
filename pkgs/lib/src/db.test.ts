import { afterEach, describe, expect, it, vi } from "vitest";
import { connect, fastifyPlugin } from "./db";
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
        const mongoose = await connect();
        expect(mongoose).toBeTruthy();
      });

      it("should fail to connect to bad URI", async () => {
        await expect(connect("not-a-mongodb-uri")).rejects.toThrow();
      });
    },
    60 * 1000,
  );

  describe("fastify", () => {
    it("registers", async () => {
      vi.spyOn(mongoose, "connect").mockResolvedValue(mongoose);
      const app = fastify();
      app.register(fastifyPlugin);
      await app.ready();
      expect(mongoose.connect).toHaveBeenCalled();
    });

    it("handles database error", async () => {
      const err = "test error";
      vi.spyOn(mongoose, "connect").mockRejectedValue(new Error(err));
      const app = fastify();
      const error = vi.spyOn(app.log, "error");
      app.register(fastifyPlugin);
      await app.ready();
      expect(error).toHaveBeenCalledWith(`Error connecting to the database: ${err}`);
    });

    it("handles database error gracefully", async () => {
      const err = "Something went wrong";
      vi.spyOn(mongoose, "connect").mockRejectedValue(1);
      const app = fastify();
      const error = vi.spyOn(app.log, "error");
      app.register(fastifyPlugin);
      await app.ready();
      expect(error).toHaveBeenCalledWith(`Error connecting to the database: ${err}`);
    });
  });
});
