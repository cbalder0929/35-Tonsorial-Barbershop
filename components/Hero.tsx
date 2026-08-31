import Image from "next/image";
import { config } from "@/lib/config";

// The logo is the centerpiece of the Hero -- do not redraw, distort, or
// swap it. It floats with a soft crimson glow and drop shadow for depth.
export function Hero() {
  return (
    <section id="hero" className="relative overflow-hidden px-5 pb-12 pt-8 sm:px-8 sm:pb-20 sm:pt-14">
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

        <h1 className="mt-1 font-display text-2xl uppercase tracking-wide text-cream sm:text-4xl lg:text-5xl">
          {config.business.name}
        </h1>

        <div className="mt-7 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <a href="#booking" className="btn-primary w-full sm:w-auto">
            {config.copy.hero.ctaLabel}
          </a>
          <a href="#pricing" className="btn-secondary w-full sm:w-auto">
            {config.copy.hero.secondaryCtaLabel}
          </a>
        </div>

        <p className="mt-5 text-xs text-cream-dim/70">
          <span aria-hidden className="text-gold">
            {"★★★★★"}
          </span>{" "}
          {config.business.googleRating.toFixed(1)} on Google &middot; {config.business.googleReviewCount}{" "}
          reviews
        </p>
      </div>
    </section>
  );
}
