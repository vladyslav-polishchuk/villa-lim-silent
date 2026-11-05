import Link from "next/link";
import { Suspense } from "react";
import { adminConfigured, isAdmin } from "@/lib/admin-auth";
import { listBookings, storageConfigured, type Booking } from "@/lib/bookings";
import { formatDateRange, type Rate } from "@/lib/content";
import { approvalEmail, previewDeadline, rejectionEmail } from "@/lib/emails";
import { getRates } from "@/lib/rates";
import { formatIban, getInvoiceSettings, isInvoiceComplete } from "@/lib/settings";
import { DecisionButton } from "./DecisionButton";
import { login, logout, saveInvoiceAction, saveRatesAction } from "./actions";

type SearchParams = { error?: string; formError?: string; saved?: string; tab?: string };

const tabs = [
  { id: "requests", label: "Booking requests" },
  { id: "invoice", label: "Invoice info" },
  { id: "prices", label: "Rent prices" },
] as const;
type TabId = (typeof tabs)[number]["id"];

const errors: Record<string, string> = {
  password: "Wrong password.",
  rate: "Too many attempts. Try again later.",
  invoice: "Fill in all invoice info (receiver, bank, IBAN, BIC, prepayment) before approving a request.",
  mail: "Status saved, but the email to the client failed to send.",
};

const badge: Record<Booking["status"], string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export default function AdminPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <Suspense fallback={<main className="p-8 text-sm">Loading…</main>}>
      <AdminContent searchParams={searchParams} />
    </Suspense>
  );
}

