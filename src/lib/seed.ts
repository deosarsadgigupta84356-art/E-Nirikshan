import type {
  CaptureView,
  CaseRecord,
  Complaint,
  DeclarationGroup,
  DeclarationResult,
  PackageFamily,
  PatternCandidate,
} from "./types";

export const INSPECTOR = {
  id: "INS-042",
  name: "K. Sharma",
  designation: "Legal Metrology Inspector",
  circle: "Bengaluru Central",
};

export const OFFICER = {
  id: "GOV-001",
  name: "A. Menon",
  designation: "Supervising Officer",
  office: "Controller of Legal Metrology · Karnataka",
};

export function capturePlan(family: PackageFamily): CaptureView[] {
  if (family === "RIGID_CUBOID") {
    return [
      { id: "v1", label: "Front-right corner", hint: "Angle the carton so front and right panel are both readable.", required: true, kind: "overview" },
      { id: "v2", label: "Back-left corner", hint: "Capture the reverse faces; include any continued declarations.", required: true, kind: "overview" },
      { id: "v3", label: "Top / flap", hint: "Photograph the top if batch or date is printed there.", required: false, kind: "overview" },
      { id: "v4", label: "MRP close-up", hint: "Hold the camera perpendicular to the MRP numerals.", required: true, kind: "closeup", declaration: "D04_MRP" },
      { id: "v5", label: "Net quantity close-up", hint: "Fill the frame with the net-quantity line.", required: true, kind: "closeup", declaration: "D03_NET_QTY" },
      { id: "v6", label: "Manufacturer close-up", hint: "Include name and address block in one frame.", required: true, kind: "closeup", declaration: "D02_MANUFACTURER" },
      { id: "v7", label: "Consumer-care close-up", hint: "Frame the care name, telephone and e-mail if present.", required: true, kind: "closeup", declaration: "D06_CARE" },
    ];
  }
  if (family === "CURVED_RIGID") {
    return [
      { id: "v1", label: "Rotation A", hint: "Start at the main label; keep the bottle centred.", required: true, kind: "overview" },
      { id: "v2", label: "Rotation B · overlap", hint: "Rotate so the previous edge still appears — curvature hides text.", required: true, kind: "overview" },
      { id: "v3", label: "Top / cap", hint: "Capture the cap and neck if quantity or date is printed there.", required: false, kind: "overview" },
      { id: "v4", label: "MRP close-up", hint: "Centre the MRP, then move closer to reduce curve distortion.", required: true, kind: "closeup", declaration: "D04_MRP" },
      { id: "v5", label: "Net quantity close-up", hint: "Hold perpendicular after the quantity is centred.", required: true, kind: "closeup", declaration: "D03_NET_QTY" },
      { id: "v6", label: "Packer / importer close-up", hint: "Include the packed-by block in one readable frame.", required: true, kind: "closeup", declaration: "D02_MANUFACTURER" },
      { id: "v7", label: "Consumer-care close-up", hint: "Look for a wrap-around care line near the base.", required: true, kind: "closeup", declaration: "D06_CARE" },
    ];
  }
  if (family === "FLEXIBLE") {
    return [
      { id: "v1", label: "Front angled", hint: "Hold the pouch flat. Capture the branded face at a slight angle.", required: true, kind: "overview" },
      { id: "v2", label: "Back angled", hint: "Turn over. Include the full declaration panel.", required: true, kind: "overview" },
      { id: "v3", label: "Seam / edge", hint: "Photograph the sealed edge — declarations sometimes continue there.", required: true, kind: "overview" },
      { id: "v4", label: "MRP close-up", hint: "Flatten the panel. Avoid glare on metallic ink.", required: true, kind: "closeup", declaration: "D04_MRP" },
      { id: "v5", label: "Net quantity close-up", hint: "Fill the frame with the net-quantity expression.", required: true, kind: "closeup", declaration: "D03_NET_QTY" },
      { id: "v6", label: "Manufacturer close-up", hint: "Include packed-by name and address.", required: true, kind: "closeup", declaration: "D02_MANUFACTURER" },
      { id: "v7", label: "Consumer-care close-up", hint: "Frame telephone / e-mail. If missing after coverage, flag it.", required: true, kind: "closeup", declaration: "D06_CARE" },
    ];
  }
  return [
    { id: "v1", label: "Overview 1", hint: "Record the first inspected face. Other Package does not claim completeness.", required: true, kind: "overview" },
    { id: "v2", label: "Overview 2", hint: "A complementary face. Confirm coverage manually before absence findings.", required: true, kind: "overview" },
    { id: "v3", label: "Targeted close-up", hint: "Photograph any declaration you can read.", required: true, kind: "closeup" },
  ];
}

