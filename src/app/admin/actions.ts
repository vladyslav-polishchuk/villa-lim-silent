"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { checkPassword, createSession, destroySession, isAdmin } from "@/lib/admin-auth";
import { getBooking, hitRateLimit, setStatus } from "@/lib/bookings";
import {
  approvalEmail,
  paymentNotReceivedEmail,
  PAYMENT_WINDOW_MS,
  prepaymentConfirmationEmail,
  rejectionEmail,
} from "@/lib/emails";
import { saveRates, validateRates } from "@/lib/rates";
import type { Rate } from "@/lib/content";
import {
  getInvoiceSettings,
  isInvoiceComplete,
  isValidBic,
  isValidIban,
  normalizeIban,
  saveInvoiceSettings,
} from "@/lib/settings";
import { sendMail } from "@/lib/mail";

const UUID = /^[0-9a-f-]{36}$/i;

export async function login(formData: FormData) {
  const password = formData.get("password");
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  // 10 attempts per 15 minutes per IP.
  if (await hitRateLimit(`login:${ip}`, 10, 900).catch(() => false)) {
    redirect("/admin?error=rate");
  }
  if (typeof password !== "string" || !checkPassword(password)) {
    redirect("/admin?error=password");
  }
  await createSession();
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin");
}

export async function decide(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin");

  const id = formData.get("id");
  const decision = formData.get("decision");
  if (typeof id !== "string" || !UUID.test(id)) return;
  if (
    decision !== "approved" &&
    decision !== "rejected" &&
    decision !== "confirmed" &&
    decision !== "payment_not_received"
  ) return;

  // Approval needs payment details; check before changing anything so nothing is half-done.
  if (decision === "approved" && (await getBooking(id))?.status !== "pending") return;
  const invoice = decision === "approved" ? await getInvoiceSettings() : null;
  if (invoice && !isInvoiceComplete(invoice)) {
    redirect("/admin?tab=invoice&error=invoice");
  }

  const updated = await setStatus(id, decision);
  if (!updated) return;

  let email;
  if (decision === "confirmed") {
    email = prepaymentConfirmationEmail(updated);
  } else if (decision === "payment_not_received") {
    email = paymentNotReceivedEmail(updated);
  } else if (invoice && isInvoiceComplete(invoice)) {
    email = approvalEmail(updated, {
      receiver: invoice.receiver,
      bank: invoice.bank,
      iban: invoice.iban,
      bic: invoice.bic,
      percent: invoice.prepaymentPercent,
      deadline: (updated.decidedAt ?? Date.now()) + PAYMENT_WINDOW_MS,
    });
  } else {
    email = rejectionEmail(updated);
  }

  const result = await sendMail({
    fromName: "Villa Lim Silent",
    to: updated.email,
    subject: email.subject,
    text: email.text,
    html: email.html,
  });

  revalidatePath("/admin");
  if (result !== "ok") redirect("/admin?tab=requests&error=mail");
}

const RATE_ROWS = 40;

export async function saveRatesAction(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin");

  const text = (key: string) => {
    const v = formData.get(key);
    return typeof v === "string" ? v.trim() : "";
  };
  const number = (v: string) => Number(v.replace(",", "."));

  const rates: Rate[] = [];
  for (let i = 0; i < RATE_ROWS; i++) {
    const start = text(`start_${i}`);
    const end = text(`end_${i}`);
    const price = text(`price_${i}`);
    const discounted = text(`discounted_${i}`);
    const minNights = text(`minNights_${i}`);
    // A fully blank row is how a season gets deleted.
    if (!start && !end && !price && !discounted && !minNights) continue;

    rates.push({
      start,
      end,
      price: number(price),
      minNights: number(minNights),
      discountedPrice: discounted ? number(discounted) : undefined,
      description: text(`description_${i}`),
    });
  }

  try {
    await saveRates(validateRates(rates));
  } catch (err) {
    const message = err instanceof Error ? err.message : "could not save";
    redirect(`/admin?tab=prices&formError=${encodeURIComponent(message)}`);
  }
  updateTag("rates");
  redirect("/admin?tab=prices&saved=1");
}

export async function saveInvoiceAction(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin");

  const ibanRaw = formData.get("iban");
  const text = (key: string, max: number) => {
    const v = formData.get(key);
    return typeof v === "string" ? v.trim().replace(/\s+/g, " ").slice(0, max) : "";
  };
  const receiver = text("receiver", 120);
  const bank = text("bank", 120);
  const bicRaw = formData.get("bic");
  const percentRaw = formData.get("prepaymentPercent");
  const iban = typeof ibanRaw === "string" ? normalizeIban(ibanRaw.slice(0, 60)) : "";
  const bic = typeof bicRaw === "string" ? normalizeIban(bicRaw.slice(0, 20)) : "";
  const percent = typeof percentRaw === "string" ? Number(percentRaw.trim().replace(",", ".")) : NaN;

  let problem: string | null = null;
  if (!receiver) problem = "receiver is required";
  else if (!bank) problem = "bank is required";
  else if (!isValidIban(iban)) problem = "the IBAN is not valid";
  else if (!isValidBic(bic)) problem = "the BIC is not valid (8 or 11 characters)";
  else if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
    problem = "prepayment must be a number from 0 to 100";
  }
  if (problem) redirect(`/admin?tab=invoice&formError=${encodeURIComponent(problem)}`);

  try {
    await saveInvoiceSettings({ receiver, bank, iban, bic, prepaymentPercent: percent });
  } catch (err) {
    console.error("Invoice settings save error", err);
    redirect("/admin?tab=invoice&formError=could%20not%20save");
  }
  redirect("/admin?tab=invoice&saved=1");
}
