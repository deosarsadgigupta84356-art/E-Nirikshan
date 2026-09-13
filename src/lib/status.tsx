import {
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  MinusCircle,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import type { EvidenceState, VerificationAction } from "./types";
import { Badge } from "@/components/ui/badge";

export function StateChip({ state }: { state: EvidenceState }) {
  const map = {
    SUPPORTED: { tone: "evidence" as const, icon: CheckCircle2, label: "Supported" },
    CONFLICTING: { tone: "attention" as const, icon: TriangleAlert, label: "Conflicting" },
    UNRESOLVED: { tone: "slate" as const, icon: HelpCircle, label: "Unresolved" },
    OBSCURED: { tone: "slate" as const, icon: HelpCircle, label: "Obscured" },
    POTENTIALLY_ABSENT: { tone: "potential" as const, icon: AlertCircle, label: "Potentially absent" },
    NOT_APPLICABLE: { tone: "outline" as const, icon: MinusCircle, label: "N/A" },
  };
  const m = map[state];
  const Icon = m.icon;
  return (
    <Badge tone={m.tone}>
      <Icon className="size-3" />
      {m.label}
    </Badge>
  );
}

export function VerifyChip({ action }: { action: VerificationAction }) {
  if (action === "UNREVIEWED") return <Badge tone="outline">Unreviewed</Badge>;
  if (action === "ACCEPTED")
    return (
      <Badge tone="verified">
        <ShieldCheck className="size-3" />
        Officer verified
      </Badge>
    );
  if (action === "CORRECTED") return <Badge tone="navy">Corrected</Badge>;
  return <Badge tone="slate">Rejected recommendation</Badge>;
}

export function priorityTone(p: string) {
  if (p === "HIGH") return "potential" as const;
  if (p === "MEDIUM") return "attention" as const;
  return "slate" as const;
}
