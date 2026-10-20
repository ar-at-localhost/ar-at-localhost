import { beforeEach, describe, expect, it } from "vitest";
import { getConnectTemplate } from "./connect";

var template: string;

describe("connect", () => {
  beforeEach(async () => {
    template = await getConnectTemplate();
  });

  it("is built", async () => {
    expect(template).toEqual(String(template));
    expect(template).toBeTruthy();
  });

  it("should render", async () => {
    const ok = await getConnectTemplate();
    expect(ok).toEqual(String(ok));
    expect(ok).toBeTruthy();
  });
});
