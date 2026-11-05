import nodemailer from "nodemailer";

type Mail = {
  to: string | string[];
  cc?: string[];
  replyTo?: { name: string; address: string };
  fromName: string;
  subject: string;
  text: string;
  html?: string;
};

export type MailResult = "ok" | "notConfigured" | "sendFailed";

export async function sendMail(mail: Mail): Promise<MailResult> {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    console.error("GMAIL_USER or GMAIL_APP_PASSWORD is not set");
    return "notConfigured";
  }
  const transporter = nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
  try {
    await transporter.sendMail({
      from: { name: mail.fromName, address: user },
      to: mail.to,
      cc: mail.cc,
      replyTo: mail.replyTo,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    });
    return "ok";
  } catch (err) {
    console.error("Gmail send error", err);
    return "sendFailed";
  }
}
