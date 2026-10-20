import { model, Schema } from "mongoose";
import { getMongoDEKs, isProduction } from "./env.ts";
import { pipe, rfcEmail, safeParse, string } from "valibot";
import { UUID } from "mongodb";
import { sendMail } from "./mailer/index.ts";
import { renderConnectTemplate, renderConnectTextTemplate } from "./templates/connect.ts";

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

contactSchema.post("save", async (doc) => {
  const { CONTACT_PERSON_NAME, CONTACT_PERSON_EMAIL } = process.env;
  const { firstName, lastName, email } = doc;
  const bcc = [
    CONTACT_PERSON_NAME && CONTACT_PERSON_EMAIL
      ? `${CONTACT_PERSON_NAME} <${CONTACT_PERSON_EMAIL}>`
      : "",
  ].filter((i) => !!i);

  const data = {
    firstName,
    links: {
      fiverr: "https://www.fiverr.com/s/gvvXllo",
      linkedin: "https://linkedin.com/in/ar124officialwd",
      upwork: "https://www.upwork.com/freelancers/~013dd6d70690822d44",
      whatsapp: "https://wa.me/923011353415",
    },
  };

  const mailPromise = sendMail({
    subject: "Brief received - Thank you",
    to: `${firstName}${lastName ? " " + lastName : ""} <${email}>`,
    bcc,
    text: await renderConnectTextTemplate(data),
    html: await renderConnectTemplate(data),
  }).catch(() => null);

  // PERF: DO NOT AWAIT as that may delay or fail API request
  if (!isProduction()) {
    await mailPromise;
  }
});

export const ContactModel = model("Contact", contactSchema);
export type { ContactBody, ContactDoc } from "lib";
