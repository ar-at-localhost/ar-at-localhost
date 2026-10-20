import packageInfo from "../package.json" with { type: "json" };
import { getBaseURL } from "lib";
import { describe, expect, it } from "vitest";

describe("App", () => {
  it("should be healthy", async () => {
    const result = await fetch(`${getBaseURL()}/health`, {
      method: "GET",
    });

    expect(result.status).toBe(200);
  });

  it("should return version info", async () => {
    const info = await fetch(`${getBaseURL()}/version`, {
      method: "GET",
    }).then((res) => res.json());

    expect(info.status).toBe(200);
    expect(info.version).toBe(packageInfo.version);
  });
});
