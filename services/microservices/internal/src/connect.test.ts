import { describe, expect, it } from "vitest";

import { postConnectInt } from "./connect";

const baseURL = "http://localhost:8001";

describe("Contact", () => {
  describe("create", () => {
    it("should create a record", async () => {
      const result = await postConnectInt(1, baseURL);
      expect(result).toBeTruthy();
      expect(result.ok).toBeTruthy();
    }, 30_000);

    it("raise validation error", async () => {
      const req = await postConnectInt("foobar" as unknown as number, `${baseURL}`);
      const resp = req.clone();
      const result: Error = await resp.json();
      expect(req.status).toBe(400);
      expect(result.message).toBe("Invalid id!");
    });
  });
});
