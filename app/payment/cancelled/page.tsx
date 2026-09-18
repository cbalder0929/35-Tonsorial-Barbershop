import Link from "next/link";
import { Footer } from "@/components/Footer";
import { StatusCard } from "@/components/StatusCard";
import { config } from "@/lib/config";

export const metadata = { title: `Payment Cancelled | ${config.business.name}` };

export default function PaymentCancelledPage() {
  return (
    <main>
      <StatusCard tone="info" title="Payment cancelled">
        <p>
          Your appointment request was created, but payment was not completed. Use your
          confirmation email to manage the booking, or contact {config.business.phoneDisplay}.
        </p>
        <Link href="/#booking" className="btn-primary mt-6">
          Book Another Time
        </Link>
      </StatusCard>
      <Footer />
    </main>
  );
}
