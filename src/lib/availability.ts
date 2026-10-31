import { nightsBetween } from "@/lib/content";

// One character per day starting at `start` (Croatian date the mask was read):
// A available, N booked, I/E arrival day, O last free night before a booking,
// D departure only, S no arrival or departure.
export type Availability = {
  start: string;
  mask: string;
};

export type AvailabilityError = "unavailable" | "noArrival" | "noDeparture";

export function addDays(iso: string, days: number) {
  const date = new Date(`${iso}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Status for one day, or null when the date is beyond the published calendar. */
export function dayStatus(availability: Availability, iso: string) {
  const index = nightsBetween(availability.start, iso);
  if (index < 0) return "N";
  return availability.mask[index] ?? null;
}

export function canArrive(availability: Availability, iso: string) {
  const status = dayStatus(availability, iso);
  return status !== "N" && status !== "S" && status !== "D";
}

export function canDepart(availability: Availability, iso: string) {
  return dayStatus(availability, iso) !== "S";
}

export function checkAvailability(
  availability: Availability,
  from: string,
  to: string,
): AvailabilityError | null {
  for (let day = from; day < to; day = addDays(day, 1)) {
    if (dayStatus(availability, day) === "N") return "unavailable";
  }
  if (!canArrive(availability, from)) return "noArrival";
  if (!canDepart(availability, to)) return "noDeparture";
  return null;
}