export const CASES: CaseRecord[] = [
  {
    id: "LM-0264",
    kind: "INSPECTION",
    status: "ASSIGNED",
    product: {
      name: "Mirchi Crunch Potato Chips",
      brand: "Mirchi Crunch",
      manufacturer: "Deccan Foods Pvt Ltd",
      variant: "Masala · 50 g",
      netQuantity: "50 g",
      mrp: "₹20.00",
      batch: "B241",
      packageFamily: "FLEXIBLE",
      image: "/media/mirchi-crunch.jpg",
    },
    retailer: "Shree Mart, Chickpet",
    location: "Chickpet, Bengaluru",
    district: "Bengaluru Urban",
    trigger: "Citizen lead CIT-104 · possible missing consumer-care line",
    assignedTo: "INS-042",
    priority: "HIGH",
    priorityReasons: [
      "Cross-retailer recurrence on batch B241",
      "Citizen lead with photographs",
      "Evidence not yet verified",
    ],
    createdAt: "2026-09-09T08:10:00.000Z",
    downloaded: true,
  },
  {
    id: "LM-0259",
    kind: "INSPECTION",
    status: "AWAITING_VERIFICATION",
    product: {
      name: "Sona Gold Glucose Biscuits",
      brand: "Sona Gold",
      manufacturer: "Malabar Packers",
      variant: "Family pack · 250 g",
      netQuantity: "250 g",
      mrp: "₹35.00",
      batch: "SG-081",
      packageFamily: "RIGID_CUBOID",
      image: "/media/sona-gold.jpg",
    },
    retailer: "City Bazaar, Jayanagar",
    location: "Jayanagar, Bengaluru",
    district: "Bengaluru Urban",
    trigger: "Routine market inspection · net-quantity conflict across views",
    assignedTo: "INS-042",
    priority: "HIGH",
    priorityReasons: ["Conflicting net-quantity readings", "Evidence ready for officer review"],
    createdAt: "2026-09-07T11:40:00.000Z",
    downloaded: true,
  },
  {
    id: "LM-0271",
    kind: "INSPECTION",
    status: "VERIFIED",
    product: {
      name: "Kisan Ghar Mustard Oil",
      brand: "Kisan Ghar",
      manufacturer: "Kisan Ghar Oils",
      variant: "Cold pressed · 1 L",
      netQuantity: "1 L",
      mrp: "₹198.00",
      batch: "KG-06",
      packageFamily: "CURVED_RIGID",
      image: "/media/kisan-ghar.jpg",
    },
    retailer: "Namma Kirana, Malleswaram",
    location: "Malleswaram, Bengaluru",
    district: "Bengaluru Urban",
    trigger: "Supervisory sample · declarations complete",
    assignedTo: "INS-042",
    priority: "LOW",
    priorityReasons: ["Officer-verified · no open finding"],
    createdAt: "2026-09-04T09:00:00.000Z",
  },
  {
    id: "LM-0248",
    kind: "INSPECTION",
    status: "VERIFIED",
    product: {
      name: "Mirchi Crunch Potato Chips",
      brand: "Mirchi Crunch",
      manufacturer: "Deccan Foods Pvt Ltd",
      variant: "Masala · 50 g",
      netQuantity: "50 g",
      mrp: "₹20.00",
      batch: "B241",
      packageFamily: "FLEXIBLE",
      image: "/media/mirchi-back.jpg",
    },
    retailer: "Hari Stores, Mysuru",
    location: "Devaraja Market, Mysuru",
    district: "Mysuru",
    trigger: "Verified MRP dual-print on batch B241",
    assignedTo: "INS-018",
    priority: "HIGH",
    priorityReasons: ["Officer-verified dual MRP print", "Same batch as LM-0251"],
    createdAt: "2026-09-02T10:20:00.000Z",
  },
  {
    id: "LM-0251",
    kind: "INSPECTION",
    status: "VERIFIED",
    product: {
      name: "Mirchi Crunch Potato Chips",
      brand: "Mirchi Crunch",
      manufacturer: "Deccan Foods Pvt Ltd",
      variant: "Masala · 50 g",
      netQuantity: "50 g",
      mrp: "₹20.00",
      batch: "B241",
      packageFamily: "FLEXIBLE",
      image: "/media/mirchi-crunch.jpg",
    },
    retailer: "Lake View Mart, Bengaluru",
    location: "Ulsoor, Bengaluru",
    district: "Bengaluru Urban",
    trigger: "Verified MRP dual-print on batch B241",
    assignedTo: "INS-021",
    priority: "HIGH",
    priorityReasons: ["Officer-verified dual MRP print"],
    createdAt: "2026-09-03T14:15:00.000Z",
  },
  {
    id: "LM-0255",
    kind: "INSPECTION",
    status: "AWAITING_VERIFICATION",
    product: {
      name: "Mirchi Crunch Potato Chips",
      brand: "Mirchi Crunch",
      manufacturer: "Deccan Foods Pvt Ltd",
      variant: "Masala · 50 g",
      netQuantity: "50 g",
      mrp: "₹20.00",
      batch: "B241",
      packageFamily: "FLEXIBLE",
      image: "/media/mirchi-back.jpg",
    },
    retailer: "Coastal Stores, Mangaluru",
    location: "Hampankatta, Mangaluru",
    district: "Dakshina Kannada",
    trigger: "Related capture · awaiting officer verification",
    assignedTo: "INS-033",
    priority: "MEDIUM",
    priorityReasons: ["Same batch B241 · not yet verified"],
    createdAt: "2026-09-06T16:00:00.000Z",
  },
];

