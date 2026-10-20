import { getTestMessageUrl } from "nodemailer";
import { getTransport } from "./transport.ts";
import type { SendEmailPayload } from "./types.ts";

const { CI, CONTACT_PERSON_NAME, CONTACT_PERSON_EMAIL, MAIL_SERVER, MAIL_FROM } = process.env;

const isCI = !!CI || CI === "";
const isTest = !MAIL_SERVER;
const contactPerson = CONTACT_PERSON_EMAIL
  ? `${CONTACT_PERSON_NAME} <${CONTACT_PERSON_EMAIL}>`
  : MAIL_FROM;

export const sendMail = async (
  opts: Omit<SendEmailPayload, "from"> & {
    from?: string;
  },
) => {
  const transport = await getTransport();
  const finalOpts = {
    ...opts,
    from: opts.from || MAIL_FROM!,
    subject: isCI ? `[TEST] ${opts.subject}` : opts.subject,
    to: (isCI ? contactPerson : opts.to) || contactPerson!,
  };

  return transport.sendMail(finalOpts).then((res) => {
    if (isTest) {
      const previewUrl = getTestMessageUrl(res.info);
      console.info("Test email sent:", previewUrl);
    }

    return res;
  });
};
