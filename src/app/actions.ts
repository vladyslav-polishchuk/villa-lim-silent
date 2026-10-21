"use server";

import { saveBooking } from "@/lib/bookings";
import { sendMail } from "@/lib/mail";
import { checkAvailability, type AvailabilityError } from "@/lib/availability";
import { formatDateRange, siteUrl, quoteStay, villa, type QuoteError } from "@/lib/content";
import { defaultLocale, hasLocale, localeNames } from "@/lib/i18n";
import { getAvailability } from "@/lib/istria-lux";
import { getRates } from "@/lib/rates";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Comma-separated list of addresses from an environment variable; invalid entries are dropped. */
function addressList(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((address) => address.trim())
    .filter((address) => EMAIL.test(address));
}

export type EnquiryError =
  | QuoteError
  | AvailabilityError
  | "invalidDates"
  | "invalidGuests"
  | "missingName"
  | "invalidEmail"
  | "notConfigured"
  | "pricesUnavailable"
  | "sendFailed";

export type EnquiryResult = { ok: true } | { ok: false; error: EnquiryError };

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
  const requestedLang = field(formData, "lang", 5);
  const lang = hasLocale(requestedLang) ? requestedLang : defaultLocale;

  if (!ISO_DATE.test(checkIn) || !ISO_DATE.test(checkOut)) {
    return { ok: false, error: "invalidDates" };
  }
  if (!Number.isInteger(guests) || guests < 1 || guests > villa.guests) {
    return { ok: false, error: "invalidGuests" };
  }
  if (!name) {
    return { ok: false, error: "missingName" };
  }
  if (!EMAIL.test(email)) {
    return { ok: false, error: "invalidEmail" };
  }

  // Quote on the server from the sheet rates; never trust a total sent by the browser.
  const rates = await getRates();
  if (!rates) {
    return { ok: false, error: "pricesUnavailable" };
  }
  const quote = quoteStay(checkIn, checkOut, rates);
  if (quote.error) {
    return { ok: false, error: quote.error };
  }

  const availability = await getAvailability();
  const conflict = availability && checkAvailability(availability, checkIn, checkOut);
  if (conflict) {
    return { ok: false, error: conflict };
  }

  const id = crypto.randomUUID();
  try {
    const saved = await saveBooking({
      id,
      createdAt: Date.now(),
      name,
      email,
      checkIn,
      checkOut,
      guests,
      nights: quote.nights,
      total: quote.total,
      message,
      lang,
      status: "pending",
    });
    if (!saved) console.error("Booking storage is not configured; request was not saved");
  } catch (err) {
    // Never break the public form because storage is down; the email below still goes out.
    console.error("Booking save error", err);
  }

  const text = [
    `New stay request from ${name}`,
    "",
    `Dates: ${formatDateRange(checkIn, checkOut)} (${quote.nights} nights)`,
    `Guests: ${guests}`,
    `Language: ${localeNames[lang]}`,
    `Estimated total: €${quote.total.toFixed(0)}`,
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    "",
    "Message:",
    message || "(none)",
    "",
    `Review: ${siteUrl}/admin`,
  ].join("\n");

  const to = addressList(process.env.ENQUIRY_TO);
  if (to.length === 0) {
    console.error("ENQUIRY_TO is not set or has no valid email address");
    return { ok: false, error: "notConfigured" };
  }

  const result = await sendMail({
    fromName: "Villa enquiries",
    to,
    cc: addressList(process.env.ENQUIRY_CC),
    replyTo: { name, address: email },
    subject: `Stay request: ${checkIn} → ${checkOut}, ${name}`,
    text,
  });
  if (result !== "ok") return { ok: false, error: result };

  return { ok: true };
}
