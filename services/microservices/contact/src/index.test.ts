import { createConnectSrv, getFalseConnect } from "lib";
import { describe, expect, it } from "vitest";

const baseURL = "http://localhost:5000";

describe("Contact", () => {
  describe("create", () => {
    it("should create a record", async () => {
      const body = getFalseConnect();
      const result = await createConnectSrv(body, baseURL);
      expect(result).toBeTruthy();
      expect(result.id).toBeTruthy();
    }, 30_000);

    it("raise validation error", async () => {
      const body = getFalseConnect();
      body.email = "foo@";

      const req = await fetch(`${baseURL}/`, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "CONTENT-TYPE": "application/json",
        },
      });

      const resp = req.clone();
      const result: Error = await resp.json();

      expect(req.status).toBe(400);
      expect(result.message).toBe("Invalid email!");
    });
  });
});
