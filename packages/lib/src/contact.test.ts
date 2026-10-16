import { beforeEach, describe, expect, it } from "vitest";
import { contactBodySchema, getFalseContact } from "./contact";
import { randEmail, randText } from "@ngneat/falso";
import { parseAsync } from "valibot";
import type { ContactBody } from "lib-server";

let contact: ContactBody;

describe("Contact", () => {
  beforeEach(() => {
    contact = getFalseContact();
  });

  describe("Type", () => {
    it("Enforces type", () => {
      expect(contact).toBeTruthy();
    });
  });

  describe("Body Schema", () => {
    it("Allows good values", async () => {
      contact.message = randText({ charCount: 128 });
      const result = await parseAsync(contactBodySchema, contact);
      expect(result.firstName).toEqual(contact.firstName);
    });

    it("Performs transforms", async () => {
      contact.email = randEmail().toUpperCase();
      const result = await parseAsync(contactBodySchema, contact);
      expect(result.firstName).toEqual(contact.firstName);
      expect(result.email).toEqual(contact.email.toLowerCase());
    });

    it("Rejects bad values", async () => {
      contact.firstName = "";
      await expect(parseAsync(contactBodySchema, contact)).rejects.toThrow();
    });
  });
});
