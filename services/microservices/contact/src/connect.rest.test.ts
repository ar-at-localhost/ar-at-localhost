import { createConnectSrv, fetchConnectsSrv, getFalseConnect } from "lib";
import { getTestAuth } from "lib-server";
import { describe, expect, it } from "vitest";

import { baseURL } from "./test-setup";

describe("Connect", () => {
  describe("create", () => {
    it("should create a record", async () => {
      const body = getFalseConnect();
      const result = await createConnectSrv(body, baseURL);
      expect(result).toBeTruthy();
      expect(result.message).toBe("Request has been processed successfully!");
    }, 30_000);

    it("raise validation error", async () => {
      const body = getFalseConnect();
      body.email = "foo@";

      const req = await fetch(`${baseURL}/`, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "CONTENT-TYPE": "application/json",
        },
      });

      const resp = req.clone();
      const result: Error = await resp.json();

      expect(req.status).toBe(400);
      expect(result.message).toBe("Invalid email!");
    });
  });

  describe("fetch", () => {
    it("should return records", async () => {
      const result = await fetchConnectsSrv({
        baseURL,
        bearer: (await getTestAuth()).token,
        query: {
          limit: 15,
        },
      });

      expect(result.items).toBeTruthy();
      expect(result.page).toBe(1);
      expect(result.limit).toBe(15);
      expect(result.prev).toBeFalsy();
    });
  });
});
