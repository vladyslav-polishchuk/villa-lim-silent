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

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Highlights />
        <About />
        <Rooms />
        <Amenities />
        <Gallery />
        <Reviews />
        <Location />
        <Enquiry />
      </main>
      <Footer />
    </>
  );
}
