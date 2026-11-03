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
import { formatPrice, gallery, lowestPrice, siteUrl, villa } from "@/lib/content";
import { hasLocale, locales } from "@/lib/i18n";
import { getAvailability } from "@/lib/istria-lux";
import { getRates } from "@/lib/rates";
import { reviews } from "@/lib/reviews";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, availability, rates] = await Promise.all([
    getDictionary(lang),
    getAvailability(),
    getRates(),
  ]);

  const amenityFeature = [
    "Heated pool",
    "Air conditioning",
    "Free Wi-Fi",
    "Private parking",
    "Barbecue",
    "Fenced garden",
  ].map((name) => ({ "@type": "LocationFeatureSpecification", name, value: true }));

  // Tells Google the site name (shown above the URL in results) and its root URL.
  const webSiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: villa.name,
    alternateName: "Villa Lim Silent Rovinj",
    url: `${siteUrl}/`,
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VacationRental",
    "@id": `${siteUrl}/#villa`,
    identifier: "villa-lim-silent",
    name: villa.name,
    description: dict.meta.description,
    url: `${siteUrl}/${lang}`,
    image: ["/sections/hero.jpg", ...gallery.slice(0, 12)].map((src) => `${siteUrl}${src}`),
    latitude: villa.coordinates.lat,
    longitude: villa.coordinates.lng,
    hasMap: villa.mapsPlace.url,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Matohanci",
      addressRegion: "Istria",
      addressCountry: "HR",
    },
    checkinTime: villa.checkIn,
    checkoutTime: villa.checkOut,
    petsAllowed: villa.pets > 0,
    priceRange: `${formatPrice(lowestPrice(rates), lang)}+`,
    knowsLanguage: [...locales],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: villa.rating,
      ratingCount: villa.reviewCount,
      bestRating: 5,
    },
    additionalType: "Villa",
    review: reviews.slice(0, 10).map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.name },
      datePublished: r.month,
      reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
      reviewBody: r.text,
    })),
    amenityFeature,
    containsPlace: {
      "@type": "Accommodation",
      additionalType: "EntirePlace",
      numberOfBedrooms: villa.bedrooms,
      numberOfBathroomsTotal: villa.bathrooms,
      occupancy: { "@type": "QuantitativeValue", value: villa.guests, maxValue: villa.guests },
      amenityFeature,
      floorSize: { "@type": "QuantitativeValue", value: villa.livingArea, unitCode: "MTK" },
      bed: { "@type": "BedDetails", numberOfBeds: villa.bedrooms, typeOfBed: "King" },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webSiteLd).replace(/</g, "\\u003c"),
        }}
      />
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
        <Enquiry lang={lang} t={dict.enquiry} availability={availability} rates={rates} />
      </main>
      <Footer t={dict.footer} />
    </>
  );
}
