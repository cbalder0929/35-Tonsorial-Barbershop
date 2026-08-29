import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { BookingSection } from "@/components/BookingSection";
import { Pricing } from "@/components/Pricing";
import { Faq } from "@/components/Faq";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <BookingSection />
      <Pricing />
      <Faq />
      <Footer />
    </main>
  );
}
