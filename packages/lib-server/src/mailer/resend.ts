import { Resend } from "resend";
import type { SendEmailPayload, MailTransport } from "./types";

/**
 * Mail Transport adopter for Resend
 */
export const createTransport = (key: string): MailTransport<"resend"> => {
  const resend = new Resend(key);

  return {
    client: "resend",
    sendMail: async (opts: SendEmailPayload) => {
      const result = await resend.emails.send({
        ...opts,
        text: opts.text || "",
      });

      if (result.error) throw result.error;
      return result.data;
    },
    verify: async () => {
      const { error } = await resend.domains.list();
      if (error) throw error;
      return true;
    },
  };
};
