import { apiBaseURL, createContactSrv, getFalseContact } from "lib";
import { describe, expect, it } from "vitest";

const baseURL = `${apiBaseURL}/contact`;

describe("Contact", () => {
  describe("create", () => {
    it("should create a record", async () => {
      const body = getFalseContact();
      const result = await createContactSrv(body);
      console.log(result);
      expect(result).toBeTruthy();
      expect(result._id).toBeTruthy();
    });

    it("raise validation error", async () => {
      const body = getFalseContact();
      body.email = "foo@";

      const req = await fetch(`${baseURL}`, {
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
