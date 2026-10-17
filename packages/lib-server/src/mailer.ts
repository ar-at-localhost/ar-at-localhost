import {
  createTestAccount,
  createTransport,
  getTestMessageUrl,
  type Mail,
  type SendMailOptions,
} from "nodemailer";

const {
  CI,
  CONTACT_PERSON_NAME,
  CONTACT_PERSON_EMAIL,
  MAIL_SERVER,
  MAIL_PORT,
  MAIL_SECURE,
  MAIL_USER,
  MAIL_FROM,
  MAIL_PWD,
  NODE_ENV,
} = process.env;

const isTest = !MAIL_SERVER;
const contactPerson = CONTACT_PERSON_EMAIL
  ? `${CONTACT_PERSON_NAME} <${CONTACT_PERSON_EMAIL}>`
  : MAIL_FROM;

export const getTransport = (() => {
  let transport: Mail;

  return async () => {
    if (transport) return transport;
    const testAcc = await createTestAccount();
    if (NODE_ENV == "production" && isTest) {
      throw new Error("Missing email configurations.");
    }

    transport = createTransport({
      host: MAIL_SERVER || testAcc.smtp.host,
      port: MAIL_PORT || testAcc.smtp.port,
      secure: !!MAIL_SECURE || testAcc.smtp.secure,
      auth: {
        user: MAIL_USER || testAcc.user,
        pass: MAIL_PWD || testAcc.pass,
      },
    });

    await transport.verify();
    return transport;
  };
})();

export const sendMail = async (opts: SendMailOptions) => {
  const transport = await getTransport();
  const _opts = {
    from: MAIL_FROM,
    ...opts,
    to: CI ? contactPerson : opts.to,
  };

  return transport.sendMail(_opts).then((res) => {
    console.log(res);

    if (isTest) {
      const previewUrl = getTestMessageUrl(res);
      console.info("Test email sent:", previewUrl);
    }

    return res;
  });
};
