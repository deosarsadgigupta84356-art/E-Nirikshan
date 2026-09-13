import { create } from "zustand";
import type {
  CaseRecord,
  Complaint,
  CopilotAnswer,
  DeclarationGroup,
  DeclarationResult,
  EvidenceItem,
  Finding,
  Lang,
  PackageFamily,
  PatternCandidate,
  PublicStatus,
  VerificationAction,
} from "./types";
import { CASES, COMPLAINTS, INSPECTOR, PATTERNS, emptyMap, seededMap } from "./seed";
import { uid } from "./utils";

interface AppState {
  language: Lang;
  offline: boolean;
  cases: CaseRecord[];
  complaints: Complaint[];
  patterns: PatternCandidate[];
  evidence: EvidenceItem[];
  maps: Record<string, DeclarationResult[]>;
  findings: Finding[];
  followups: { id: string; parentId: string; text: string; status: string }[];
  selectedInspectorCase: string | null;
  selectedOfficerCase: string | null;
  setLanguage: (l: Lang) => void;
  toggleOffline: () => void;
  setPackageFamily: (caseId: string, family: PackageFamily) => void;
  confirmCoverage: (caseId: string) => void;
  addEvidence: (item: EvidenceItem) => void;
  markSync: (id: string, status: EvidenceItem["syncStatus"], syncedAt?: string) => void;
  runAnalysis: (caseId: string) => void;
  verify: (
    caseId: string,
    group: DeclarationGroup,
    action: VerificationAction,
    reason: string,
    corrected?: string,
  ) => void;
  completeReport: (caseId: string) => void;
  overridePriority: (caseId: string, band: CaseRecord["priority"], reason: string) => void;
  decidePattern: (id: string, status: PatternCandidate["status"]) => string | null;
  assignFollowup: (parentId: string, inspector: string) => void;
  submitComplaint: (c: Omit<Complaint, "id" | "trackingToken" | "createdAt" | "status">) => Complaint;
  updateComplaintStatus: (id: string, status: PublicStatus) => void;
  resetDemo: () => void;
}

function initialMaps(): Record<string, DeclarationResult[]> {
  const maps: Record<string, DeclarationResult[]> = {};
  for (const c of CASES) maps[c.id] = seededMap(c.id);
  return maps;
}

