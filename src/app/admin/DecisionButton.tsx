"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";
import { decide } from "./actions";

const decisionCopy = {
  approved: {
    label: "Approve",
    title: (name: string) => `Approve request from ${name}?`,
    confirm: "Confirm and send approval",
  },
  rejected: {
    label: "Reject",
    title: (name: string) => `Reject request from ${name}?`,
    confirm: "Confirm and send rejection",
  },
  confirmed: {
    label: "Approve prepayment",
    title: (name: string) => `Confirm prepayment from ${name}?`,
    confirm: "Confirm and send email",
  },
  payment_not_received: {
    label: "Payment not received",
    title: (name: string) => `Release the reservation for ${name}?`,
    confirm: "Release and send email",
  },
};

type Props = {
  bookingId: string;
  decision: keyof typeof decisionCopy;
  recipientName: string;
  recipientEmail: string;
  /** Null when the email cannot be built yet (e.g. approval without invoice settings). */
  preview: { subject: string; html: string } | null;
  blockedMessage?: string;
};

function Confirm({ label, color }: { label: string; color: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className={`rounded px-4 py-2 text-sm text-white disabled:opacity-60 ${color}`}
    >
      {pending ? "Sending…" : label}
    </button>
  );
}

export function DecisionButton({
  bookingId,
  decision,
  recipientName,
  recipientEmail,
  preview,
  blockedMessage,
}: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const { label, title, confirm } = decisionCopy[decision];
  const color =
    decision === "rejected" || decision === "payment_not_received" ? "bg-red-700" : "bg-green-700";

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className={`rounded px-3 py-1.5 text-sm text-white ${color}`}
      >
        {label}
      </button>
      <dialog
        ref={dialog}
        onClick={(e) => {
          // A click on the backdrop targets the dialog element itself.
          if (e.target === dialog.current) dialog.current?.close();
        }}
        className="m-auto w-[min(680px,92vw)] rounded-lg p-0 backdrop:bg-black/50"
      >
        <div className="flex max-h-[90vh] flex-col gap-3 p-5">
          <h2 className="text-lg font-semibold">
            {title(recipientName)}
          </h2>
          {preview ? (
            <>
              <p className="text-sm">
                The email below will be sent to <strong>{recipientEmail}</strong>. Please review it
                and confirm. This cannot be undone.
                {decision === "approved" &&
                  " The 24-hour payment deadline starts when you confirm."}
                {decision === "confirmed" &&
                  " Confirm only once the prepayment has reached your account."}
                {decision === "payment_not_received" &&
                  " Use this after the 24-hour prepayment window has passed."}
              </p>
              <p className="text-sm opacity-70">Subject: {preview.subject}</p>
              {/* Sandboxed (no scripts, no same-origin access): the email is only displayed here. */}
              <iframe
                title="Email preview"
                sandbox=""
                srcDoc={preview.html}
                className="h-[50vh] w-full rounded border border-black/15"
              />
            </>
          ) : (
            <p className="rounded bg-amber-50 p-3 text-sm">{blockedMessage}</p>
          )}
          <form action={decide} className="flex flex-wrap justify-end gap-2">
            <input type="hidden" name="id" value={bookingId} />
            <input type="hidden" name="decision" value={decision} />
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              className="rounded border border-black/20 px-4 py-2 text-sm"
            >
              Cancel
            </button>
            {preview && <Confirm label={confirm} color={color} />}
          </form>
        </div>
      </dialog>
    </>
  );
}
