"use client";

import { useState } from "react";
import type { Dictionary } from "@/dictionaries/en";
import {
  addDays,
  canArrive,
  checkAvailability,
  dayStatus,
  type Availability,
} from "@/lib/availability";
import { intlLocales, type Locale } from "@/lib/i18n";

type Props = {
  lang: Locale;
  t: Dictionary["enquiry"]["calendar"];
  availability: Availability;
  checkIn: string;
  checkOut: string;
  onChange: (checkIn: string, checkOut: string) => void;
};

const MONDAY = new Date("2024-01-01T12:00:00Z");

function monthStart(iso: string, offset = 0) {
  const date = new Date(`${iso.slice(0, 7)}-01T12:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + offset);
  return date.toISOString().slice(0, 10);
}

function monthDays(first: string) {
  const date = new Date(`${first}T12:00:00Z`);
  const lead = (date.getUTCDay() + 6) % 7;
  date.setUTCMonth(date.getUTCMonth() + 1, 0);
  const count = date.getUTCDate();
  return [
    ...Array<null>(lead).fill(null),
    ...Array.from({ length: count }, (_, i) => addDays(first, i)),
  ];
}

export function AvailabilityCalendar({ lang, t, availability, checkIn, checkOut, onChange }: Props) {
  const locale = intlLocales[lang];
  const firstMonth = monthStart(availability.start);
  const lastMonth = monthStart(addDays(availability.start, availability.mask.length - 1));
  const [month, setMonth] = useState(() => {
    if (checkIn > firstMonth) return monthStart(checkIn);
    const firstArrival = availability.mask.search(/[^NSD]/);
    return firstArrival > 0 ? monthStart(addDays(availability.start, firstArrival)) : firstMonth;
  });

  const monthLabel = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "UTC" });
  const dayLabel = new Intl.DateTimeFormat(locale, { dateStyle: "full", timeZone: "UTC" });
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" }).format(
      new Date(MONDAY.getTime() + i * 86_400_000),
    ),
  );

  const pickingDeparture = Boolean(checkIn) && !checkOut;
  const isDeparture = (day: string) =>
    pickingDeparture && day > checkIn && !checkAvailability(availability, checkIn, day);

  function select(day: string) {
    if (isDeparture(day)) onChange(checkIn, day);
    else if (canArrive(availability, day)) onChange(day, "");
  }

  const months = [month, monthStart(month, 1)];

  return (
    <div className="relative rounded-2xl border border-line p-4">
      <div className="absolute inset-x-4 top-4 z-10 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonth(monthStart(month, -1))}
          disabled={month <= firstMonth}
          aria-label={t.previous}
          className="rounded-full px-3 py-1 text-lg hover:bg-cream disabled:opacity-30"
        >
          ‹
        </button>
        <p className="sr-only">{pickingDeparture ? t.pickDeparture : t.pickArrival}</p>
        <button
          type="button"
          onClick={() => setMonth(monthStart(month, 1))}
          disabled={month >= lastMonth}
          aria-label={t.next}
          className="rounded-full px-3 py-1 text-lg hover:bg-cream disabled:opacity-30"
        >
          ›
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {months.map((first, index) => (
          <div key={first} className={index > 0 ? "hidden xl:block" : undefined}>
            <p className="py-1 text-center font-serif text-lg capitalize">
              {monthLabel.format(new Date(`${first}T12:00:00Z`))}
            </p>
            <div className="mt-2 grid grid-cols-7 text-center text-[11px] text-ink-soft">
              {weekdays.map((name) => (
                <span key={name} className="py-1">{name}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-1 text-center text-sm">
              {monthDays(first).map((day, i) => {
                if (!day) return <span key={`blank-${i}`} />;
                const booked = day >= availability.start && dayStatus(availability, day) === "N";
                const selectable = isDeparture(day) || canArrive(availability, day);
                const endpoint = day === checkIn || day === checkOut;
                const inRange = Boolean(checkOut) && day > checkIn && day < checkOut;
                return (
                  <button
                    key={day}
                    type="button"
                    disabled={!selectable}
                    onClick={() => select(day)}
                    aria-pressed={endpoint}
                    aria-label={`${dayLabel.format(new Date(`${day}T12:00:00Z`))}${booked ? ` – ${t.booked}` : ""}`}
                    className={[
                      "mx-auto flex aspect-square w-full max-w-9 items-center justify-center rounded-full",
                      endpoint
                        ? "bg-ink text-cream"
                        : inRange
                          ? "bg-gold/25"
                          : selectable
                            ? "hover:bg-cream"
                            : "",
                      !endpoint && booked ? "text-ink/30 line-through" : "",
                      !endpoint && !booked && !selectable ? "text-ink/40" : "",
                    ].join(" ")}
                  >
                    {Number(day.slice(8))}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink-soft">
        <span className="flex items-center gap-2">
          <span className="size-3 rounded-full border border-line" /> {t.available}
        </span>
        <span className="flex items-center gap-2">
          <span className="text-ink/30 line-through">12</span> {t.booked}
        </span>
        <span className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-ink" /> {t.selected}
        </span>
      </div>
    </div>
  );
}