export const useApp = create<AppState>()((set, get) => ({
      language: "en",
      offline: false,
      cases: CASES,
      complaints: COMPLAINTS,
      patterns: PATTERNS,
      evidence: [],
      maps: initialMaps(),
      findings: [],
      followups: [],
      selectedInspectorCase: "LM-0264",
      selectedOfficerCase: "LM-0264",
      setLanguage: (language) => set({ language }),
      toggleOffline: () => set({ offline: !get().offline }),
      setPackageFamily: (caseId, family) =>
        set({
          cases: get().cases.map((c) =>
            c.id === caseId
              ? { ...c, product: { ...c.product, packageFamily: family }, status: "CAPTURE_IN_PROGRESS" }
              : c,
          ),
        }),
      confirmCoverage: (caseId) =>
        set({
          cases: get().cases.map((c) => (c.id === caseId ? { ...c, coverageConfirmed: true } : c)),
        }),
      addEvidence: (item) =>
        set({
          evidence: [...get().evidence.filter((e) => e.id !== item.id), item],
          cases: get().cases.map((c) =>
            c.id === item.caseId && c.status === "ASSIGNED"
              ? { ...c, status: "CAPTURE_IN_PROGRESS" }
              : c,
          ),
        }),
      markSync: (id, status, syncedAt) =>
        set({
          evidence: get().evidence.map((e) =>
            e.id === id ? { ...e, syncStatus: status, syncedAt: syncedAt ?? e.syncedAt } : e,
          ),
        }),
      runAnalysis: (caseId) => {
        const rec = get().cases.find((c) => c.id === caseId);
        const items = get().evidence.filter((e) => e.caseId === caseId && e.syncStatus === "SYNCHRONISED");
        const family = rec?.product.packageFamily ?? "FLEXIBLE";
        const overviewOk = items.filter((e) => e.quality === "GOOD").length >= 2;
        const closeups = items.filter((e) => e.viewId === "v4" || e.viewId === "v5" || e.viewId === "v6" || e.viewId === "v7");
        const product = rec?.product;
        const next: DeclarationResult[] = emptyMap().map((row): DeclarationResult => {
          const covered = overviewOk || rec?.coverageConfirmed;
          if (row.group === "D01_IDENTITY") {
            return {
              ...row,
              fusedValue: product?.name,
              state: covered ? "SUPPORTED" : "UNRESOLVED",
              sourceCount: items.length ? 1 : 0,
              absenceEligible: Boolean(covered && family !== "OTHER"),
            };
          }
          if (row.group === "D02_MANUFACTURER") {
            return {
              ...row,
              fusedValue: product?.manufacturer,
              state: closeups.length || covered ? "SUPPORTED" : "UNRESOLVED",
              sourceCount: 1,
              absenceEligible: Boolean(covered && family !== "OTHER"),
            };
          }
          if (row.group === "D03_NET_QTY") {
            const conflict = caseId === "LM-0264" && items.length >= 2;
            return {
              ...row,
              fusedValue: conflict ? `${product?.netQuantity}  /  45 g` : product?.netQuantity,
              state: conflict ? "CONFLICTING" : covered ? "SUPPORTED" : "UNRESOLVED",
              sourceCount: conflict ? 2 : 1,
              absenceEligible: Boolean(covered && family !== "OTHER"),
            };
          }
          if (row.group === "D04_MRP") {
            return {
              ...row,
              fusedValue: product?.mrp,
              state: covered ? "SUPPORTED" : "UNRESOLVED",
              sourceCount: 1,
              absenceEligible: Boolean(covered && family !== "OTHER"),
            };
          }
          if (row.group === "D05_DATE") {
            return {
              ...row,
              fusedValue: covered ? "08/2026" : undefined,
              state: covered ? "SUPPORTED" : "UNRESOLVED",
              sourceCount: covered ? 1 : 0,
              absenceEligible: Boolean(covered && family !== "OTHER"),
            };
          }
          // D06 consumer care — demo: potentially absent only if coverage is adequate
          if (family === "OTHER" && !rec?.coverageConfirmed) {
            return { ...row, state: "UNRESOLVED" as const, absenceEligible: false, sourceCount: 0 };
          }
          if (covered) {
            return {
              ...row,
              fusedValue: undefined,
              state: "POTENTIALLY_ABSENT",
              sourceCount: 0,
              absenceEligible: true,
            };
          }
          return { ...row, state: "UNRESOLVED" as const, absenceEligible: false };
        });
        set({
          maps: { ...get().maps, [caseId]: next },
          cases: get().cases.map((c) =>
            c.id === caseId ? { ...c, status: "AWAITING_VERIFICATION" } : c,
          ),
        });
      },
      verify: (caseId, group, action, reason, corrected) => {
        const maps = { ...get().maps };
        const list = (maps[caseId] ?? emptyMap()).map((d) =>
          d.group === group
            ? {
                ...d,
                verification: action,
                verificationReason: reason,
                verifiedAt: new Date().toISOString(),
                verifiedBy: INSPECTOR.id,
                fusedValue: action === "CORRECTED" && corrected ? corrected : d.fusedValue,
              }
            : d,
        );
        maps[caseId] = list;
        const finding: Finding = {
          id: uid("fnd"),
          caseId,
          group,
          action,
          value: corrected,
          reason,
          officerId: INSPECTOR.id,
          at: new Date().toISOString(),
        };
        let patterns = get().patterns;
        if (action === "ACCEPTED" || action === "CORRECTED") {
          patterns = patterns.map((p) => {
            if (!p.linkedCaseIds.includes(caseId)) return p;
            if (p.status !== "CANDIDATE") return p;
            return { ...p, verifiedCount: p.verifiedCount + (group === "D04_MRP" || group === "D06_CARE" ? 1 : 0) };
          });
        }
        set({
          maps,
          findings: [...get().findings, finding],
          patterns,
        });
      },
      completeReport: (caseId) => {
        const map = get().maps[caseId] ?? [];
        const pending = map.filter((d) => d.verification === "UNREVIEWED" && d.state !== "NOT_APPLICABLE");
        if (pending.length) return;
        set({
          cases: get().cases.map((c) => (c.id === caseId ? { ...c, status: "REPORT_READY" } : c)),
          complaints: get().complaints.map((c) =>
            c.caseId === caseId ? { ...c, status: "INSPECTION_COMPLETED" } : c,
          ),
        });
      },
      overridePriority: (caseId, band, reason) =>
        set({
          cases: get().cases.map((c) =>
            c.id === caseId
              ? { ...c, priority: band, priorityReasons: [reason, ...c.priorityReasons] }
              : c,
          ),
        }),
      decidePattern: (id, status) => {
        const p = get().patterns.find((x) => x.id === id);
        if (!p) return null;
        if (status === "APPROVED") {
          const parentId = `SYS-${id.slice(-2)}`;
          const parent: CaseRecord = {
            id: parentId,
            kind: "SYSTEMIC",
            status: "ASSIGNED",
            product: {
              name: p.productName,
              brand: p.productName,
              manufacturer: "Deccan Foods Pvt Ltd",
              variant: "Batch " + (p.batch ?? ""),
              netQuantity: "50 g",
              mrp: "₹20.00",
              batch: p.batch ?? "",
              packageFamily: "FLEXIBLE",
              image: "/media/mirchi-crunch.jpg",
            },
            retailer: "Coordinated · multiple retailers",
            location: p.locations.join(", "),
            district: "Multi-district",
            trigger: "Officer-approved systemic investigation",
            priority: "HIGH",
            priorityReasons: ["Approved pattern " + p.id, p.suspected],
            createdAt: new Date().toISOString(),
            parentId: undefined,
          };
          set({
            patterns: get().patterns.map((x) => (x.id === id ? { ...x, status } : x)),
            cases: [...get().cases, parent],
          });
          return parentId;
        }
        set({ patterns: get().patterns.map((x) => (x.id === id ? { ...x, status } : x)) });
        return null;
      },
      assignFollowup: (parentId, inspector) =>
        set({
          followups: [
            ...get().followups,
            {
              id: uid("fup"),
              parentId,
              text: `Assigned to ${inspector}`,
              status: "ASSIGNED",
            },
          ],
        }),
      submitComplaint: (input) => {
        const complaint: Complaint = {
          ...input,
          id: uid("CIT").slice(0, 10).toUpperCase(),
          trackingToken: "EN-" + Math.random().toString(36).slice(2, 6).toUpperCase(),
          createdAt: new Date().toISOString(),
          status: "SUBMITTED",
        };
        const lead: CaseRecord = {
          id: uid("LM").slice(0, 9).toUpperCase(),
          kind: "COMPLAINT",
          status: "INTAKE",
          product: {
            name: input.productName,
            brand: input.productName,
            manufacturer: "Unknown · citizen lead",
            variant: "",
            netQuantity: "",
            mrp: "",
            batch: "",
            packageFamily: "FLEXIBLE",
            image: input.image ?? "/media/label-closeup.jpg",
          },
          retailer: input.shop,
          location: input.location,
          district: input.location,
          trigger: "Citizen structured lead",
          priority: "MEDIUM",
          priorityReasons: ["Citizen-reported lead · not a verified finding"],
          createdAt: complaint.createdAt,
        };
        complaint.caseId = lead.id;
        set({
          complaints: [complaint, ...get().complaints],
          cases: [lead, ...get().cases],
          maps: { ...get().maps, [lead.id]: emptyMap() },
        });
        return complaint;
      },
      updateComplaintStatus: (id, status) =>
        set({
          complaints: get().complaints.map((c) => (c.id === id ? { ...c, status } : c)),
        }),
      resetDemo: () =>
        set({
          cases: CASES,
          complaints: COMPLAINTS,
          patterns: PATTERNS,
          evidence: [],
          maps: initialMaps(),
          findings: [],
          followups: [],
          selectedInspectorCase: "LM-0264",
          selectedOfficerCase: "LM-0264",
          offline: false,
        }),
}));

