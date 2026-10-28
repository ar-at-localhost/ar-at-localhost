import { describe, expect, it } from "vitest";
import { createContactSrv, getFalseContact } from "lib";

const baseURL = "http://localhost:5000";

describe("Contact", () => {
  describe("create", () => {
    it("should create a record", async () => {
      const body = getFalseContact();
      body.token = "XXXX-test-XXXX";
      const result = await createContactSrv(body, baseURL);
      expect(result).toBeTruthy();
      expect(result._id).toBeTruthy();
    }, 30_000);

    it("raise validation error", async () => {
      const body = getFalseContact();
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
