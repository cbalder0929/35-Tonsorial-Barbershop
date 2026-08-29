import { config } from "@/lib/config";

// Reads from config.pricing -- update prices/services there, not here.
export function Pricing() {
  return (
    <section id="pricing" className="section-pad">
      <span className="rule-facet mb-5" />
      <h2 className="font-display text-3xl uppercase tracking-wide text-cream sm:text-4xl">
        Pricing
      </h2>
      <p className="mt-2 text-sm text-cream-dim">
        Simple, transparent pricing -- no surprises at the chair.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {config.pricing.map((item) => (
          <div key={item.id} className="card-glass flex flex-col gap-3 p-5">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display text-lg uppercase tracking-wide text-cream">
                {item.name}
              </h3>
              {item.premium && (
                <span className="shrink-0 rounded-full border border-gold/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold">
                  Premium
                </span>
              )}
            </div>
            <p className="flex-1 text-sm text-cream-dim">{item.description}</p>
            <div className="flex items-center justify-between pt-1">
              <span className="font-display text-2xl text-crimson-400">${item.price}</span>
              <a href="#booking" className="btn-secondary min-h-[40px] px-4 py-2 text-xs">
                Book Now
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
