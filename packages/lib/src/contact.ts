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
import { apiBaseURL } from "./env.ts";

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
});

export type ContactBody = InferOutput<typeof contactBodySchema>;
export type ContactDoc = ContactBody & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * a fetch function for creating a new contact
 */
export const createContactSrv = async (body: ContactBody): Promise<Pick<ContactDoc, "_id">> =>
  fetch(`${apiBaseURL}/contact`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "CONTENT-TYPE": "application/json",
    },
  }).then((res) => res.json());

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
