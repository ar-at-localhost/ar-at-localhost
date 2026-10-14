import { beforeEach, describe, expect, it } from "vitest";
import { Contact, contactBodySchema, ContactModel, getFalseContact } from "./contact";
import { randText } from "@ngneat/falso";
import { parseAsync } from "valibot";

let contact: Contact;

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

    it("Rejects bad values", async () => {
      contact.firstName = "";
      await expect(parseAsync(contactBodySchema, contact)).rejects.toThrow();
    });
  });

  describe("Modal", () => {
    it("Instantiates", async () => {
      const record = new ContactModel(contact);
      expect(record._id).toBeTruthy();
    });

    it("Rejects bad values", async () => {
      contact.email = "foo@";
      const record = new ContactModel(contact);
      await record.validate().catch(() => null);
      expect(record.errors).toBeTruthy();
    });
  });
});
