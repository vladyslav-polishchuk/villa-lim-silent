import { db } from "@/lib/bookings";

export type InvoiceSettings = {
  /** Account holder name. */
  receiver: string;
  bank: string;
  iban: string;
  bic: string;
  /** Percentage of the total due as a prepayment, 0-100. */
  prepaymentPercent: number | null;
};

/** Strip spaces and upper-case, so "hr12 3456 ..." and "HR123456..." compare equal. */
export function normalizeIban(value: string) {
  return value.replace(/\s+/g, "").toUpperCase();
}

/** Format/length plus the ISO 13616 mod-97 checksum. */
export function isValidIban(value: string) {
  const iban = normalizeIban(value);
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban)) return false;
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  let remainder = 0;
  for (const char of rearranged) {
    const digits = /\d/.test(char) ? char : String(char.charCodeAt(0) - 55);
    for (const d of digits) remainder = (remainder * 10 + Number(d)) % 97;
  }
  return remainder === 1;
}

/** BIC/SWIFT: 4 letter bank code, 2 letter country, 2 character location, optional 3 character branch. */
export function isValidBic(value: string) {
  return /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(normalizeIban(value));
}

export function formatIban(value: string) {
  return normalizeIban(value).replace(/(.{4})(?=.)/g, "$1 ");
}

export async function getInvoiceSettings(): Promise<InvoiceSettings> {
  const sql = await db();
  const empty: InvoiceSettings = { receiver: "", bank: "", iban: "", bic: "", prepaymentPercent: null };
  if (!sql) return empty;
  const rows = (await sql`SELECT key, value FROM settings WHERE key IN ('receiver', 'bank', 'iban', 'bic', 'prepaymentPercent')`) as {
    key: string;
    value: string;
  }[];
  const map = new Map(rows.map((r) => [r.key, r.value]));
  const percent = map.get("prepaymentPercent");
  return {
    receiver: map.get("receiver") ?? "",
    bank: map.get("bank") ?? "",
    iban: map.get("iban") ?? "",
    bic: map.get("bic") ?? "",
    prepaymentPercent: percent === undefined ? null : Number(percent),
  };
}

export type CompleteInvoiceSettings = InvoiceSettings & { prepaymentPercent: number };

/** True when everything the approval email needs is saved and valid. */
export function isInvoiceComplete(s: InvoiceSettings): s is CompleteInvoiceSettings {
  return (
    s.receiver.trim() !== "" &&
    s.bank.trim() !== "" &&
    isValidIban(s.iban) &&
    isValidBic(s.bic) &&
    s.prepaymentPercent !== null &&
    s.prepaymentPercent > 0
  );
}

export async function saveInvoiceSettings(settings: CompleteInvoiceSettings) {
  const sql = await db();
  if (!sql) throw new Error("database is not configured");
  const upsert = (key: string, value: string) =>
    sql`INSERT INTO settings (key, value) VALUES (${key}, ${value})
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`;
  await sql.transaction([
    upsert("receiver", settings.receiver),
    upsert("bank", settings.bank),
    upsert("iban", settings.iban),
    upsert("bic", settings.bic),
    upsert("prepaymentPercent", String(settings.prepaymentPercent)),
  ]);
}
