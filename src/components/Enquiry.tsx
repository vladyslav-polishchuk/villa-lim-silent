"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { sendEnquiry } from "@/app/actions";
import type { EnquiryError } from "@/app/actions";
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar";
import type { Dictionary } from "@/dictionaries/en";
import { checkAvailability, type Availability } from "@/lib/availability";
import {
  formatDateRange,
  formatPrice,
  lowestPrice,
  quoteStay,
  villa,
  type Rate,
} from "@/lib/content";
import { fill, plural, type Locale } from "@/lib/i18n";

export function Enquiry({
  lang,
  t,
  availability,
  rates,
}: {
  lang: Locale;
  t: Dictionary["enquiry"];
  availability: Availability | null;
  rates: Rate[];
}) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<EnquiryError | null>(null);
  const [pending, startTransition] = useTransition();

  const quote = useMemo(() => quoteStay(checkIn, checkOut, rates), [checkIn, checkOut, rates]);
  const conflict =
    availability && !quote.error ? checkAvailability(availability, checkIn, checkOut) : null;
  const notice = quote.error ?? conflict;
  const nights = (count: number) => `${count} ${plural(lang, count, t.nights)}`;
  const errorText = (code: EnquiryError) =>
    code === "minStay"
      ? fill(t.errors.minStay, { nights: nights(quote.minNights) })
      : t.errors[code];

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await sendEnquiry(formData);
      if (result.ok) {
        setSent(true);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <section id="enquire" className="bg-ink text-cream">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 md:grid-cols-[0.9fr_1.1fr] md:px-8 md:py-24">
        <div className="lg:flex lg:flex-col">
          <p className="text-xs tracking-[0.28em] text-gold uppercase">
            {t.eyebrow}
          </p>
          <h2 className="mt-3 font-serif text-4xl text-white md:text-5xl">
            {t.title}
          </h2>
          <p className="mt-5 leading-8 text-white/70">
            {fill(t.intro, { price: formatPrice(lowestPrice(rates), lang) })}
          </p>
          <div className="mt-8 rounded-2xl border border-white/10 lg:flex-1">
            <table className="w-full text-left text-sm lg:h-full">
              <thead className="text-gold">
                <tr>
                  <th className="px-4 py-3 font-medium">{t.table.dates}</th>
                  <th className="px-4 py-3 font-medium">{t.table.perNight}</th>
                  <th className="px-4 py-3 font-medium">{t.table.min}</th>
                </tr>
              </thead>
              <tbody>
                {rates.map((rate) => (
                  <tr key={rate.start} className="border-t border-white/10">
                    <td className="px-4 py-3">
                      {formatDateRange(rate.start, rate.end, lang)}
                    </td>
                    <td className="px-4 py-3">
                      {rate.discountedPrice === undefined ? (
                        formatPrice(rate.price, lang)
                      ) : (
                        <span
                          tabIndex={rate.description ? 0 : undefined}
                          aria-describedby={rate.description ? `rate-tip-${rate.start}` : undefined}
                          className="group relative inline-flex items-baseline gap-2 outline-none"
                        >
                          <s className="text-white/45">{formatPrice(rate.price, lang)}</s>
                          <span className="font-medium text-gold">
                            {formatPrice(rate.discountedPrice, lang)}
                          </span>
                          {rate.description && (
                            <span
                              id={`rate-tip-${rate.start}`}
                              role="tooltip"
                              className="pointer-events-none absolute bottom-full left-0 z-10 mb-2 w-max max-w-64 rounded-lg bg-white px-3 py-2 text-xs leading-5 text-ink opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus:opacity-100"
                            >
                              {rate.description}
                            </span>
                          )}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">{nights(rate.minNights)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {sent ? (
          <div className="flex items-center rounded-3xl bg-white/5 p-10">
            <p className="font-serif text-3xl text-white">
              {t.thanks}
            </p>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="flex flex-col gap-4 self-start rounded-3xl bg-white p-6 text-ink md:p-8 lg:self-stretch"
          >
            <input type="hidden" name="lang" value={lang} />
            {availability ? (
              <>
                <AvailabilityCalendar
                  lang={lang}
                  t={t.calendar}
                  availability={availability}
                  checkIn={checkIn}
                  checkOut={checkOut}
                  onChange={(from, to) => {
                    setCheckIn(from);
                    setCheckOut(to);
                  }}
                />
                <input type="hidden" name="checkIn" value={checkIn} />
                <input type="hidden" name="checkOut" value={checkOut} />
              </>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm">
                  {t.checkIn}
                  <input
                    required
                    type="date"
                    name="checkIn"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="rounded-xl border border-line px-3 py-3"
                  />
                </label>
                <label className="grid gap-2 text-sm">
                  {t.checkOut}
                  <input
                    required
                    type="date"
                    name="checkOut"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="rounded-xl border border-line px-3 py-3"
                  />
                </label>
              </div>
            )}
            <label className="grid gap-2 text-sm">
              {t.guestsLabel}
              <select
                name="guests"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="rounded-xl border border-line px-3 py-3"
              >
                {Array.from({ length: villa.guests }, (_, i) => i + 1).map(
                  (n) => (
                    <option key={n} value={n}>
                      {n} {plural(lang, n, t.guests)}
                    </option>
                  ),
                )}
              </select>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm">
                {t.name}
                <input required name="name" className="min-w-0 rounded-xl border border-line px-3 py-3" />
              </label>
              <label className="grid gap-2 text-sm">
                {t.email}
                <input
                  required
                  type="email"
                  name="email"
                  className="min-w-0 rounded-xl border border-line px-3 py-3"
                />
              </label>
            </div>
            <label className="grid gap-2 text-sm">
              {t.message}
              <textarea
                name="message"
                rows={4}
                className="rounded-xl border border-line px-3 py-3"
                placeholder={t.messagePlaceholder}
              />
            </label>
            <div className="mt-auto rounded-2xl bg-cream px-4 py-4 text-sm">
              {notice ? (
                <p>{errorText(notice)}</p>
              ) : (
                <p>
                  {formatDateRange(checkIn, checkOut, lang)} ·{" "}
                  {fill(t.estimate, { nights: nights(quote.nights) })}{" "}
                  <strong>{formatPrice(quote.total, lang)}</strong>
                </p>
              )}
            </div>
            {error && (
              <p role="alert" className="text-sm text-red-700">
                {errorText(error)}
              </p>
            )}
            <button
              type="submit"
              disabled={pending || Boolean(notice)}
              className="rounded-full bg-ink px-6 py-3.5 text-cream hover:bg-gold-deep disabled:opacity-60"
            >
              {pending ? t.sending : t.send}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
