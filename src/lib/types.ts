export type Lang = "en" | "hi" | "kn" | "ta" | "te";

export type PackageFamily = "RIGID_CUBOID" | "CURVED_RIGID" | "FLEXIBLE" | "OTHER";

export type EvidenceState =
  | "SUPPORTED"
  | "CONFLICTING"
  | "UNRESOLVED"
  | "OBSCURED"
  | "POTENTIALLY_ABSENT"
  | "NOT_APPLICABLE";

export type VerificationAction = "UNREVIEWED" | "ACCEPTED" | "CORRECTED" | "REJECTED";

export type SyncStatus = "LOCAL_ONLY" | "UPLOADING" | "SYNCHRONISED" | "FAILED";

export type PublicStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "INSPECTION_ASSIGNED"
  | "INSPECTION_COMPLETED"
  | "CLOSED";

export type CaseKind = "COMPLAINT" | "INSPECTION" | "SYSTEMIC";

export type CaseStatus =
  | "ASSIGNED"
  | "CAPTURE_IN_PROGRESS"
  | "READY_TO_SYNC"
  | "ANALYSING"
  | "AWAITING_VERIFICATION"
  | "VERIFIED"
  | "REPORT_READY"
  | "CLOSED"
  | "INTAKE";

export type PriorityBand = "HIGH" | "MEDIUM" | "LOW";

export type PatternStatus = "CANDIDATE" | "APPROVED" | "REJECTED";

export type DeclarationGroup =
  | "D01_IDENTITY"
  | "D02_MANUFACTURER"
  | "D03_NET_QTY"
  | "D04_MRP"
  | "D05_DATE"
  | "D06_CARE";

export interface BBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ProductSnapshot {
  name: string;
  brand: string;
  manufacturer: string;
  variant: string;
  netQuantity: string;
  mrp: string;
  batch: string;
  packageFamily: PackageFamily;
  image: string;
}

export interface CaseRecord {
  id: string;
  kind: CaseKind;
  status: CaseStatus;
  product: ProductSnapshot;
  retailer: string;
  location: string;
  district: string;
  trigger: string;
  assignedTo?: string;
  priority: PriorityBand;
  priorityReasons: string[];
  createdAt: string;
  parentId?: string;
  coverageConfirmed?: boolean;
  downloaded?: boolean;
}

export interface CaptureView {
  id: string;
  label: string;
  hint: string;
  required: boolean;
  kind: "overview" | "closeup";
  declaration?: DeclarationGroup;
}

export interface EvidenceItem {
  id: string;
  caseId: string;
  viewId: string;
  sequence: number;
  dataUrl: string;
  capturedAt: string;
  syncedAt?: string;
  lat?: number;
  lon?: number;
  accuracy?: number;
  sha256: string;
  syncStatus: SyncStatus;
  quality: "GOOD" | "BLUR" | "GLARE" | "COVERAGE_MISSING";
  qualityNote: string;
  source: "FIELD_CAPTURE" | "CITIZEN_UPLOAD" | "LISTING_UPLOAD" | "SEEDED";
}

export interface ExtractionCandidate {
  id: string;
  evidenceId: string;
  group: DeclarationGroup;
  text: string;
  confidence: number;
  bbox: BBox;
}

export interface DeclarationResult {
  group: DeclarationGroup;
  label: string;
  fusedValue?: string;
  state: EvidenceState;
  sourceCount: number;
  candidates: ExtractionCandidate[];
  verification: VerificationAction;
  verificationReason?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  ruleId?: string;
  ruleVersion?: string;
  presentationNote?: string;
  absenceEligible: boolean;
}

export interface Finding {
  id: string;
  caseId: string;
  group: DeclarationGroup;
  action: VerificationAction;
  value?: string;
  reason: string;
  officerId: string;
  at: string;
}

export interface PatternCandidate {
  id: string;
  title: string;
  level: "batch" | "manufacturer" | "retailer" | "location";
  rule: string;
  productName: string;
  batch?: string;
  verifiedCount: number;
  awaitingCount: number;
  citizenCount: number;
  locations: string[];
  matchingFactors: string[];
  linkedCaseIds: string[];
  status: PatternStatus;
  suspected: string;
}

export interface Complaint {
  id: string;
  trackingToken: string;
  productName: string;
  shop: string;
  location: string;
  notes: string;
  status: PublicStatus;
  caseId?: string;
  createdAt: string;
  image?: string;
  possibleIssues: string[];
}

export interface CopilotAnswer {
  title: string;
  body: string;
  bullets: string[];
  sources: { type: string; id: string; title: string; label: string }[];
  gap?: string;
  draftAction?: string;
}

export const DECLARATION_META: Record<
  DeclarationGroup,
  { label: string; short: string; rule: string; version: string }
> = {
  D01_IDENTITY: {
    label: "Commodity identity",
    short: "Identity",
    rule: "LMPC-R01 · Rule 6(1)(a)",
    version: "2011/consol-2025",
  },
  D02_MANUFACTURER: {
    label: "Manufacturer / packer / importer",
    short: "Manufacturer",
    rule: "LMPC-R03 · Rule 6(1)(b) / 10",
    version: "2011/consol-2025",
  },
  D03_NET_QTY: {
    label: "Net quantity",
    short: "Net qty",
    rule: "LMPC-R05 · Rule 6(1)(d)",
    version: "2011/consol-2025",
  },
  D04_MRP: {
    label: "MRP / retail sale price",
    short: "MRP",
    rule: "LMPC-R07 · Rule 6(1)(e)",
    version: "2011/consol-2025",
  },
  D05_DATE: {
    label: "Month / year of manufacture",
    short: "Date",
    rule: "LMPC-R09 · Rule 6(1)(f)",
    version: "2011/consol-2025",
  },
  D06_CARE: {
    label: "Consumer care",
    short: "Care",
    rule: "LMPC-R11 · Rule 6(2)",
    version: "2011/consol-2025",
  },
};

export const PACKAGE_LABEL: Record<PackageFamily, string> = {
  RIGID_CUBOID: "Rigid cuboid · carton / box",
  CURVED_RIGID: "Curved rigid · bottle / jar / can",
  FLEXIBLE: "Flexible · pouch / sachet",
  OTHER: "Other package · manual coverage",
};
