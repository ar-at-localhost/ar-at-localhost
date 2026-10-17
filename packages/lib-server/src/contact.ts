import { model, Schema } from "mongoose";
import { getMongoDEKs } from "./env.ts";
import { pipe, rfcEmail, safeParse, string } from "valibot";
import { UUID } from "mongodb";
import { sendMail } from "./mailer.ts";

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

      // HACK: `any` is workaround as there seems a mismatch between `mongoose` and `mongodb-client-encryption`
      // *mongoose* expects plain string (const) value: "equality"
      // *mongodb-client-encryption* expects as document as in form below
      encrypt: {
        keyId: new UUID(getMongoDEKs().contact.email),
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

contactSchema.post("save", (doc) => {
  const { CONTACT_PERSON_NAME, CONTACT_PERSON_EMAIL } = process.env;
  const { firstName, lastName, email } = doc;
  const bcc = [
    CONTACT_PERSON_NAME && CONTACT_PERSON_EMAIL
      ? `${CONTACT_PERSON_NAME} <${CONTACT_PERSON_EMAIL}>`
      : "",
  ].filter((i) => !!i);

  // PERF: DO NOT AWAIT
  sendMail({
    subject: "Brief received - Thank you",
    to: `${firstName}${lastName ? " " + lastName : ""} <${email}>`,
    bcc,
    text: `Hi ${firstName},

Thank you for getting in touch and submitting your brief. This is an automated email to confirm that it has successfully arrived.
I'll review it and be in touch with you soon.

Best regards,
${CONTACT_PERSON_NAME}
`,
  });
});

export const ContactModel = model("Contact", contactSchema);
export type { ContactBody, ContactDoc } from "lib";
