export type SendEmailPayload = {
  from: string;
  subject: string;
  to: string | string[];
  cc?: string[];
  bcc?: string[];
  text?: string;
  html?: string;
};

export type SendEmailResp = {
  id?: string;
};

export type MailClient = "nodemailer" | "resend";

/**
 * Generic type for send mail
 */
export type MailTransport<Client extends MailClient = MailClient> = {
  client: Client;
  verify: () => Promise<true>;
  sendMail: (opts: SendEmailPayload) => Promise<SendEmailResp>;
};
