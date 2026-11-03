import { defaultLocale, intlLocales, type Locale } from "@/lib/i18n";

// Search engines need absolute URLs; set NEXT_PUBLIC_SITE_URL to the production domain.
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "");

export const villa = {
  name: "Villa Lim Silent",
  location: "Matohanci, Rovinj",
  country: "Croatia",
  coordinates: {
    lat: 45.1112099,
    lng: 13.7551098,
    label: `45°06'40.4"N 13°45'18.3"E`,
  },
  mapsPlace: {
    name: "Villa with heated pool, patio & grill",
    featureId: "0x477cb9b263e8efe5:0x13772ba58561efcf",
    url: "https://www.google.com/maps/place/Villa+with+heated+pool,+patio+%26+grill/@45.1112099,13.7551098,17z/data=!3m1!4b1!4m6!3m5!1s0x477cb9b263e8efe5:0x13772ba58561efcf!8m2!3d45.1112099!4d13.7551098!16s%2Fg%2F11xkgcvrvz",
  },
  rating: 5,
  reviewCount: 17,
  guests: 6,
  bedrooms: 3,
  bathrooms: 2,
  livingArea: 140,
  plotArea: 650,
  poolArea: 31.5,
  beachKm: 3,
  checkIn: "16:00",
  checkOut: "10:00",
  pets: 1,
};

export const gallery = Array.from(
  { length: 53 },
  (_, i) => `/gallery/photo-${String(i + 1).padStart(2, "0")}.jpg`,
);

export type Rate = {
  start: string;
  end: string;
  /** Regular nightly price. */
  price: number;
  minNights: number;
  /** Lower nightly price that replaces `price` when set (always below `price`). */
  discountedPrice?: number;
  /** Shown as a tooltip next to the discounted price. */
  description?: string;
};

/** The nightly price a guest actually pays for this season. */
export function effectivePrice(rate: Rate) {
  return rate.discountedPrice ?? rate.price;
}

export function formatDateRange(start: string, end: string, locale: Locale = defaultLocale) {
  const fmt = new Intl.DateTimeFormat(intlLocales[locale], {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${fmt.format(new Date(`${start}T12:00:00`))} – ${fmt.format(new Date(`${end}T12:00:00`))}`;
}

export function nightsBetween(from: string, to: string) {
  const a = new Date(`${from}T12:00:00`);
  const b = new Date(`${to}T12:00:00`);
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

export function formatPrice(amount: number, locale: Locale = defaultLocale) {
  return new Intl.NumberFormat(intlLocales[locale], {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatRating(value: number, locale: Locale = defaultLocale) {
  return new Intl.NumberFormat(intlLocales[locale], {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}

export type QuoteError = "noDates" | "outOfSeason" | "minStay";

/** Lowest nightly price across all seasons, used for the "from €X" copy and structured data. */
export function lowestPrice(seasons: Rate[]) {
  return seasons.reduce((min, rate) => Math.min(min, effectivePrice(rate)), Infinity);
}

export function quoteStay(from: string, to: string, seasons: Rate[]) {
  const nights = nightsBetween(from, to);
  if (!from || !to || nights <= 0) {
    return { nights: 0, total: 0, minNights: 0, error: "noDates" as QuoteError };
  }

  let total = 0;
  let minNights = 1;
  const cursor = new Date(`${from}T12:00:00`);
  const last = new Date(`${to}T12:00:00`);

  while (cursor < last) {
    const iso = cursor.toISOString().slice(0, 10);
    const rate = seasons.find((r) => iso >= r.start && iso < r.end);
    if (!rate) {
      return {
        nights,
        total: 0,
        minNights: 0,
        error: "outOfSeason" as QuoteError,
      };
    }
    total += effectivePrice(rate);
    minNights = Math.max(minNights, rate.minNights);
    cursor.setDate(cursor.getDate() + 1);
  }

  if (nights < minNights) {
    return {
      nights,
      total,
      minNights,
      error: "minStay" as QuoteError,
    };
  }

  return { nights, total, minNights, error: null as QuoteError | null };
}
