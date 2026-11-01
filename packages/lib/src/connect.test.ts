import { beforeEach, describe, expect, it } from "vitest";
import { type ConnectBody, connectBodySchema, getFalseConnect } from "./connect";
import { randEmail, randText } from "@ngneat/falso";
import { parseAsync } from "valibot";

let connect: ConnectBody;

describe("Connect", () => {
  beforeEach(() => {
    connect = getFalseConnect();
  });

  describe("Type", () => {
    it("Enforces type", () => {
      expect(connect).toBeTruthy();
    });
  });

  describe("Body Schema", () => {
    it("Allows good values", async () => {
      connect.message = randText({ charCount: 128 });
      const result = await parseAsync(connectBodySchema, connect);
      expect(result.first_name).toEqual(connect.first_name);
    });

    it("Performs transforms", async () => {
      connect.email = randEmail().toUpperCase();
      const result = await parseAsync(connectBodySchema, connect);
      expect(result.first_name).toEqual(connect.first_name);
      expect(result.email).toEqual(connect.email.toLowerCase());
    });

    it("Rejects bad values", async () => {
      connect.first_name = "";
      await expect(parseAsync(connectBodySchema, connect)).rejects.toThrow();
    });
  });
});
