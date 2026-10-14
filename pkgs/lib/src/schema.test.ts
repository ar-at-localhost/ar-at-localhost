import { describe, expect, it } from "vitest";
import { required, tooLong, tooShort } from "./schema";

describe("Schemas", () => {
  describe("required", () => {
    it("Creates message", () => {
      expect(required("First name")).toBe("First name is required!");
    });
  });

  describe("tooLong", () => {
    it("Creates message", () => {
      expect(tooLong("First name", 128)).toBe("First name too long (max: 128)");
    });
  });

  describe("tooShort", () => {
    it("Creates message", () => {
      expect(tooShort("First name", 8)).toBe("First name too short (min: 8)");
    });
  });
});
