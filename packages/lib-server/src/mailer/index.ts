export * from "./types.ts";
import { getTestMessageUrl } from "nodemailer";
import { getTransport } from "./transport.ts";
import type { SendEmailPayload } from "./types.ts";
import { getContactPerson, getStage, isProduction } from "../env.ts";
const { MAIL_SERVER, MAIL_FROM } = process.env;

const isTest = !MAIL_SERVER;

export const sendMail = async (
  opts: Omit<SendEmailPayload, "from"> & {
    from?: string;
  },
) => {
  const transport = await getTransport();
  const finalOpts = {
    ...opts,
    from: opts.from || MAIL_FROM!,
    subject: isProduction()
      ? opts.subject
      : `[TEST - ${getStage()} - ${typeof opts.to == "string" ? opts.to : opts.to.join(",")}] ${opts.subject}`,
    to: isProduction() ? opts.to : ([getContactPerson(true)] as string[]),
    cc: isProduction() ? opts.cc : ([getContactPerson(true)].filter((i) => !!i) as string[]),
  };

  return transport.sendMail(finalOpts).then((res) => {
    if (isTest) {
      const previewUrl = getTestMessageUrl(res);
      console.info("Test email sent:", previewUrl);
    }

    return res;
  });
};
