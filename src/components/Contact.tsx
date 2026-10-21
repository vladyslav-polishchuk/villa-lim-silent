import type { Dictionary } from "@/dictionaries/en";
import { villa } from "@/lib/content";

const { contact } = villa;

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="M5 8l7 5 7-5" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 4H5.5A1.5 1.5 0 0 0 4 5.5 14.5 14.5 0 0 0 18.5 20a1.5 1.5 0 0 0 1.5-1.5V16l-4.5-2-1.8 2a10 10 0 0 1-5.7-5.7l2-1.8L8 4Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <circle cx="12" cy="12" r="3.5" />
      <circle cx="16.5" cy="7.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

export function Contact({ t }: { t: Dictionary["contact"] }) {
  const methods = [
    { label: t.email, value: contact.email, href: `mailto:${contact.email}`, Icon: MailIcon },
    { label: t.phone, value: contact.phoneDisplay, href: `tel:${contact.phone}`, Icon: PhoneIcon, whatsapp: true },
    { label: t.instagram, value: `@${contact.instagram}`, href: contact.instagramUrl, Icon: InstagramIcon, external: true },
  ];

  return (
    <section id="contact" aria-labelledby="contact-title" className="bg-cream">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 md:grid-cols-[minmax(0,4fr)_minmax(0,6fr)] md:items-center md:gap-12 md:px-8 md:py-24 lg:gap-20">
        <div>
          <p className="text-xs tracking-[0.28em] text-gold-deep uppercase">
            {t.eyebrow}
          </p>
          <h2 id="contact-title" className="mt-3 font-serif text-4xl md:text-5xl">
            {t.title}
          </h2>
          <p className="mt-4 max-w-sm text-base leading-7 text-ink-soft md:mt-5 md:text-lg md:leading-8">
            {t.intro}
          </p>
        </div>

        <ul className="divide-y divide-line rounded-2xl border border-line bg-paper shadow-[0_18px_48px_-34px_rgba(27,34,40,0.35)] md:rounded-3xl">
          {methods.map(({ label, value, href, Icon, external, whatsapp }) => (
            <li key={href} className="first:rounded-t-[inherit] last:rounded-b-[inherit]">
              <a
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noreferrer" : undefined}
                className="group relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 rounded-[inherit] px-3.5 py-4 transition-colors hover:bg-cream/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink max-[370px]:grid-cols-[auto_minmax(0,1fr)] sm:gap-x-4 sm:px-6 sm:py-5"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-full border border-gold/45 bg-cream text-ink sm:size-11">
                  <Icon />
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.6875rem] font-medium tracking-[0.17em] text-ink-soft uppercase">
                    {label}
                  </span>
                  <span className="mt-0.5 block font-serif text-[1.375rem] leading-tight wrap-anywhere group-hover:underline group-hover:decoration-gold group-hover:underline-offset-4 max-[370px]:text-xl sm:text-[1.75rem]">
                    {value}
                  </span>
                </span>
                <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 text-ink-soft max-[370px]:absolute max-[370px]:top-4 max-[370px]:right-3.5 sm:size-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={external ? "M6 18 18 6M8 6h10v10" : "M4 12h15m-6-6 6 6-6 6"} />
                </svg>
              </a>
              {whatsapp && (
                <div className="-mt-2 pb-4 pl-[3.875rem] sm:pb-5 sm:pl-[5.25rem]">
                  <a
                    href={contact.whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center rounded-full border border-gold/60 px-4 text-sm font-medium text-ink transition-colors hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                  >
                    {t.whatsapp}
                    <span aria-hidden="true" className="ml-2">↗</span>
                  </a>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
