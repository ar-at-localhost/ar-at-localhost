import {
  boolean,
  email,
  maxLength,
  minLength,
  object,
  optional,
  pipe,
  rfcEmail,
  safeParse,
  string,
  toLowerCase,
} from "valibot";
import { required, tooLong, tooShort } from "./schema.ts";
import { model, Schema } from "mongoose";
import { randEmail, randFirstName, randLastName, randText } from "@ngneat/falso";

/**
 * A form submission
 */
export type Contact = {
  firstName: string;
  lastName?: string;
  email: string;
  message: string;

  /**
   * Tells if the `message` is markdown formatted or not
   */
  markdown?: boolean;
};

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

/**
 * Contact Schema for mongoose
 */
const contactSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    minLength: 1,
    maxLength: 128,
  },

  lastName: {
    type: String,
    maxLength: 128,
  },

  email: {
    type: String,
    set: (v: string) => v?.trim()?.toLowerCase(),
    required: true,
    validate: {
      validator: (v: string) => safeParse(pipe(string(), rfcEmail()), v).success,
      message: "`email` validation failed",
    },
  },

  message: {
    type: String,
    required: true,
    minLength: 128,
    maxLength: 10000,
  },

  markdown: {
    type: Boolean,
    default: false,
  },
});

/**
 * Create a false contact object for testing
 */
export const getFalseContact = () => ({
  firstName: randFirstName(),
  lastName: randLastName(),
  email: randEmail(),
  message: randText({ charCount: 128 }),
  markdown: false,
});

export const ContactModel = model("Contact", contactSchema);
