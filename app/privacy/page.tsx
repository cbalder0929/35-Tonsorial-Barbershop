import { config } from "@/lib/config";
import { Footer } from "@/components/Footer";

export const metadata = { title: `Privacy Policy | ${config.business.name}` };

export default function PrivacyPage() {
  return (
    <main>
      <article className="section-pad max-w-3xl">
        <span className="rule-facet mb-5" />
        <h1 className="font-display text-4xl text-cream">Privacy Policy</h1>
        <p className="text-sm text-cream-dim/70">Last updated: 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-cream-dim">
          <p>
            {config.business.name} (&ldquo;we,&rdquo; &ldquo;us&rdquo;) collects the information
            you submit through our booking form -- name, email, phone number, and any notes you
            provide -- solely to schedule and manage your appointment.
          </p>
          <h2 className="text-lg font-semibold text-cream">Information we collect</h2>
          <p>
            Name, email address, phone number, appointment preferences, and the IP address and
            timestamp associated with your consent, recorded when you submit a booking.
          </p>
          <h2 className="text-lg font-semibold text-cream">How we use it</h2>
          <p>
            To confirm and manage your appointment, send reminders, and, if you opt in, send SMS
            appointment reminders. Payment details are handled by Stripe when online payment is
            enabled; we do not store full card numbers. We do not sell your information.
          </p>
          <h2 className="text-lg font-semibold text-cream">SMS communications</h2>
          <p>
            If you opt in to text reminders, message and data rates may apply. Reply STOP at any
            time to opt out, or HELP for help.
          </p>
          <h2 className="text-lg font-semibold text-cream">Contact</h2>
          <p>
            Questions about this policy? Reach us at {config.business.email} or{" "}
            {config.business.phoneDisplay}.
          </p>
        </div>
      </article>
      <Footer />
    </main>
  );
}
