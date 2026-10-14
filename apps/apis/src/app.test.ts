import { getBaseURL } from "lib";
import { describe, expect, it } from "vitest";

describe("App", () => {
  it("should be healthy", async () => {
    const result = await fetch(`${getBaseURL()}/health`, {
      method: "GET",
    });

    expect(result.status).toBe(200);
  });
});
