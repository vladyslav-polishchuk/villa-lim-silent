"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";
import { decide } from "./actions";

type Props = {
  bookingId: string;
  decision: "approved" | "rejected";
  label: string;
  recipientName: string;
  recipientEmail: string;
  /** Null when the email cannot be built yet (e.g. approval without invoice settings). */
  preview: { subject: string; html: string } | null;
  blockedMessage?: string;
};

function Confirm({ decision }: { decision: Props["decision"] }) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className={`rounded px-4 py-2 text-sm text-white disabled:opacity-60 ${
        decision === "approved" ? "bg-green-700" : "bg-red-700"
      }`}
    >
      {pending ? "Sending…" : decision === "approved" ? "Confirm and send approval" : "Confirm and send rejection"}
    </button>
  );
}

export function DecisionButton({
  bookingId,
  decision,
  label,
  recipientName,
  recipientEmail,
  preview,
  blockedMessage,
}: Props) {
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className={`rounded px-3 py-1.5 text-sm text-white ${
          decision === "approved" ? "bg-green-700" : "bg-red-700"
        }`}
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
            {decision === "approved" ? "Approve" : "Reject"} request from {recipientName}?
          </h2>
          {preview ? (
            <>
              <p className="text-sm">
                The email below will be sent to <strong>{recipientEmail}</strong>. Please review it
                and confirm. This cannot be undone.
                {decision === "approved" &&
                  " The 24-hour payment deadline starts when you confirm."}
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
          <form action={decide} className="flex justify-end gap-2">
            <input type="hidden" name="id" value={bookingId} />
            <input type="hidden" name="decision" value={decision} />
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              className="rounded border border-black/20 px-4 py-2 text-sm"
            >
              Cancel
            </button>
            {preview && <Confirm decision={decision} />}
          </form>
        </div>
      </dialog>
    </>
  );
}