export const COMPLAINTS: Complaint[] = [
  {
    id: "CIT-104",
    trackingToken: "EN-8F2K",
    productName: "Mirchi Crunch Potato Chips · 50 g",
    shop: "Shree Mart, Chickpet",
    location: "Bengaluru",
    notes: "Could not find consumer-care number on the pouch.",
    status: "INSPECTION_ASSIGNED",
    caseId: "LM-0264",
    createdAt: "2026-09-08T18:22:00.000Z",
    image: "/media/mirchi-crunch.jpg",
    possibleIssues: ["Consumer care may be missing from the captured face"],
  },
  {
    id: "CIT-109",
    trackingToken: "EN-3L9P",
    productName: "Sona Gold Glucose Biscuits · 250 g",
    shop: "Corner Shop, Whitefield",
    location: "Bengaluru",
    notes: "Net quantity print looks overwritten.",
    status: "UNDER_REVIEW",
    createdAt: "2026-09-10T09:05:00.000Z",
    image: "/media/sona-gold.jpg",
    possibleIssues: ["Net quantity print may be inconsistent"],
  },
];

export const PATTERNS: PatternCandidate[] = [
  {
    id: "PAT-01",
    title: "Mirchi Crunch / Batch B241 · dual MRP print",
    level: "batch",
    rule: "LMPC-R07 · Rule 6(1)(e)",
    productName: "Mirchi Crunch Potato Chips",
    batch: "B241",
    verifiedCount: 2,
    awaitingCount: 1,
    citizenCount: 1,
    locations: ["Bengaluru", "Mysuru", "Mangaluru"],
    matchingFactors: ["Product name", "Batch B241", "Manufacturer: Deccan Foods", "Rule LMPC-R07"],
    linkedCaseIds: ["LM-0248", "LM-0251", "LM-0255", "LM-0264"],
    status: "CANDIDATE",
    suspected: "Batch / manufacturer",
  },
];

