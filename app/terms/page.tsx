import { config } from "@/lib/config";
import { Footer } from "@/components/Footer";

export const metadata = { title: `Terms of Service | ${config.business.name}` };

export default function TermsPage() {
  return (
    <main>
      <article className="section-pad max-w-3xl">
        <span className="rule-facet mb-5" />
        <h1 className="font-display text-4xl text-cream">Terms of Service</h1>
        <p className="text-sm text-cream-dim/70">Last updated: 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-cream-dim">
          <p>
            By booking an appointment with {config.business.name}, you agree to the following
            terms.
          </p>
          <h2 className="text-lg font-semibold text-cream">Appointments &amp; Payment</h2>
          <p>
            Prices are listed on our pricing page. When online payment is enabled, a 50% deposit
            is collected through Stripe Checkout when you book, and the remaining balance is due
            at the chair by card or cash. When online payment is not enabled, the full price is
            due at the chair. Please arrive on time -- arrivals more than 10 minutes late may
            need to be rescheduled to protect the next client&rsquo;s time.
          </p>
          <h2 className="text-lg font-semibold text-cream">Cancellations &amp; Deposits</h2>
          <p>
            Cancel or reschedule any time before your appointment using the link in your
            confirmation email. Rescheduling keeps your deposit applied to the new time at no
            extra charge. Deposits are non-refundable if you cancel outright or don&rsquo;t show
            up -- this is what lets us hold that time for you instead of offering it to someone
            else. If we need to cancel or cannot honor your appointment, your deposit is
            refunded in full.
          </p>
          <h2 className="text-lg font-semibold text-cream">Communications</h2>
          <p>
            We&rsquo;ll email you a confirmation and reminders about your appointment. If you
            opt in to SMS, standard message and data rates may apply.
          </p>
          <h2 className="text-lg font-semibold text-cream">Contact</h2>
          <p>
            Questions? Reach us at {config.business.email} or {config.business.phoneDisplay}.
          </p>
        </div>
      </article>
      <Footer />
    </main>
  );
}