async function AdminContent({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { error, formError, saved, tab: tabParam } = await searchParams;
  const tab: TabId = tabs.find((t) => t.id === tabParam)?.id ?? "requests";
  const message = error ? errors[error] : undefined;

  if (!adminConfigured()) {
    return (
      <main className="mx-auto max-w-md p-8">
        Admin is not configured. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET (16+ characters).
      </main>
    );
  }

  if (!(await isAdmin())) {
    return (
      <main className="mx-auto max-w-sm p-8">
        <h1 className="mb-4 text-2xl font-semibold">Admin login</h1>
        {message && <p className="mb-3 text-sm text-red-700">{message}</p>}
        <form action={login} className="flex flex-col gap-3">
          <input
            type="password"
            name="password"
            required
            autoFocus
            autoComplete="current-password"
            placeholder="Password"
            className="rounded border border-black/20 px-3 py-2"
          />
          <button className="rounded bg-black px-3 py-2 text-white">Sign in</button>
        </form>
      </main>
    );
  }

  const [bookings, rates, invoice] = await Promise.all([
    listBookings(),
    getRates(),
    getInvoiceSettings(),
  ]);
  // With nothing saved yet, show one empty row so the first season can be entered.
  const rateRows: (Rate | null)[] = rates && rates.length > 0 ? rates : [null];

  // Previews use the same builders as the real send; the approval deadline is 24h from now.
  const approvalPreview = (b: Booking) =>
    isInvoiceComplete(invoice)
      ? approvalEmail(b, {
          receiver: invoice.receiver,
          bank: invoice.bank,
          iban: invoice.iban,
          bic: invoice.bic,
          percent: invoice.prepaymentPercent,
          deadline: previewDeadline(),
        })
      : null;
  const rejectionPreview = (b: Booking) => rejectionEmail(b);

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <form action={logout}>
          <button className="text-sm underline">Log out</button>
        </form>
      </div>
      <nav className="mb-6 flex gap-1 border-b border-black/15" aria-label="Admin sections">
        {tabs.map((t) => (
          <Link
            key={t.id}
            href={`/admin?tab=${t.id}`}
            aria-current={t.id === tab ? "page" : undefined}
            className={`-mb-px border-b-2 px-4 py-2 text-sm ${
              t.id === tab ? "border-black font-medium" : "border-transparent opacity-60 hover:opacity-100"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      {saved && <p className="mb-3 rounded bg-green-50 p-3 text-sm text-green-800">Saved.</p>}
      {message && <p className="mb-3 rounded bg-amber-50 p-3 text-sm">{message}</p>}
      {formError && (
        <p className="mb-3 rounded bg-red-50 p-3 text-sm text-red-700">Not saved: {formError}</p>
      )}
      {!storageConfigured() && (
        <p className="mb-3 rounded bg-red-50 p-3 text-sm text-red-700">
          Storage is not configured (DATABASE_URL missing).
        </p>
      )}

      {tab === "invoice" && (
        <section>
          <h2 className="mb-1 text-xl font-semibold">Invoice info</h2>
          <p className="mb-4 text-sm opacity-70">
            Bank account details and the share of the total that guests prepay.
          </p>
          <form action={saveInvoiceAction} className="flex max-w-md flex-col gap-3">
            <label className="flex flex-col gap-1 text-sm">
              Receiver (account holder)
              <input
                name="receiver"
                required
                maxLength={120}
                defaultValue={invoice.receiver}
                placeholder="Company or person name"
                className="rounded border border-black/20 px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Bank
              <input
                name="bank"
                required
                maxLength={120}
                defaultValue={invoice.bank}
                placeholder="Bank name"
                className="rounded border border-black/20 px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              IBAN
              <input
                name="iban"
                required
                maxLength={60}
                autoComplete="off"
                defaultValue={invoice.iban ? formatIban(invoice.iban) : ""}
                placeholder="HR12 3456 7890 1234 5678 9"
                className="rounded border border-black/20 px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              BIC / SWIFT
              <input
                name="bic"
                required
                maxLength={20}
                autoComplete="off"
                defaultValue={invoice.bic}
                placeholder="ZABAHR2X"
                className="w-48 rounded border border-black/20 px-3 py-2 uppercase"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Prepayment (percent of total)
              <input
                name="prepaymentPercent"
                required
                inputMode="decimal"
                defaultValue={invoice.prepaymentPercent ?? ""}
                placeholder="30"
                className="w-32 rounded border border-black/20 px-3 py-2"
              />
            </label>
            <button className="self-start rounded bg-black px-4 py-2 text-white">Save</button>
          </form>
        </section>
      )}

      {tab === "prices" && (
      <section>
        <h2 className="mb-1 text-xl font-semibold">Rent prices</h2>
        <p className="mb-4 text-sm opacity-70">
          Nightly price in EUR per season. Leave a row empty to delete it. Seasons must not
          overlap; the end date is the first day not covered. A discounted price must be lower
          than the regular one.
          {rates === null && " No prices are saved yet (or they could not be loaded)."}
        </p>
        <form action={saveRatesAction} className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="pr-2">Start</th>
                <th className="pr-2">End</th>
                <th className="pr-2">Price</th>
                <th className="pr-2">Discounted</th>
                <th className="pr-2">Min nights</th>
                <th>Discount note</th>
              </tr>
            </thead>
            <tbody>
              {rateRows.map((r, i) => (
                <tr key={i}>
                  <td className="pr-2 pb-1">
                    <input type="date" name={`start_${i}`} defaultValue={r?.start} className="w-full rounded border border-black/20 px-1 py-1" />
                  </td>
                  <td className="pr-2 pb-1">
                    <input type="date" name={`end_${i}`} defaultValue={r?.end} className="w-full rounded border border-black/20 px-1 py-1" />
                  </td>
                  <td className="pr-2 pb-1">
                    <input name={`price_${i}`} inputMode="decimal" defaultValue={r?.price} className="w-20 rounded border border-black/20 px-1 py-1" />
                  </td>
                  <td className="pr-2 pb-1">
                    <input name={`discounted_${i}`} inputMode="decimal" defaultValue={r?.discountedPrice} className="w-20 rounded border border-black/20 px-1 py-1" />
                  </td>
                  <td className="pr-2 pb-1">
                    <input name={`minNights_${i}`} inputMode="numeric" defaultValue={r?.minNights} className="w-16 rounded border border-black/20 px-1 py-1" />
                  </td>
                  <td className="pb-1">
                    <input name={`description_${i}`} maxLength={200} defaultValue={r?.description} className="w-full rounded border border-black/20 px-1 py-1" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="mt-3 rounded bg-black px-4 py-2 text-white">Save prices</button>
        </form>
      </section>
      )}

      {tab === "requests" && (
        <section>
          <h2 className="mb-4 text-xl font-semibold">Booking requests</h2>
      {bookings.length === 0 && <p className="text-sm opacity-70">No requests yet.</p>}
      <ul className="flex flex-col gap-4">
        {bookings.map((b) => (
          <li key={b.id} className="rounded border border-black/15 bg-white p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium">{b.name}</p>
                <p className="text-sm">
                  <a className="underline" href={`mailto:${b.email}`}>
                    {b.email}
                  </a>
                </p>
              </div>
              <span className={`rounded px-2 py-0.5 text-xs ${badge[b.status]}`}>{b.status}</span>
            </div>
            <p className="mt-2 text-sm">
              {formatDateRange(b.checkIn, b.checkOut)} ({b.nights} nights) · {b.guests} guests ·
              €{b.total.toFixed(0)} · {b.lang}
            </p>
            {b.message && <p className="mt-2 whitespace-pre-wrap text-sm opacity-80">{b.message}</p>}
            <p className="mt-2 text-xs opacity-60">
              Received {new Date(b.createdAt).toLocaleString("en-GB", { timeZone: "Europe/Zagreb" })}
            </p>
            {b.status === "pending" && (
              <div className="mt-3 flex gap-2">
                <DecisionButton
                  bookingId={b.id}
                  decision="approved"
                  label="Approve"
                  recipientName={b.name}
                  recipientEmail={b.email}
                  preview={approvalPreview(b)}
                  blockedMessage="Fill in all fields in the Invoice info tab before approving."
                />
                <DecisionButton
                  bookingId={b.id}
                  decision="rejected"
                  label="Reject"
                  recipientName={b.name}
                  recipientEmail={b.email}
                  preview={rejectionPreview(b)}
                />
              </div>
            )}
          </li>
        ))}
      </ul>

        </section>
      )}
    </main>
  );
}