export function seededMap(caseId: string): DeclarationResult[] {
  if (caseId === "LM-0259") {
    return mapFrom([
      ["D01_IDENTITY", "Sona Gold Glucose Biscuits", "SUPPORTED", 2, true],
      ["D02_MANUFACTURER", "Malabar Packers, Kozhikode", "SUPPORTED", 1, true],
      ["D03_NET_QTY", "250 g  /  200 g", "CONFLICTING", 2, true],
      ["D04_MRP", "₹35.00 incl. of all taxes", "SUPPORTED", 2, true],
      ["D05_DATE", "07/2026", "UNRESOLVED", 1, true],
      ["D06_CARE", undefined, "POTENTIALLY_ABSENT", 0, true],
    ]);
  }
  if (caseId === "LM-0271") {
    return mapFrom([
      ["D01_IDENTITY", "Kisan Ghar Mustard Oil", "SUPPORTED", 2, true],
      ["D02_MANUFACTURER", "Kisan Ghar Oils, Jaipur", "SUPPORTED", 1, true],
      ["D03_NET_QTY", "1 L", "SUPPORTED", 2, true],
      ["D04_MRP", "₹198.00 incl. of all taxes", "SUPPORTED", 2, true],
      ["D05_DATE", "06/2026", "SUPPORTED", 1, true],
      ["D06_CARE", "1800-200-3344 · care@kisanghar.example", "SUPPORTED", 1, true],
    ]).map((d) => ({ ...d, verification: "ACCEPTED" as const, verifiedBy: "INS-042", verifiedAt: "2026-09-04T12:10:00.000Z" }));
  }
  if (caseId === "LM-0248" || caseId === "LM-0251") {
    return mapFrom([
      ["D01_IDENTITY", "Mirchi Crunch Potato Chips", "SUPPORTED", 2, true],
      ["D02_MANUFACTURER", "Deccan Foods Pvt Ltd, Bengaluru", "SUPPORTED", 1, true],
      ["D03_NET_QTY", "50 g", "SUPPORTED", 2, true],
      ["D04_MRP", "₹20.00 and ₹10.00 printed", "CONFLICTING", 2, true],
      ["D05_DATE", "08/2026", "SUPPORTED", 1, true],
      ["D06_CARE", "1800-123-4567", "SUPPORTED", 1, true],
    ]).map((d) => ({
      ...d,
      verification: d.group === "D04_MRP" ? "ACCEPTED" : "ACCEPTED",
      verifiedBy: caseId === "LM-0248" ? "INS-018" : "INS-021",
      verifiedAt: "2026-09-03T10:00:00.000Z",
      verificationReason: d.group === "D04_MRP" ? "Two printed MRP values on the same batch." : "Matches captured source.",
    }));
  }
  if (caseId === "LM-0255") {
    return mapFrom([
      ["D01_IDENTITY", "Mirchi Crunch Potato Chips", "SUPPORTED", 1, true],
      ["D02_MANUFACTURER", "Deccan Foods Pvt Ltd", "SUPPORTED", 1, true],
      ["D03_NET_QTY", "50 g", "SUPPORTED", 1, true],
      ["D04_MRP", "₹20.00 / ₹10.00", "CONFLICTING", 2, true],
      ["D05_DATE", "08/2026", "SUPPORTED", 1, true],
      ["D06_CARE", "1800-123-4567", "UNRESOLVED", 1, true],
    ]);
  }
  // LM-0264 default — empty until analysis
  return emptyMap();
}

export function emptyMap(): DeclarationResult[] {
  return mapFrom([
    ["D01_IDENTITY", undefined, "UNRESOLVED", 0, false],
    ["D02_MANUFACTURER", undefined, "UNRESOLVED", 0, false],
    ["D03_NET_QTY", undefined, "UNRESOLVED", 0, false],
    ["D04_MRP", undefined, "UNRESOLVED", 0, false],
    ["D05_DATE", undefined, "UNRESOLVED", 0, false],
    ["D06_CARE", undefined, "UNRESOLVED", 0, false],
  ]);
}

type Row = [DeclarationGroup, string | undefined, DeclarationResult["state"], number, boolean];

function mapFrom(rows: Row[]): DeclarationResult[] {
  const labels: Record<DeclarationGroup, string> = {
    D01_IDENTITY: "Commodity identity",
    D02_MANUFACTURER: "Manufacturer / packer / importer",
    D03_NET_QTY: "Net quantity",
    D04_MRP: "MRP / retail sale price",
    D05_DATE: "Month / year of manufacture",
    D06_CARE: "Consumer care",
  };
  return rows.map(([group, fusedValue, state, sourceCount, absenceEligible]) => ({
    group,
    label: labels[group],
    fusedValue,
    state,
    sourceCount,
    candidates: [],
    verification: "UNREVIEWED",
    absenceEligible,
    ruleId: group,
    ruleVersion: "2011/consol-2025",
  }));
}

export const PRELIMINARY_NOTICE =
  "This is a preliminary, non-authoritative scan. It is not an official Legal Metrology finding. An authorised officer must verify any inspection result.";
