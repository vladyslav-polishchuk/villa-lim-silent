import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { notFound } from "next/navigation";
import { getDictionary } from "@/dictionaries";
import { siteUrl, villa } from "@/lib/content";
import { defaultLocale, hasLocale, intlLocales, locales } from "@/lib/i18n";
import "../globals.css";

const sans = Outfit({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
});

const serif = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return {
    metadataBase: new URL(siteUrl),
    title: dict.meta.title,
    description: dict.meta.description,
    applicationName: villa.name,
    alternates: {
      canonical: `/${lang}`,
      languages: {
        ...Object.fromEntries(locales.map((l) => [l, `/${l}`])),
        "x-default": `/${defaultLocale}`,
      },
    },
    openGraph: {
      type: "website",
      siteName: villa.name,
      title: dict.meta.title,
      description: dict.meta.description,
      url: `/${lang}`,
      locale: intlLocales[lang].replace("-", "_"),
      alternateLocale: locales
        .filter((l) => l !== lang)
        .map((l) => intlLocales[l].replace("-", "_")),
      images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: dict.hero.imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.title,
      description: dict.meta.description,
      images: ["/og-image.jpg"],
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  return (
    <html
      lang={lang}
      className={`${sans.variable} ${serif.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-paper font-sans text-ink">{children}</body>
    </html>
  );
}
