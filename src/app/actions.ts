"use server";

import { formatDateRange, quoteStay, villa } from "@/lib/content";

const ENQUIRY_TO = ["gm.vpolishchuk@gmail.com", "zajbermatjaz@gmail.com"];
// Resend's shared test sender; it can only deliver to the Resend account owner's
// address. Replace with an address on a verified domain to send to everyone above.
const ENQUIRY_FROM = "Villa enquiries <onboarding@resend.dev>";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type EnquiryResult = { ok: true } | { ok: false; error: string };

function field(formData: FormData, key: string, maxLength: number) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function sendEnquiry(formData: FormData): Promise<EnquiryResult> {
  const checkIn = field(formData, "checkIn", 10);
  const checkOut = field(formData, "checkOut", 10);
  const guests = Number(field(formData, "guests", 3));
  const name = field(formData, "name", 120).replace(/[\r\n]+/g, " ");
  const email = field(formData, "email", 200);
  const message = field(formData, "message", 5000);

  if (!ISO_DATE.test(checkIn) || !ISO_DATE.test(checkOut)) {
    return { ok: false, error: "Please choose valid dates." };
  }
  if (!Number.isInteger(guests) || guests < 1 || guests > villa.guests) {
    return { ok: false, error: "Please choose a valid number of guests." };
  }
  if (!name) {
    return { ok: false, error: "Please enter your name." };
  }
  if (!EMAIL.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  const quote = quoteStay(checkIn, checkOut);
  if (quote.error) {
    return { ok: false, error: quote.error };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set");
    return { ok: false, error: "Sending is not configured yet. Please try again later." };
  }

  const text = [
    `New stay request from ${name}`,
    "",
    `Dates: ${formatDateRange(checkIn, checkOut)} (${quote.nights} nights)`,
    `Guests: ${guests}`,
    `Estimated total: €${quote.total.toFixed(0)}`,
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    "",
    "Message:",
    message || "(none)",
  ].join("\n");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: ENQUIRY_FROM,
      to: ENQUIRY_TO,
      reply_to: email,
      subject: `Stay request: ${checkIn} → ${checkOut}, ${name}`,
      text,
    }),
  });

  if (!response.ok) {
    console.error("Resend error", response.status, await response.text());
    return { ok: false, error: "Something went wrong sending your request. Please try again." };
  }

  return { ok: true };
}
