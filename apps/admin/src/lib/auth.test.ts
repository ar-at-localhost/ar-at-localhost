import { describe, expect, it } from "vitest";

import { getToken, setAuth } from "./auth";

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
