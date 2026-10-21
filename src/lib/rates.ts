import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/bookings";
import type { Rate } from "@/lib/content";

const MAX_DESCRIPTION_LENGTH = 200;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function parseDate(value: string): string | null {
  const iso = value.trim();
  if (!ISO_DATE.test(iso)) return null;
  // Reject impossible dates such as 2027-02-31 (they would silently roll over).
  const date = new Date(`${iso}T12:00:00Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== iso ? null : iso;
}

function sortAndCheckOverlap(rates: Rate[]): Rate[] {
  rates.sort((a, b) => a.start.localeCompare(b.start));
  for (let i = 1; i < rates.length; i++) {
    if (rates[i].start < rates[i - 1].end) {
      throw new Error(`seasons ${rates[i - 1].start} and ${rates[i].start} overlap`);
    }
  }
  return rates;
}

/** Validate seasons entered in the admin form. Throws an Error with a readable message. */
export function validateRates(input: Rate[]): Rate[] {
  if (input.length === 0) throw new Error("add at least one season");
  const rates = input.map((r, i): Rate => {
    const line = `season ${i + 1}`;
    const start = parseDate(r.start);
    const end = parseDate(r.end);
    if (!start || !end || end <= start) throw new Error(`${line}: invalid dates`);
    if (!Number.isFinite(r.price) || r.price <= 0 || r.price > 100_000) {
      throw new Error(`${line}: invalid regular price`);
    }
    if (!Number.isInteger(r.minNights) || r.minNights < 1 || r.minNights > 365) {
      throw new Error(`${line}: invalid min nights`);
    }
    const rate: Rate = { start, end, price: r.price, minNights: r.minNights };
    if (r.discountedPrice !== undefined) {
      if (!Number.isFinite(r.discountedPrice) || r.discountedPrice <= 0 || r.discountedPrice >= r.price) {
        throw new Error(`${line}: discounted price must be lower than the regular price`);
      }
      rate.discountedPrice = r.discountedPrice;
      const description = r.description?.trim().slice(0, MAX_DESCRIPTION_LENGTH);
      if (description) rate.description = description;
    }
    return rate;
  });
  return sortAndCheckOverlap(rates);
}

type RateRow = {
  start_date: string;
  end_date: string;
  price: string;
  discounted_price: string | null;
  min_nights: number;
  description: string | null;
};

async function loadStoredRates(): Promise<Rate[]> {
  const sql = await db();
  if (!sql) return [];
  const rows = (await sql`SELECT * FROM rates ORDER BY start_date`) as RateRow[];
  return rows.map((r) => {
    const rate: Rate = {
      start: r.start_date,
      end: r.end_date,
      price: Number(r.price),
      minNights: r.min_nights,
    };
    if (r.discounted_price !== null) rate.discountedPrice = Number(r.discounted_price);
    if (r.description) rate.description = r.description;
    return rate;
  });
}

export async function saveRates(rates: Rate[]) {
  const sql = await db();
  if (!sql) throw new Error("database is not configured");
  await sql.transaction([
    sql`DELETE FROM rates`,
    ...rates.map(
      (r) => sql`INSERT INTO rates (start_date, end_date, price, discounted_price, min_nights, description)
        VALUES (${r.start}, ${r.end}, ${r.price}, ${r.discountedPrice ?? null}, ${r.minNights}, ${r.description ?? null})`,
    ),
  ]);
}

/**
 * Seasonal rates edited by the owner in the admin page; the database is the only source of prices.
 * Returns `null` when they cannot be loaded or none are saved yet, and callers show a "prices
 * unavailable" state instead of made-up numbers.
 */
export async function getRates(): Promise<Rate[] | null> {
  "use cache";
  cacheTag("rates");

  // Never let this function throw: an error inside a "use cache" function fails the static
  // prerender (and so the whole deploy), even when the caller catches it.
  try {
    const rates = await loadStoredRates();
    if (rates.length === 0) throw new Error("no rates saved yet (add them on /admin)");
    cacheLife({ stale: 60, revalidate: 300, expire: 86_400 });
    return rates;
  } catch (err) {
    console.error("Rates unavailable:", err instanceof Error ? err.message : err);
    // Keep a failure for seconds, not minutes, so the site recovers as soon as rates are saved.
    cacheLife({ stale: 0, revalidate: 15, expire: 60 });
    return null;
  }
}
