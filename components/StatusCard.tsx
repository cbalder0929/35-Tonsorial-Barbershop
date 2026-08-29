import type { ReactNode } from "react";

type StatusCardProps = {
  tone: "success" | "error" | "info";
  title: string;
  children?: ReactNode;
};

const TONE_STYLES: Record<StatusCardProps["tone"], string> = {
  success: "border-royal-400/40",
  error: "border-crimson-500/50",
  info: "border-gold/40",
};

export function StatusCard({ tone, title, children }: StatusCardProps) {
  return (
    <div className={`card-glass mx-auto max-w-md px-8 py-10 text-center ${TONE_STYLES[tone]}`}>
      <span className="rule-facet mx-auto mb-5" />
      <h1 className="font-display text-3xl text-cream">{title}</h1>
      {children && <div className="mt-4 text-sm text-cream-dim">{children}</div>}
    </div>
  );
}
