import { beforeEach, describe, expect, it } from "vitest";
import { getFalseContact, type ContactBody } from "lib";
import { ContactModel } from "./contact";

let contact: ContactBody;

describe("Contact", () => {
  beforeEach(() => {
    contact = getFalseContact();
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
