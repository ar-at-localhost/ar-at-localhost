import { loginSrv, refreshTokenSrv } from "lib";
import { getTestAuth } from "lib-server";
import { describe, expect, it } from "vitest";

const baseURL = "http://localhost:8002";

describe("Auth", () => {
  const authErr = {
    error: "Unauthenticated",
    message: "Invalid email or password!",
    statusCode: 401,
  };
  describe("Email", () => {
    it("let user login", async () => {
      const result = await loginSrv({
        baseURL,
        body: {
          email: process.env.ADMIN_EMAIL!,
          password: process.env.ADMIN_PASSWORD!,
        },
      });
      expect(result).toBeTruthy();
      expect(result.token).toBeTruthy();
      expect(result.refreshToken).toBeTruthy();
    }, 30_000);

    it("raise authentication error", async () => {
      await expect(
        loginSrv({
          baseURL,
          body: {
            email: process.env.ADMIN_EMAIL!,
            password: `it-does-not-work`,
          },
        }),
      ).rejects.toThrow(authErr);
    });

    it("raise validation error", async () => {
      await expect(
        loginSrv({
          baseURL,
          body: {
            email: process.env.ADMIN_EMAIL!,
            password: ``,
          },
        }),
      ).rejects.toThrow({
        error: "Bad Request",
        message: "Invalid email or password!",
        statusCode: 400,
      });
    });
  });

  describe("Refresh Token", () => {
    it("should refresh token", async () => {
      const auth = await getTestAuth();
      const result = await refreshTokenSrv({
        baseURL,
        bearer: auth.refreshToken,
      });

      expect(result).toBeTruthy();
      expect(result.token).toBeTruthy();
      expect(result.refreshToken).toBeTruthy();
    }, 30_000);

    it("should reject auth token", async () => {
      const auth = await getTestAuth();
      await expect(
        refreshTokenSrv({
          baseURL,
          bearer: auth.token,
        }),
      ).rejects.toThrow({
        ...authErr,
        message: "You are not logged in or your session has expired!",
      });
    }, 30_000);
  });
});
