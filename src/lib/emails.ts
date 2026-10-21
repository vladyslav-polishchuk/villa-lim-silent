import type { Booking } from "@/lib/bookings";
import { formatDateRange, siteUrl } from "@/lib/content";
import { formatIban } from "@/lib/settings";

const VILLA = "Villa Lim Silent";

export type PaymentTerms = {
  receiver: string;
  bank: string;
  iban: string;
  bic: string;
  percent: number;
  /** Absolute deadline, ms since epoch. */
  deadline: number;
};

export type Email = { subject: string; text: string; html: string };

// Everything interpolated into the HTML below goes through this (guest-supplied name, etc.).
function esc(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const euro = (n: number) => `€${n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const PAYMENT_WINDOW_MS = 24 * 60 * 60 * 1000;

/** Deadline used for admin previews: the real one starts when the admin confirms. */
export function previewDeadline() {
  return Date.now() + PAYMENT_WINDOW_MS;
}

export function prepaymentAmount(total: number, percent: number) {
  return Math.round(total * percent) / 100;
}

/** Short, human-friendly payment reference derived from the booking id. */
export function paymentReference(booking: Booking) {
  return `LIM-${booking.id.slice(0, 8).toUpperCase()}`;
}

const deadlineFormat = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "full",
  timeStyle: "short",
  timeZone: "Europe/Zagreb",
});

function layout(title: string, bodyHtml: string) {
  return `<!doctype html>
<html lang="en"><body style="margin:0;padding:0;background:#f4f1ec;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ec;padding:32px 12px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;font-family:Georgia,'Times New Roman',serif;color:#2b2b2b;">
<tr><td style="background:#1f2a24;padding:28px 32px;text-align:center;">
<div style="font-size:12px;letter-spacing:0.28em;text-transform:uppercase;color:#c9a96a;font-family:Helvetica,Arial,sans-serif;">Istria, Croatia</div>
<div style="font-size:26px;color:#ffffff;margin-top:6px;">${VILLA}</div>
</td></tr>
<tr><td style="padding:32px;font-size:16px;line-height:1.6;">
<h1 style="margin:0 0 16px;font-size:22px;font-weight:normal;color:#1f2a24;">${esc(title)}</h1>
${bodyHtml}
</td></tr>
<tr><td style="padding:20px 32px;background:#faf8f5;font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#777;text-align:center;">
${VILLA} &middot; <a href="${esc(siteUrl)}" style="color:#777;">${esc(siteUrl.replace(/^https?:\/\//, ""))}</a>
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

function detailsRows(rows: [string, string][]) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;border-top:1px solid #e6e0d6;font-family:Helvetica,Arial,sans-serif;font-size:14px;">
${rows
  .map(
    ([k, v]) =>
      `<tr><td style="padding:10px 0;border-bottom:1px solid #e6e0d6;color:#777;">${esc(k)}</td><td style="padding:10px 0;border-bottom:1px solid #e6e0d6;text-align:right;color:#1f2a24;"><strong>${esc(v)}</strong></td></tr>`,
  )
  .join("\n")}
</table>`;
}

export function approvalEmail(booking: Booking, terms: PaymentTerms): Email {
  const dates = formatDateRange(booking.checkIn, booking.checkOut);
  const amount = prepaymentAmount(booking.total, terms.percent);
  const iban = formatIban(terms.iban);
  const reference = paymentReference(booking);
  const deadline = deadlineFormat.format(terms.deadline);
  const percent = `${terms.percent}%`;

  const stay: [string, string][] = [
    ["Stay", `${dates} (${booking.nights} nights)`],
    ["Guests", String(booking.guests)],
    ["Total", euro(booking.total)],
  ];
  const payment: [string, string][] = [
    [`Prepayment (${percent})`, euro(amount)],
    ["Receiver", terms.receiver],
    ["Bank", terms.bank],
    ["IBAN", iban],
    ["BIC", terms.bic],
    ["Payment reference", reference],
    ["Pay by", deadline],
  ];

  const text = [
    `Dear ${booking.name},`,
    "",
    `Great news: your stay request at ${VILLA} has been approved.`,
    "",
    ...stay.map(([k, v]) => `${k}: ${v}`),
    "",
    "To confirm your reservation, please transfer a prepayment within 24 hours:",
    "",
    ...payment.map(([k, v]) => `${k}: ${v}`),
    "",
    `If the payment of at least ${percent} (${euro(amount)}) is not received by the deadline, the reservation is released and the dates may be offered to other guests. The remaining balance is settled as agreed with us.`,
    "",
    "We look forward to welcoming you.",
    `${VILLA}`,
  ].join("\n");

  const html = layout(
    "Your stay request is approved",
    `<p style="margin:0 0 12px;">Dear ${esc(booking.name)},</p>
<p style="margin:0 0 12px;">Great news: your stay request has been approved. We would be delighted to welcome you.</p>
${detailsRows(stay)}
<h2 style="margin:24px 0 8px;font-size:18px;font-weight:normal;color:#1f2a24;">Confirm your reservation</h2>
<p style="margin:0 0 4px;">Please transfer a prepayment of at least <strong>${esc(percent)}</strong> (<strong>${esc(euro(amount))}</strong>) within <strong>24 hours</strong> to the account below.</p>
${detailsRows(payment)}
<p style="margin:0 0 12px;font-size:14px;color:#555;">Please quote the payment reference so we can match your transfer. If the payment is not received by the deadline, the reservation is released and the dates may be offered to other guests. The remaining balance is settled as agreed with us.</p>
<p style="margin:24px 0 0;">Warm regards,<br>${VILLA}</p>`,
  );

  return { subject: `Your stay at ${VILLA} is approved: prepayment details`, text, html };
}

export function prepaymentConfirmationEmail(booking: Booking): Email {
  const dates = formatDateRange(booking.checkIn, booking.checkOut);
  const title = "Your booking is confirmed";
  const confirmation = `Thank you. We have received your prepayment, and your booking at ${VILLA} is confirmed.`;
  const welcome = "We look forward to welcoming you to Istria.";
  const stay: [string, string][] = [
    ["Stay", `${dates} (${booking.nights} nights)`],
    ["Guests", String(booking.guests)],
    ["Booking reference", paymentReference(booking)],
  ];
  const text = [
    `Dear ${booking.name},`,
    "",
    confirmation,
    "",
    ...stay.map(([k, v]) => `${k}: ${v}`),
    "",
    welcome,
    "",
    "Warm regards,",
    VILLA,
  ].join("\n");
  const html = layout(
    title,
    `<p style="margin:0 0 12px;">Dear ${esc(booking.name)},</p>
<p style="margin:0 0 12px;">${esc(confirmation)}</p>
${detailsRows(stay)}
<p style="margin:0 0 12px;">${esc(welcome)}</p>
<p style="margin:24px 0 0;">Warm regards,<br>${VILLA}</p>`,
  );

  return { subject: `Your booking at ${VILLA} is confirmed`, text, html };
}

export function paymentNotReceivedEmail(booking: Booking): Email {
  const dates = formatDateRange(booking.checkIn, booking.checkOut);
  const notice = `We did not receive the prepayment for your stay at ${VILLA} for ${dates}, so we have released your reservation.`;
  const followUp = "If you have already sent the payment or would like to check availability again, please reply to this email.";
  const text = [
    `Dear ${booking.name},`,
    "",
    notice,
    "",
    followUp,
    "",
    "Kind regards,",
    VILLA,
  ].join("\n");
  const html = layout(
    "Your reservation has been released",
    `<p style="margin:0 0 12px;">Dear ${esc(booking.name)},</p>
<p style="margin:0 0 12px;">${esc(notice)}</p>
<p style="margin:0 0 12px;">${esc(followUp)}</p>
<p style="margin:24px 0 0;">Kind regards,<br>${VILLA}</p>`,
  );

  return { subject: `Prepayment not received for your stay at ${VILLA}`, text, html };
}

export function rejectionEmail(booking: Booking): Email {
  const dates = formatDateRange(booking.checkIn, booking.checkOut);

  const text = [
    `Dear ${booking.name},`,
    "",
    `Thank you for your interest in ${VILLA}. Unfortunately we are unable to accept your request for ${dates}.`,
    "",
    "You are very welcome to send a new request for different dates, and we will be happy to help.",
    "",
    "Kind regards,",
    VILLA,
  ].join("\n");

  const html = layout(
    "About your stay request",
    `<p style="margin:0 0 12px;">Dear ${esc(booking.name)},</p>
<p style="margin:0 0 12px;">Thank you for your interest in ${VILLA}. Unfortunately we are unable to accept your request for <strong>${esc(dates)}</strong>.</p>
<p style="margin:0 0 12px;">You are very welcome to send a new request for different dates, and we will be happy to help.</p>
<p style="margin:24px 0 0;">Kind regards,<br>${VILLA}</p>`,
  );

  return { subject: `Your stay request at ${VILLA}`, text, html };
}
