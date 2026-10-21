import Image from "next/image";
import { config } from "@/lib/config";

// Mobile: the logo is the centerpiece of the Hero -- do not redraw, distort,
// or swap it. 
// Laptop/desktop (md and up): no hero section; the footer logo is pinned to
// the top-left corner instead.
export function Hero() {
  return (
    <>
      <Image
        src="/HeroLogo35.png"
        alt={`${config.business.name} logo`}
        width={2172}
        height={724}
        className="fixed left-4 top-3 z-40 hidden w-[264px] md:block"
      />
      <section id="hero" className="relative overflow-hidden px-5 pb-6 pt-6 sm:px-8 sm:pb-10 sm:pt-8 md:hidden">
        <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
          <div className="relative flex w-full justify-center">
            <Image
              src="/HeroLogo35.png"
              alt={`${config.business.name} logo`}
              width={2172}
              height={724}
              priority
              className="w-full max-w-[340px] sm:max-w-[520px]"
            />
          </div>
        </div>
      </section>
    </>
  );
}
