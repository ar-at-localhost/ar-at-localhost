import {
  boolean,
  email,
  maxLength,
  minLength,
  object,
  optional,
  pipe,
  string,
  toLowerCase,
  type InferOutput,
} from "valibot";
import { required, tooLong, tooShort } from "./schema.ts";
import { randEmail, randFirstName, randLastName, randText } from "@ngneat/falso";
import { getAPIBaseURL } from "./env.ts";

/**
 * Schema to validate a connect
 */
export const connectBodySchema = object({
  firstName: pipe(
    string(required("First name")),
    minLength(1, required("First name")),
    maxLength(128, tooLong("Name", 128)),
  ),

  lastName: optional(pipe(string(), maxLength(128, tooLong("Name", 128)))),
  email: pipe(string(required("Email")), email("Invalid email!"), toLowerCase()),

  message: pipe(
    string(required("Message")),
    minLength(128, tooShort("Message", 128)),
    maxLength(10000, tooLong("Message", 10000)),
  ),

  markdown: optional(boolean()),
  token: optional(string()),
});

export type ConnectBody = InferOutput<typeof connectBodySchema>;

export type Connect = ConnectBody & {
  id: string;
  created_at: string;
  updated_at: string;
};

export type CreateConnectResp = Pick<Connect, "id">;

/**
 * a fetch function for creating a new connect
 */
export const createConnectSrv = async (
  body: ConnectBody,
  path?: string,
): Promise<CreateConnectResp> =>
  fetch(path ?? `${getAPIBaseURL()}/connect`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "CONTENT-TYPE": "application/json",
    },
  })
    .then(async (res) => {
      if (res.ok) {
        return res.json() as unknown as Promise<CreateConnectResp>;
      }

      throw await res.json().catch(() => {
        throw new Error("Something went wrong!");
      });
    })
    .catch((err) => {
      throw new Error(err?.message || "Something went wrong!");
    });

/**
 * Create a false connect body object for testing
 */
export const getFalseConnect = (): ConnectBody => ({
  firstName: randFirstName(),
  lastName: randLastName(),
  email: randEmail(),
  message: randText({ charCount: 128 }),
  markdown: false,
});

/**
 * Connect Links
 */
export const links = {
  fiverr: "https://www.fiverr.com/s/gvvXllo",
  form: "#connect-form-container",
  github: "https://github.com/ar-at-localhost",
  linkedin: "https://linkedin.com/in/ar124officialwd",
  mail: "mailto:pro.se.ahmad.raza.1@gmail.com",
  upwork: "https://www.upwork.com/freelancers/~013dd6d70690822d44",
  whatsapp: "https://wa.me/923011353415",
};
