import { Resend } from "resend";
import { env } from "../config/env.js";

let resendClient: Resend | null = null;

function getResend(): Resend | null {
  if (!env.RESEND_API_KEY) return null;
  if (!resendClient) {
    resendClient = new Resend(env.RESEND_API_KEY);
  }
  return resendClient;
}

function emailBrandHeader(): string {
  const logoUrl = `${env.APP_PUBLIC_URL.replace(/\/$/, "")}/brand/logo-dark-sm.png`;
  return `<img src="${logoUrl}" alt="HRMS" style="height:40px;margin:0 0 16px;display:block">`;
}

export async function sendPasswordEmail(params: {
  to: string;
  name: string;
  code: string;
  purpose: "RESET_PASSWORD" | "SET_PASSWORD";
}) {
  const subject = params.purpose === "SET_PASSWORD"
    ? "Create your HRMS password"
    : "Reset your HRMS password";

  const intro = params.purpose === "SET_PASSWORD"
    ? "Use this verification code to create your HRMS login password:"
    : "Use this verification code to reset your HRMS password:";

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a">
      ${emailBrandHeader()}
      <p>Hi ${params.name},</p>
      <p>${intro}</p>
      <p style="font-size:28px;font-weight:700;letter-spacing:4px">${params.code}</p>
      <p style="color:#64748b;font-size:13px">This code expires in 15 minutes. If you did not request this, you can ignore this email.</p>
    </div>
  `;

  const client = getResend();
  if (!client) {
    console.log(`[email:dev] ${subject} → ${params.to} | code: ${params.code}`);
    return { id: "dev-log" };
  }

  const result = await client.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: params.to,
    subject,
    html,
  });

  if (result.error) {
    const isLocalDev = env.APP_PUBLIC_URL.includes("localhost") || env.APP_PUBLIC_URL.includes("127.0.0.1");
    if (isLocalDev) {
      console.warn(`[email:fallback] Resend failed (${result.error.message}). Dev code for ${params.to}: ${params.code}`);
      return { id: "dev-fallback" };
    }
    if (result.error.message.includes("not authorized to send emails from")) {
      throw new Error(
        `Sender ${env.RESEND_FROM_EMAIL} is not verified in Resend. Add and verify the domain in the Resend dashboard.`,
      );
    }
    throw new Error(result.error.message);
  }

  return result.data;
}

export async function sendLateCheckInWarningEmail(params: {
  to: string;
  name: string;
  lateCount: number;
  threshold: number;
  month: number;
  year: number;
}) {
  const monthLabel = new Date(params.year, params.month - 1, 1).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
  const subject = "HRMS attendance warning: repeated late check-ins";
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a">
      ${emailBrandHeader()}
      <h2 style="margin:0 0 12px">Attendance Warning</h2>
      <p>Hi ${params.name},</p>
      <p>You have checked in late <strong>${params.lateCount}</strong> time(s) in ${monthLabel}.</p>
      <p>Our policy allows up to ${params.threshold} late check-ins per month before a warning is issued. Please ensure you arrive and check in on time going forward.</p>
      <p style="color:#64748b;font-size:13px">If you believe this is incorrect, contact HR.</p>
    </div>
  `;

  const client = getResend();
  if (!client) {
    console.log(`[email:dev] ${subject} → ${params.to} | lateCount=${params.lateCount}`);
    return { id: "dev-log" };
  }

  const result = await client.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: params.to,
    subject,
    html,
  });

  if (result.error) {
    const isLocalDev = env.APP_PUBLIC_URL.includes("localhost") || env.APP_PUBLIC_URL.includes("127.0.0.1");
    if (isLocalDev) {
      console.warn(`[email:fallback] ${result.error.message} | late warning for ${params.to}: count=${params.lateCount}`);
      return { id: "dev-fallback" };
    }
    throw new Error(result.error.message);
  }

  return result.data;
}
