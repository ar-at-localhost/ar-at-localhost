import { describe, expect, it, vi } from "vitest";

import { getToken, setAuth } from "./auth";

vi.mock("$app/env/public", () => ({
  PUBLIC_SRV_URL: "http://localhost:5000",
  PUBLIC_SRV_AUTH_URL: "http://localhost:5001",
}));

describe("lib#auth", () => {
  it("should set auth", () => {
    setAuth({
      token: "abcd",
      refreshToken: "defg",
    });

    const token = getToken();
    expect(token).toBe("abcd");
  });
});
