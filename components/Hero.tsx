import Image from "next/image";
import { config } from "@/lib/config";

// The logo is the centerpiece of the Hero -- do not redraw, distort, or
// swap it. It floats with a soft crimson glow and drop shadow for depth.
export function Hero() {
  return (
    <section id="hero" className="relative overflow-hidden px-5 pb-6 pt-6 sm:px-8 sm:pb-10 sm:pt-8">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-crimson-600/25 blur-[90px] sm:top-6 sm:h-[26rem] sm:w-[26rem]"
      />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
        <div className="relative -mb-2">
          <Image
            src="/logo.png"
            alt={`${config.business.name} logo`}
            width={1536}
            height={1024}
            priority
            className="w-[240px] -rotate-2 drop-shadow-[0_18px_40px_rgba(0,0,0,0.6)] sm:w-[340px] lg:w-[420px]"
          />
        </div>

      </div>
    </section>
  );
}
