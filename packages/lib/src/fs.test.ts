import { describe, expect, it } from "vitest";

import { extractFileName } from "./fs.ts";

describe("fs", () => {
  describe("extractFileName", () => {
    it("extracts file name", () => {
      let expected = "portfolio-sp.md";
      expect(extractFileName('attachment; filename="portfolio-sp.md"')).toBe(expected);
      expect(extractFileName("attachment; filename*=UTF-8''portfolio-sp.md")).toBe(expected);

      expected = "my file.pdf";
      expect(extractFileName('attachment; filename="my file.pdf"')).toBe(expected);
      expect(extractFileName("attachment; filename*=UTF-8''my%20file.pdf")).toBe(expected);
    });
  });
});
