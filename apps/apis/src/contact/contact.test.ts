import { Contact, getFalseContact } from "lib";
import { describe, expect, it } from "vitest";
import { apiBaseURL } from "../config.ts";

const baseURL = `${apiBaseURL}/contact`;

describe("Contact", () => {
  describe("create", () => {
    it("should create a record", async () => {
      const body = getFalseContact();

      const result: Contact = await fetch(`${baseURL}/`, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "CONTENT-TYPE": "application/json",
        },
      }).then((res) => res.json());

      expect(result).toBeTruthy();
      expect(result.email).toBe(body.email);
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
