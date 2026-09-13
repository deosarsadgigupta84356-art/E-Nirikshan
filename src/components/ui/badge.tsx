import { cn } from "@/lib/utils";

const tones: Record<string, string> = {
  navy: "bg-navy/8 text-navy",
  evidence: "bg-pale-teal text-evidence",
  verified: "bg-pale-green text-verified",
  attention: "bg-pale-amber text-attention",
  potential: "bg-pale-orange text-accent",
  slate: "bg-pale-slate text-muted",
  failure: "bg-pale-red text-failure",
  outline: "border border-line text-muted bg-surface",
};

export function Badge({
  tone = "navy",
  className,
  children,
}: {
  tone?: keyof typeof tones;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
