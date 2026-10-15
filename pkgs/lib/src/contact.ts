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
import mongoose, { model, Schema } from "mongoose";
import { randEmail, randFirstName, randLastName, randText } from "@ngneat/falso";
import { getMongoDEKs } from "./env.ts";

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
const contactSchema = new Schema(
  {
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

      encrypt: {
        keyId: getMongoDEKs().contact.email,
        // HACK: `any` is workaround as there seems a mismatch between `mongoose` and `mongodb-client-encryption`
        // *mongoose* expects plain string (const) value: "equality"
        // *mongodb-client-encryption* expects as document as in form below
        // See: https://mongoosejs.com/docs/field-level-encryption.html#integrating-with-mongodb-client-side-field-level-encryption
        queries: { queryType: "equality" } as unknown as any,
      },

      required: true,
      set: (v: string) => v?.trim()?.toLowerCase() || "",
      validate: {
        validator: (v: string) => safeParse(pipe(string(), rfcEmail()), v).success,
        message: "`email` validation failed",
      },
    },

    message: {
      type: String,

      encrypt: {
        keyId: getMongoDEKs().contact.message,
      },

      maxLength: 10000,
      minLength: 128,
      required: true,
    },

    markdown: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    encryptionType: "queryableEncryption",
  },
);

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

export const ContactModel = mongoose.models.Contact || model("Contact", contactSchema);
