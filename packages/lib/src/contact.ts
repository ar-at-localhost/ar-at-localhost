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
 * Schema to validate a contact
 */
export const contactBodySchema = object({
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

export type ContactBody = InferOutput<typeof contactBodySchema>;
export type ContactDoc = ContactBody & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};
export type CreateContactResp = Pick<ContactDoc, "_id">;

/**
 * a fetch function for creating a new contact
 */
export const createContactSrv = async (
  body: ContactBody,
  path?: string,
): Promise<CreateContactResp> =>
  fetch(path ?? `${getAPIBaseURL()}/contact`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "CONTENT-TYPE": "application/json",
    },
  })
    .then(async (res) => {
      if (res.ok) {
        return res.json() as unknown as Promise<CreateContactResp>;
      }

      throw await res.json().catch(() => {
        throw new Error("Something went wrong!");
      });
    })
    .catch((err) => {
      throw new Error(err?.message || "Something went wrong!");
    });

/**
 * Create a false contact body object for testing
 */
export const getFalseContact = (): ContactBody => ({
  firstName: randFirstName(),
  lastName: randLastName(),
  email: randEmail(),
  message: randText({ charCount: 128 }),
  markdown: false,
});

/**
 * Contact Links
 */
export const links = {
  fiverr: "https://www.fiverr.com/s/gvvXllo",
  form: "#contact-form-container",
  github: "https://github.com/ar-at-localhost",
  linkedin: "https://linkedin.com/in/ar124officialwd",
  mail: "mailto:pro.se.ahmad.raza.1@gmail.com",
  upwork: "https://www.upwork.com/freelancers/~013dd6d70690822d44",
  whatsapp: "https://wa.me/923011353415",
};
