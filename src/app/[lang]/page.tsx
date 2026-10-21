import { notFound } from "next/navigation";
import { About } from "@/components/About";
import { Amenities } from "@/components/Amenities";
import { Enquiry } from "@/components/Enquiry";
import { Footer } from "@/components/Footer";
import { Gallery } from "@/components/Gallery";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Highlights } from "@/components/Highlights";
import { Location } from "@/components/Location";
import { Reviews } from "@/components/Reviews";
import { Rooms } from "@/components/Rooms";
import { getDictionary } from "@/dictionaries";
import { hasLocale } from "@/lib/i18n";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <Header lang={lang} t={dict.header} />
      <main>
        <Hero lang={lang} t={dict.hero} />
        <Highlights items={dict.highlights} />
        <About t={dict.about} />
        <Rooms t={dict.rooms} />
        <Amenities t={dict.amenities} />
        <Gallery t={dict.gallery} />
        <Reviews lang={lang} t={dict.reviews} />
        <Location lang={lang} t={dict.location} />
        <Enquiry lang={lang} t={dict.enquiry} />
      </main>
      <Footer t={dict.footer} />
    </>
  );
}
