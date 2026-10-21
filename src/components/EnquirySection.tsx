import { Enquiry } from "@/components/Enquiry";
import { EnquiryStatus } from "@/components/EnquiryStatus";
import type { Dictionary } from "@/dictionaries/en";
import type { Availability } from "@/lib/availability";
import type { Locale } from "@/lib/i18n";
import { getRates } from "@/lib/rates";

// Waits for the prices from the Google Sheet (render it inside <Suspense> with the "loading"
// state as fallback). Without prices there is nothing to quote, so show the "failed" state.
export async function EnquirySection({
  lang,
  t,
  availability,
}: {
  lang: Locale;
  t: Dictionary["enquiry"];
  availability: Availability | null;
}) {
  const rates = await getRates();
  if (!rates) return <EnquiryStatus status="failed" t={t} />;
  return <Enquiry lang={lang} t={t} availability={availability} rates={rates} />;
}
