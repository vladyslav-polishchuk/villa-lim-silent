import { cacheLife } from "next/cache";
import type { Rate } from "@/lib/content";

const MAX_DESCRIPTION_LENGTH = 200;

// Only fetch the sheet over HTTPS from Google (Secure Node.js rule 7): the URL comes from an
// environment variable, but we rebuild the request URL ourselves from the sheet id and tab.
const SHEET_URL = /^https:\/\/docs\.google\.com\/spreadsheets\/d\/([A-Za-z0-9_-]+)/;
const SHEET_GID = /[?#&]gid=(\d+)/;

/**
 * Accepts either the CSV export link or the plain browser link of the sheet
 * (`.../d/<id>/edit?gid=0#gid=0`) and always returns the CSV export URL. The browser link returns
 * an HTML page, which is the easiest mistake to make when pasting into an env var.
 */
export function toCsvUrl(url: string): string | null {
  const id = SHEET_URL.exec(url.trim())?.[1];
  if (!id || id === "e") return null; // "d/e/..." is a "published to web" link, not supported
  const gid = SHEET_GID.exec(url)?.[1] ?? "0";
  return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const PL_DATE = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;

/** Minimal RFC 4180 CSV parser: handles quoted fields, escaped quotes and CRLF. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function parseDate(value: string): string | null {
  const text = value.trim();
  let iso: string | null = null;
  if (ISO_DATE.test(text)) {
    iso = text;
  } else {
    // Sheets with Polish settings may display a typed date as dd.mm.yyyy.
    const match = PL_DATE.exec(text);
    if (match) {
      iso = `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`;
    }
  }
  if (!iso) return null;
  // Reject impossible dates such as 2027-02-31 (they would silently roll over).
  const date = new Date(`${iso}T12:00:00Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== iso ? null : iso;
}

function parsePrice(value: string): number | null {
  // Accept "272.5", "272,5" (Polish decimal comma) and "€ 272.50".
  const text = value.replace(/[€\s]/g, "").replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(text)) return null;
  const price = Number(text);
  return Number.isFinite(price) && price > 0 ? price : null;
}

function parseNights(value: string): number | null {
  const text = value.trim();
  if (!/^\d{1,3}$/.test(text)) return null;
  const nights = Number(text);
  return nights >= 1 ? nights : null;
}

/**
 * Turn the sheet CSV into a validated, sorted rate list. Throws on any bad row so a typo in the
 * sheet never produces a half-broken price list; the caller then falls back to the built-in rates.
 */
export function parseRates(csv: string): Rate[] {
  const [header, ...body] = parseCsv(csv);
  if (!header) throw new Error("sheet is empty");

  const column = (name: string) => header.findIndex((h) => h.trim().toLowerCase() === name);
  const startCol = column("start");
  const endCol = column("end");
  const priceCol = column("regular price");
  const discountCol = column("discounted price");
  const nightsCol = column("min nights");
  const descriptionCol = column("description");
  if (startCol < 0 || endCol < 0 || priceCol < 0 || nightsCol < 0) {
    throw new Error("sheet header is missing a required column");
  }

  const rates: Rate[] = [];
  body.forEach((cells, index) => {
    if (cells.every((cell) => cell.trim() === "")) return; // blank row
    const line = index + 2; // 1-based, header is line 1

    const start = parseDate(cells[startCol] ?? "");
    const end = parseDate(cells[endCol] ?? "");
    const regular = parsePrice(cells[priceCol] ?? "");
    const discountText = discountCol >= 0 ? (cells[discountCol] ?? "").trim() : "";
    const discounted = discountText === "" ? null : parsePrice(discountText);
    const minNights = parseNights(cells[nightsCol] ?? "");

    if (!start || !end || end <= start) throw new Error(`row ${line}: invalid dates`);
    if (regular === null) throw new Error(`row ${line}: invalid regular price`);
    if (discountText !== "" && discounted === null) {
      throw new Error(`row ${line}: invalid discounted price`);
    }
    if (minNights === null) throw new Error(`row ${line}: invalid min nights`);

    const rate: Rate = { start, end, price: regular, minNights };
    // A discount only counts when it is actually lower; otherwise keep the regular price.
    if (discounted !== null && discounted < regular) {
      rate.discountedPrice = discounted;
      // Rendered as plain React text (escaped), so only length needs bounding here.
      const description = (descriptionCol >= 0 ? (cells[descriptionCol] ?? "") : "").trim();
      if (description !== "") rate.description = description.slice(0, MAX_DESCRIPTION_LENGTH);
    }
    rates.push(rate);
  });

  if (rates.length === 0) throw new Error("sheet has no rate rows");

  rates.sort((a, b) => a.start.localeCompare(b.start));
  for (let i = 1; i < rates.length; i++) {
    if (rates[i].start < rates[i - 1].end) {
      throw new Error(`seasons ${rates[i - 1].start} and ${rates[i].start} overlap`);
    }
  }
  return rates;
}

/**
 * Seasonal rates edited by the owner in a Google Sheet (RATES_SHEET_URL). The sheet is the only
 * source of prices: returns `null` when it cannot be loaded or is invalid, and callers show a
 * "prices unavailable" state instead of made-up numbers.
 */
export async function getRates(): Promise<Rate[] | null> {
  "use cache";

  // Never let this function throw: an error inside a "use cache" function fails the static
  // prerender (and so the whole deploy), even when the caller catches it.
  try {
    const raw = process.env.RATES_SHEET_URL;
    if (!raw) throw new Error("RATES_SHEET_URL is not set (restart the server after editing .env.local)");
    const url = toCsvUrl(raw);
    if (!url) {
      throw new Error("RATES_SHEET_URL must be a https://docs.google.com/spreadsheets/d/<id>/... link");
    }

    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("text/csv")) {
      // Typically a Google sign-in page: the sheet is not shared as "Anyone with the link: Viewer".
      throw new Error(`sheet did not return CSV (content-type: ${contentType || "none"})`);
    }
    const rates = parseRates(await res.text());

    cacheLife({ stale: 60, revalidate: 300, expire: 86_400 });
    return rates;
  } catch (err) {
    console.error("Rates sheet unavailable:", err instanceof Error ? err.message : err);
    // Keep a failure for seconds, not minutes, so the site recovers as soon as the sheet does.
    cacheLife({ stale: 0, revalidate: 15, expire: 60 });
    return null;
  }
}
