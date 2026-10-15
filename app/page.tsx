import { Hero } from "@/components/Hero";
import { BookingSection } from "@/components/BookingSection";
import { GoogleReviews } from "@/components/GoogleReviews";
import { Pricing } from "@/components/Pricing";
import { Faq } from "@/components/Faq";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <BookingSection />
      <GoogleReviews />
      <Pricing />
      <Faq />
      <Footer />
    </main>
  );
}
