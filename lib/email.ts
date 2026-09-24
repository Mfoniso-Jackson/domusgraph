import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const fromAddress = process.env.EMAIL_FROM ?? "DomusGraph <onboarding@resend.dev>";

let client: Resend | null = null;

export function isEmailConfigured() {
  return Boolean(apiKey);
}

function getClient() {
  if (!client) client = new Resend(apiKey);
  return client;
}

export async function sendEmail(input: { to: string | string[]; subject: string; html: string }) {
  if (!isEmailConfigured()) return { skipped: true as const };
  try {
    const result = await getClient().emails.send({
      from: fromAddress,
      to: input.to,
      subject: input.subject,
      html: input.html
    });
    return { skipped: false as const, result };
  } catch (error) {
    console.error("Failed to send email", error);
    return { skipped: false as const, error };
  }
}
