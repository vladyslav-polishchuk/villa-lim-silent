import Link from "next/link";
import { lang } from "next/root-params";
import { getDictionary } from "@/dictionaries";
import { defaultLocale, hasLocale } from "@/lib/i18n";

export default async function NotFound() {
  const requested = await lang();
  const locale = hasLocale(requested) ? requested : defaultLocale;
  const t = (await getDictionary(locale)).notFound;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ink px-5 text-center text-cream">
      <p className="text-xs tracking-[0.28em] text-gold uppercase">404</p>
      <h1 className="mt-3 font-serif text-4xl text-white md:text-5xl">{t.title}</h1>
      <p className="mt-4 max-w-md text-white/70">{t.text}</p>
      <Link
        href={`/${locale}`}
        className="mt-8 rounded-full bg-gold px-5 py-3 text-sm text-ink hover:bg-white"
      >
        {t.back}
      </Link>
    </main>
  );
}
