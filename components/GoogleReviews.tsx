import { config } from "@/lib/config";

export function GoogleReviews() {
  return (
    <p className="mx-auto text-center text-xs text-cream-dim/70">
      <span aria-hidden className="text-gold">
        {"★★★★★"}
      </span>{" "}
      {config.business.googleRating.toFixed(1)} on Google &middot; {config.business.googleReviewCount}{" "}
      reviews
    </p>
  );
}
