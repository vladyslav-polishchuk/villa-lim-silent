"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { sendEnquiry } from "@/app/actions";
import {
  formatDateRange,
  quoteStay,
  rates,
  villa,
} from "@/lib/content";

export function Enquiry() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const quote = useMemo(() => quoteStay(checkIn, checkOut), [checkIn, checkOut]);

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
        <div>
          <p className="text-xs tracking-[0.28em] text-gold uppercase">
            Reservation
          </p>
          <h2 className="mt-3 font-serif text-4xl text-white md:text-5xl">
            Request your stay
          </h2>
          <p className="mt-5 leading-8 text-white/70">
            From €{villa.fromPrice} per night. This first version estimates the
            published seasonal rate and collects an enquiry — it does not complete
            a booking.
          </p>
          <div className="mt-8 max-h-[320px] overflow-auto rounded-2xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="text-gold">
                <tr>
                  <th className="px-4 py-3 font-medium">Dates</th>
                  <th className="px-4 py-3 font-medium">Per night</th>
                  <th className="px-4 py-3 font-medium">Min.</th>
                </tr>
              </thead>
              <tbody>
                {rates.map((rate) => (
                  <tr key={rate.start} className="border-t border-white/10">
                    <td className="px-4 py-3">
                      {formatDateRange(rate.start, rate.end)}
                    </td>
                    <td className="px-4 py-3">€{rate.price.toFixed(0)}</td>
                    <td className="px-4 py-3">{rate.minNights} nights</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {sent ? (
          <div className="flex items-center rounded-3xl bg-white/5 p-10">
            <p className="font-serif text-3xl text-white">
              Thank you. Your request has been sent — we&apos;ll reply by email
              shortly.
            </p>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="grid gap-4 rounded-3xl bg-white p-6 text-ink md:p-8"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm">
                Check-in
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
                Check-out
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
            <label className="grid gap-2 text-sm">
              Guests
              <select
                name="guests"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="rounded-xl border border-line px-3 py-3"
              >
                {Array.from({ length: villa.guests }, (_, i) => i + 1).map(
                  (n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "guest" : "guests"}
                    </option>
                  ),
                )}
              </select>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm">
                Name
                <input required name="name" className="rounded-xl border border-line px-3 py-3" />
              </label>
              <label className="grid gap-2 text-sm">
                Email
                <input
                  required
                  type="email"
                  name="email"
                  className="rounded-xl border border-line px-3 py-3"
                />
              </label>
            </div>
            <label className="grid gap-2 text-sm">
              Message
              <textarea
                name="message"
                rows={4}
                className="rounded-xl border border-line px-3 py-3"
                placeholder="Anything we should know — pets, arrival time, questions."
              />
            </label>
            <div className="rounded-2xl bg-cream px-4 py-4 text-sm">
              {quote.error ? (
                <p>{quote.error}</p>
              ) : (
                <p>
                  {quote.nights} nights · estimated total{" "}
                  <strong>€{quote.total.toFixed(0)}</strong>
                </p>
              )}
            </div>
            {error && (
              <p role="alert" className="text-sm text-red-700">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-ink px-6 py-3.5 text-cream hover:bg-gold-deep disabled:opacity-60"
            >
              {pending ? "Sending…" : "Send request"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
