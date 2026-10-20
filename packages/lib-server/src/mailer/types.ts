import type { SendmailSentMessageInfo } from "nodemailer";

export type SendEmailPayload = {
  from: string;
  subject: string;
  to: string | string[];
  cc?: string[];
  bcc?: string[];
  text?: string;
  html?: string;
};

export type SendEmailResp = Partial<SendmailSentMessageInfo>;
export type MailClient = "nodemailer" | "resend";

/**
 * Generic type for send mail
 */
export type MailTransport<Client extends MailClient = MailClient> = {
  client: Client;
  verify: () => Promise<true>;
  sendMail: (opts: SendEmailPayload) => Promise<SendEmailResp>;
};
