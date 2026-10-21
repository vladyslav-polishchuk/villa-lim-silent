import { cacheLife } from "next/cache";
import type { Availability } from "@/lib/availability";

const LISTING_URL =
  "https://www.istria-lux.com/en/accommodation/rovinj/villa-lim-silent/376/";

const croatianDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Zagreb" });

// Not a public API: the listing page embeds the calendar as JSON in a data attribute.
// Any failure returns null so the enquiry form keeps working without availability.
export async function getAvailability(): Promise<Availability | null> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 900, expire: 86_400 });

  try {
    const res = await fetch(LISTING_URL, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const start = croatianDate.format(new Date());
    const html = await res.text();

    const attr = html.match(/data-calendarConfig="([^"]+)"/i)?.[1];
    if (!attr) throw new Error("calendar config not found");
    const config: unknown = JSON.parse(attr.replaceAll("&quot;", '"').replaceAll("&amp;", "&"));
    const mask = (config as { availabilityMask?: unknown }).availabilityMask;
    if (typeof mask !== "string" || !/^[A-Z]+$/.test(mask)) {
      throw new Error("unexpected availability mask");
    }

    return { start, mask };
  } catch (err) {
    console.error("IstriaLux availability unavailable", err);
    return null;
  }
}
