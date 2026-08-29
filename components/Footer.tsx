import Image from "next/image";
import { config, formatWeeklyHours } from "@/lib/config";

// CUSTOMIZE: links, copyright. Hours are derived from lib/config.ts
// booking.weeklyRules -- change hours there, not here.
export function Footer() {
  const hours = formatWeeklyHours();

  return (
    <footer id="contact" className="border-t border-navy-700/80 bg-navy-950 py-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-5 px-5 text-center sm:px-8">
        <Image
          src="/logo.png"
          alt={`${config.business.name} logo`}
          width={1536}
          height={1024}
          className="w-28 opacity-90 sm:w-32"
        />

        <div>
          <p className="font-display text-xl uppercase tracking-wide text-cream">
            {config.business.name}
          </p>
          <p className="mt-1 text-sm text-cream-dim">
            {config.business.address.line1}, {config.business.address.line2}
          </p>
        </div>

        <div className="flex flex-col gap-1 text-sm text-cream-dim sm:flex-row sm:gap-6">
          <a href={`tel:${config.business.phone}`} className="hover:text-cream">
            {config.business.phoneDisplay}
          </a>
          <a href={`mailto:${config.business.email}`} className="hover:text-cream">
            {config.business.email}
          </a>
        </div>

        <div className="text-xs leading-relaxed text-cream-dim/80">
          {hours.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>

        <a href="#booking" className="btn-primary">
          Book Now
        </a>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs text-cream-dim">
          {config.copy.footer.links.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-cream">
              {link.label}
            </a>
          ))}
          <a
            href={config.business.address.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="hover:text-cream"
          >
            Directions
          </a>
        </div>

        <p className="text-[11px] text-cream-dim/50">
          &copy; {new Date().getFullYear()} {config.copy.footer.copyrightName}. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}
