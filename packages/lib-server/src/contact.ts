import { model, Schema, type HydratedDocument, type InferSchemaType } from "mongoose";
import { getMongoDEKs } from "./env.ts";
import { pipe, rfcEmail, safeParse, string } from "valibot";
import { randFirstName, randLastName, randEmail, randText } from "@ngneat/falso";

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
      required: false,
      default: false,
    },
  },
  {
    timestamps: true,
    encryptionType: "queryableEncryption",
  },
);

export const ContactModel = model("Contact", contactSchema);
export type Contact = InferSchemaType<typeof contactSchema>;
export type ContactBody = Omit<Contact, "_id" | "createdAt" | "updatedAt">;
export type ContactDoc = HydratedDocument<Contact>;

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
