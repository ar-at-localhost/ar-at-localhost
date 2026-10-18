import { createTestAccount, createTransport } from "nodemailer";

import { createResendTransport } from "./resend";
import type { MailTransport } from "./types";

const { MAIL_SERVER, MAIL_PORT, MAIL_SECURE, MAIL_USER, MAIL_PWD, RESEND_API_KEY, NODE_ENV } =
  process.env;

export const getTransport: () => Promise<MailTransport> = (() => {
  let transport: MailTransport;

  return async () => {
    if (transport) return transport;

    if (NODE_ENV == "production") {
      transport = createResendTransport(RESEND_API_KEY!);
    } else {
      const testAcc = await createTestAccount();
      transport = createTransport({
        host: MAIL_SERVER || testAcc.smtp.host,
        port: MAIL_PORT || testAcc.smtp.port,
        secure: !!MAIL_SECURE || testAcc.smtp.secure,
        auth: {
          user: MAIL_USER || testAcc.user,
          pass: MAIL_PWD || testAcc.pass,
        },
      }) as unknown as MailTransport<"nodemailer">;
    }

    transport.client = "nodemailer";
    await transport.verify();
    return transport;
  };
})();
