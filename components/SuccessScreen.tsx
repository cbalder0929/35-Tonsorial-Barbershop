import { config } from "@/lib/config";

type SuccessScreenProps = {
  dateLabel: string;
  timeLabel: string;
  email: string;
};

export function SuccessScreen({ dateLabel, timeLabel, email }: SuccessScreenProps) {
  return (
    <div className="card-glass mx-auto max-w-md px-8 py-10 text-center">
      <span className="rule-facet mx-auto mb-5" />
      <h3 className="font-display text-3xl text-cream">You&rsquo;re on the books</h3>
      <p className="mt-3 text-cream-dim">
        <strong className="text-cream">{dateLabel}</strong> at{" "}
        <strong className="text-cream">{timeLabel}</strong>
      </p>
      <p className="mt-4 text-sm text-cream-dim/80">
        A confirmation with directions and a calendar invite is headed to {email}.
      </p>
      <p className="mt-6 text-xs text-cream-dim/70">
        {config.business.address.line1}, {config.business.address.line2}
      </p>
    </div>
  );
}