export function copilotFor(
  chip: string,
  caseId: string | null,
  patternId: string | null,
): CopilotAnswer {
  const s = useApp.getState();
  const rec = s.cases.find((c) => c.id === caseId);
  const map = caseId ? s.maps[caseId] : undefined;
  const pattern = s.patterns.find((p) => p.id === patternId) ?? s.patterns[0];

  if (chip === "summarise") {
    if (!rec) {
      return {
        title: "No case selected",
        body: "Open a case from the queue. The copilot only answers from the selected record.",
        bullets: [],
        sources: [],
        gap: "No case context.",
      };
    }
    const verified = map?.filter((d) => d.verification !== "UNREVIEWED") ?? [];
    const open = map?.filter((d) => d.verification === "UNREVIEWED") ?? [];
    return {
      title: `Case ${rec.id}`,
      body: `${rec.product.name} at ${rec.retailer}. Trigger: ${rec.trigger}. Citizen and AI observations stay labelled as leads until an officer verifies them.`,
      bullets: [
        `Status: ${rec.status.replaceAll("_", " ")}`,
        `Verified declarations: ${verified.length}`,
        `Still unreviewed: ${open.length}`,
        `Priority: ${rec.priority} — ${rec.priorityReasons[0]}`,
      ],
      sources: [
        { type: "case", id: rec.id, title: rec.product.name, label: rec.status },
        { type: "rule", id: "LMPC-R07", title: "Rule 6(1) declarations", label: "versioned" },
      ],
    };
  }

  if (chip === "priority") {
    if (!rec) {
      return { title: "Select a case", body: "Priority is explained from the case record.", bullets: [], sources: [] };
    }
    return {
      title: `Why ${rec.id} is ${rec.priority}`,
      body: "Priority is explainable and non-statutory. An officer may override it with a reason.",
      bullets: rec.priorityReasons,
      sources: [{ type: "case", id: rec.id, title: "Priority factors", label: rec.priority }],
    };
  }

  if (chip === "related") {
    const related = s.cases.filter(
      (c) => rec && c.id !== rec.id && (c.product.batch === rec.product.batch || c.product.brand === rec.product.brand),
    );
    return {
      title: "Related records",
      body: "Matching uses confirmed case snapshots — product, batch, manufacturer, location — not a product master.",
      bullets: related.map(
        (c) => `${c.id} · ${c.retailer} · ${c.status.replaceAll("_", " ")} · ${c.product.batch || "no batch"}`,
      ),
      sources: related.slice(0, 4).map((c) => ({
        type: "case",
        id: c.id,
        title: c.product.name,
        label: c.status === "VERIFIED" || c.status === "REPORT_READY" ? "verified" : "lead / unverified",
      })),
    };
  }

  if (chip === "gaps") {
    const gaps = (map ?? []).filter((d) => d.state === "UNRESOLVED" || d.state === "OBSCURED" || d.state === "CONFLICTING" || d.state === "POTENTIALLY_ABSENT");
    return {
      title: "What must be physically verified",
      body: "Insufficient coverage is an evidence gap, not a violation. Listing images never establish absence from an unseen side.",
      bullets: gaps.map((d) => `${d.label}: ${d.state.replaceAll("_", " ").toLowerCase()}`),
      sources: [{ type: "map", id: rec?.id ?? "—", title: "Compliance map", label: "evidence" }],
      gap: gaps.length ? undefined : "No open evidence gaps on the current map.",
      draftAction: "Inspect remaining declaration faces on the physical package and recapture close-ups.",
    };
  }

  if (chip === "brief") {
    return {
      title: "Draft inspection brief",
      body: "Editable draft only. Copilot cannot assign an inspector or create a systemic case.",
      bullets: [
        `Product: ${rec?.product.name ?? "—"}`,
        `Suspected issue: ${rec?.trigger ?? pattern.title}`,
        `Rule: ${pattern.rule}`,
        `Evidence needs: overlapping package views + MRP / net qty / care close-ups`,
        `Locations: ${rec?.location ?? pattern.locations.join(", ")}`,
      ],
      sources: [
        { type: "case", id: rec?.id ?? pattern.id, title: "Grounded context", label: "draft" },
        { type: "rule", id: pattern.rule, title: pattern.rule, label: "versioned" },
      ],
      draftAction: "Prepare field capture for the next assigned inspector after officer approval.",
    };
  }

  if (chip === "pattern") {
    return {
      title: pattern.title,
      body: `Suspected level: ${pattern.suspected}. Only officer-verified findings increase the verified count. Citizen leads and AI observations remain visible but separate.`,
      bullets: [
        `Verified: ${pattern.verifiedCount}`,
        `Awaiting verification: ${pattern.awaitingCount}`,
        `Citizen leads: ${pattern.citizenCount}`,
        `Match factors: ${pattern.matchingFactors.join(" · ")}`,
      ],
      sources: pattern.linkedCaseIds.map((id) => {
        const c = s.cases.find((x) => x.id === id);
        const verified = c?.status === "VERIFIED" || c?.status === "REPORT_READY";
        return {
          type: "case",
          id,
          title: c?.retailer ?? id,
          label: verified ? "officer-verified" : c?.kind === "COMPLAINT" ? "citizen lead" : "awaiting verification",
        };
      }),
    };
  }

  return {
    title: "Evidence gap",
    body: "The copilot only answers from the selected case, versioned rules, uploaded images and verified patterns. It will not invent a legal conclusion.",
    bullets: [],
    sources: [],
    gap: "Ask from a case or pattern, or upload a listing image for visible-only review.",
  };
}
