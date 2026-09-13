import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  FolderSearch,
  ImagePlus,
  MessageSquare,
  ShieldAlert,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Mark } from "@/components/site/mark";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StateChip, VerifyChip, priorityTone } from "@/lib/status";
import { copilotFor, useApp } from "@/lib/store";
import { OFFICER } from "@/lib/seed";
import { PRELIMINARY_NOTICE } from "@/lib/seed";
import { assessQuality, resizeToJpeg } from "@/lib/evidence";
import { cn, formatWhen } from "@/lib/utils";
import type { CopilotAnswer } from "@/lib/types";

export const Route = createFileRoute("/officer")({ component: OfficerApp });

const NAV = ["Overview", "Queue", "Case", "Patterns", "Repository", "Listing review"] as const;
type Nav = (typeof NAV)[number];

function OfficerApp() {
  const [nav, setNav] = useState<Nav>("Overview");
  const [caseId, setCaseId] = useState("LM-0264");
  const reset = useApp((s) => s.resetDemo);

  return (
    <div className="min-h-screen bg-paper md:grid md:grid-cols-[220px_1fr]">
      <aside className="border-b border-line bg-navy text-surface md:min-h-screen md:border-b-0 md:border-r md:border-navy-deep">
        <div className="flex items-center gap-2 px-4 py-4">
          <Mark className="size-9" />
          <div>
            <p className="text-sm font-bold">E-Niriksha</p>
            <p className="text-[10px] tracking-wider text-surface/70">GOVERNMENT DESK</p>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:overflow-visible">
          {NAV.map((n) => (
            <button
              key={n}
              onClick={() => setNav(n)}
              className={cn(
                "shrink-0 px-3 py-2 text-left text-sm",
                nav === n ? "bg-surface text-navy" : "text-surface/80 hover:bg-navy-deep",
              )}
            >
              {n}
            </button>
          ))}
        </nav>
        <div className="hidden px-4 pt-8 text-[11px] text-surface/70 md:block">
          <p>{OFFICER.name}</p>
          <p>{OFFICER.designation}</p>
          <button className="mt-4 underline" onClick={reset}>
            Reset demo data
          </button>
          <Link to="/" className="mt-2 flex items-center gap-1 text-surface/80">
            <ArrowLeft className="size-3" /> Public site
          </Link>
        </div>
      </aside>
      <main className="min-w-0 p-4 md:p-6">
        {nav === "Overview" && (
          <Overview
            onOpenCase={(id) => {
              setCaseId(id);
              setNav("Case");
            }}
            onPatterns={() => setNav("Patterns")}
          />
        )}
        {nav === "Queue" && (
          <Queue
            onOpen={(id) => {
              setCaseId(id);
              setNav("Case");
            }}
          />
        )}
        {nav === "Case" && <CaseReview caseId={caseId} />}
        {nav === "Patterns" && <Patterns />}
        {nav === "Repository" && (
          <Repository
            onOpen={(id) => {
              setCaseId(id);
              setNav("Case");
            }}
          />
        )}
        {nav === "Listing review" && <ListingReview />}
      </main>
    </div>
  );
}

function Overview({ onOpenCase, onPatterns }: { onOpenCase: (id: string) => void; onPatterns: () => void }) {
  const cases = useApp((s) => s.cases);
  const patterns = useApp((s) => s.patterns);
  const high = cases.filter((c) => c.priority === "HIGH").length;
  const awaiting = cases.filter((c) => c.status === "AWAITING_VERIFICATION").length;
  const verified = cases.filter((c) => c.status === "VERIFIED" || c.status === "REPORT_READY").length;
  const chart = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of cases) m.set(c.district, (m.get(c.district) ?? 0) + 1);
    return [...m.entries()].map(([name, n]) => ({ name, n }));
  }, [cases]);
  const pat = patterns[0];

  return (
    <div>
      <p className="text-[11px] font-extrabold tracking-[0.18em] text-accent">OPERATIONAL OVERVIEW</p>
      <h1 className="mt-1 font-display text-3xl text-navy">What needs attention</h1>
      <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
        {[
          ["High priority", high],
          ["Awaiting verification", awaiting],
          ["Officer verified", verified],
          ["Pattern candidates", patterns.filter((p) => p.status === "CANDIDATE").length],
        ].map(([k, v]) => (
          <div key={String(k)} className="border border-line bg-surface px-3 py-3">
            <p className="text-[10px] tracking-wider text-muted uppercase">{k}</p>
            <p className="font-display text-3xl tabular-nums text-navy">{v}</p>
          </div>
        ))}
      </div>

      {pat && (
        <button
          onClick={onPatterns}
          className="mt-5 w-full border-l-[3px] border-accent bg-surface p-4 text-left"
        >
          <p className="flex items-center gap-2 text-[11px] font-extrabold tracking-wider text-accent">
            <ShieldAlert className="size-4" /> SYSTEMIC ALERT
          </p>
          <h2 className="mt-1 font-display text-xl text-navy">{pat.title}</h2>
          <p className="mt-1 text-sm text-muted">
            Same verified issue across {pat.locations.length} locations. Evidence: {pat.verifiedCount} officer-verified; {pat.awaitingCount} awaiting; {pat.citizenCount} citizen lead. Suspected level: {pat.suspected}.
          </p>
        </button>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="border border-line bg-surface p-4">
          <p className="text-xs font-bold text-navy">Cases by district</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart}>
                <CartesianGrid stroke="#d8d0c1" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="n" fill="#203b61" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="border border-line bg-surface p-4">
          <p className="text-xs font-bold text-navy">Priority queue</p>
          <ul className="mt-2 divide-y divide-line">
            {cases
              .filter((c) => c.kind !== "SYSTEMIC")
              .slice(0, 5)
              .map((c) => (
                <li key={c.id}>
                  <button className="flex w-full items-center justify-between py-2 text-left" onClick={() => onOpenCase(c.id)}>
                    <span>
                      <span className="font-mono text-xs text-muted">{c.id}</span>
                      <span className="block text-sm text-navy">{c.product.name}</span>
                    </span>
                    <Badge tone={priorityTone(c.priority)}>{c.priority}</Badge>
                  </button>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Queue({ onOpen }: { onOpen: (id: string) => void }) {
  const cases = useApp((s) => s.cases);
  const override = useApp((s) => s.overridePriority);
  const [filter, setFilter] = useState("ALL");
  const rows = cases.filter((c) => filter === "ALL" || c.priority === filter);

  return (
    <div>
      <h1 className="font-display text-3xl text-navy">Explainable priority queue</h1>
      <p className="mt-1 text-sm text-muted">Ordering is explained. An officer can override it with a reason.</p>
      <div className="mt-3 flex gap-2">
        {["ALL", "HIGH", "MEDIUM", "LOW"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn("px-3 py-1 text-xs font-bold", filter === f ? "bg-navy text-surface" : "bg-canvas text-muted")}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="mt-4 overflow-x-auto border border-line bg-surface">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[10px] tracking-wider text-muted">
              <th className="px-3 py-2">Case</th>
              <th>Product</th>
              <th>Retailer</th>
              <th>Why</th>
              <th>Priority</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="border-b border-line">
                <td className="px-3 py-2 font-mono text-xs">{c.id}</td>
                <td>{c.product.name}</td>
                <td>{c.retailer}</td>
                <td className="max-w-xs text-xs text-muted">{c.priorityReasons[0]}</td>
                <td>
                  <Badge tone={priorityTone(c.priority)}>{c.priority}</Badge>
                </td>
                <td className="px-2">
                  <Button size="sm" variant="ghost" onClick={() => onOpen(c.id)}>
                    Review
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => override(c.id, c.priority === "HIGH" ? "MEDIUM" : "HIGH", "Officer override from queue")}
                  >
                    Override
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CaseReview({ caseId }: { caseId: string }) {
  const rec = useApp((s) => s.cases.find((c) => c.id === caseId));
  const maps = useApp((s) => s.maps);
  const map = maps[caseId] ?? [];
  const [chip, setChip] = useState("summarise");
  const [answer, setAnswer] = useState<CopilotAnswer>(() => copilotFor("summarise", caseId, null));
  const [draft, setDraft] = useState("");
  const [approved, setApproved] = useState(false);

  function ask(c: string) {
    const a = copilotFor(c, caseId, null);
    setChip(c);
    setAnswer(a);
    setDraft(a.draftAction ?? "");
    setApproved(false);
  }

  if (!rec) return <p>Case not found.</p>;

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
      <div>
        <p className="font-mono text-xs text-muted">{rec.id}</p>
        <h1 className="font-display text-3xl text-navy">{rec.product.name}</h1>
        <p className="text-sm text-muted">{rec.retailer} · {rec.location}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge tone={priorityTone(rec.priority)}>{rec.priority}</Badge>
          <Badge tone="navy">{rec.status.replaceAll("_", " ")}</Badge>
        </div>
        <img src={rec.product.image} alt="" className="mt-4 h-56 w-full object-cover" />
        <ul className="mt-4 divide-y divide-line border border-line bg-surface">
          {map.map((d) => (
            <li key={d.group} className="flex items-center justify-between gap-2 p-3">
              <div>
                <p className="text-sm font-semibold text-navy">{d.label}</p>
                <p className="text-xs text-muted">{d.fusedValue ?? "—"}</p>
              </div>
              <div className="flex flex-wrap justify-end gap-1">
                <StateChip state={d.state} />
                <VerifyChip action={d.verification} />
              </div>
            </li>
          ))}
        </ul>
      </div>
      <aside className="border border-line bg-surface p-4">
        <p className="flex items-center gap-2 text-xs font-bold text-navy">
          <MessageSquare className="size-4" /> Grounded copilot
        </p>
        <p className="mt-1 text-[11px] text-muted">Contextual to this case. Every material claim carries a source. Copilot cannot assign work.</p>
        <div className="mt-3 flex flex-wrap gap-1">
          {[
            ["summarise", "Summarise"],
            ["priority", "Why priority"],
            ["related", "Related cases"],
            ["gaps", "Missing evidence"],
            ["brief", "Prepare brief"],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => ask(id)}
              className={cn("px-2 py-1 text-[11px] font-bold", chip === id ? "bg-navy text-surface" : "bg-canvas text-muted")}
            >
              {label}
            </button>
          ))}
        </div>
        <h3 className="mt-4 font-display text-xl text-navy">{answer.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{answer.body}</p>
        <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-navy">
          {answer.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        {answer.gap && (
          <p className="mt-3 border-l-4 border-attention bg-pale-amber px-3 py-2 text-sm text-attention">{answer.gap}</p>
        )}
        <div className="mt-3 space-y-1">
          {answer.sources.map((s) => (
            <div key={s.id} className="flex justify-between border border-line px-2 py-1 text-[11px]">
              <span className="text-navy">
                {s.type} · {s.id} · {s.title}
              </span>
              <Badge tone={s.label.includes("verified") ? "verified" : "slate"}>{s.label}</Badge>
            </div>
          ))}
        </div>
        {answer.draftAction && (
          <div className="mt-4">
            <label className="text-[11px] font-bold text-muted">
              Editable inspection brief
              <textarea
                className="mt-1 w-full border border-line p-2 text-sm"
                rows={3}
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value);
                  setApproved(false);
                }}
              />
            </label>
            <Button
              className="mt-2"
              variant="verified"
              size="sm"
              onClick={() => setApproved(true)}
            >
              <Check className="size-3.5" /> Officer approve draft
            </Button>
            {approved && <p className="mt-2 text-xs text-verified">Draft approved. Assignment still requires the Assignments action — copilot did not dispatch it.</p>}
          </div>
        )}
      </aside>
    </div>
  );
}

function Patterns() {
  const patterns = useApp((s) => s.patterns);
  const cases = useApp((s) => s.cases);
  const decide = useApp((s) => s.decidePattern);
  const assign = useApp((s) => s.assignFollowup);
  const followups = useApp((s) => s.followups);
  const [parent, setParent] = useState<string | null>(null);
  const [answer, setAnswer] = useState(() => copilotFor("pattern", null, patterns[0]?.id ?? null));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {patterns.map((p) => (
        <article key={p.id} className="border border-line bg-surface p-4">
          <Badge tone={p.status === "APPROVED" ? "verified" : p.status === "REJECTED" ? "slate" : "attention"}>
            {p.status}
          </Badge>
          <h2 className="mt-2 font-display text-2xl text-navy">{p.title}</h2>
          <p className="mt-1 text-sm text-muted">Suspected level: {p.suspected}</p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="bg-pale-green p-2">
              <p className="font-display text-2xl tabular-nums text-verified">{p.verifiedCount}</p>
              <p className="text-[10px] text-muted">Verified</p>
            </div>
            <div className="bg-pale-amber p-2">
              <p className="font-display text-2xl tabular-nums text-attention">{p.awaitingCount}</p>
              <p className="text-[10px] text-muted">Awaiting</p>
            </div>
            <div className="bg-pale-slate p-2">
              <p className="font-display text-2xl tabular-nums text-muted">{p.citizenCount}</p>
              <p className="text-[10px] text-muted">Citizen leads</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted">Match factors: {p.matchingFactors.join(" · ")}</p>
          <ul className="mt-2 text-sm">
            {p.linkedCaseIds.map((id) => {
              const c = cases.find((x) => x.id === id);
              return (
                <li key={id} className="flex justify-between border-b border-line py-1">
                  <span>{id} · {c?.retailer}</span>
                  <span className="text-xs text-muted">{c?.status.replaceAll("_", " ")}</span>
                </li>
              );
            })}
          </ul>
          {p.status === "CANDIDATE" && (
            <div className="mt-3 flex gap-2">
              <Button
                variant="verified"
                size="sm"
                onClick={() => {
                  const id = decide(p.id, "APPROVED");
                  setParent(id);
                }}
              >
                Approve parent case
              </Button>
              <Button variant="outline" size="sm" onClick={() => decide(p.id, "REJECTED")}>
                Keep as individual
              </Button>
            </div>
          )}
          {parent && p.status === "APPROVED" && (
            <div className="mt-3">
              <p className="text-xs text-verified">Parent case {parent} created.</p>
              <Button size="sm" className="mt-2" onClick={() => assign(parent, "INS-042")}>
                Assign INS-042 follow-up
              </Button>
            </div>
          )}
        </article>
      ))}
      <aside className="border border-line bg-surface p-4">
        <p className="text-xs font-bold text-navy">Why these records connect</p>
        <button className="mt-2 text-xs font-bold text-accent" onClick={() => setAnswer(copilotFor("pattern", null, patterns[0]?.id ?? null))}>
          Explain pattern
        </button>
        <h3 className="mt-3 font-display text-xl text-navy">{answer.title}</h3>
        <p className="mt-2 text-sm text-muted">{answer.body}</p>
        {answer.sources.map((s) => (
          <p key={s.id} className="mt-1 text-[11px] text-navy">
            {s.id} · {s.title} · {s.label}
          </p>
        ))}
        {followups.map((f) => (
          <p key={f.id} className="mt-2 text-xs text-verified">
            Follow-up {f.text} · {f.status}
          </p>
        ))}
      </aside>
    </div>
  );
}

function Repository({ onOpen }: { onOpen: (id: string) => void }) {
  const cases = useApp((s) => s.cases);
  const [q, setQ] = useState("");
  const rows = cases.filter((c) => {
    const hay = `${c.id} ${c.product.name} ${c.product.batch} ${c.product.manufacturer} ${c.retailer} ${c.location}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });
  return (
    <div>
      <h1 className="flex items-center gap-2 font-display text-3xl text-navy">
        <FolderSearch className="size-7" /> Repository
      </h1>
      <p className="mt-1 text-sm text-muted">Indexed search over case snapshots and reports. No separate product master.</p>
      <input
        className="mt-4 h-11 w-full max-w-lg border border-line bg-surface px-3 text-sm"
        placeholder="Product, batch, retailer, rule, case ID"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <table className="mt-4 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line text-[10px] tracking-wider text-muted">
            <th className="py-2">Date</th>
            <th>Case</th>
            <th>Product</th>
            <th>Retailer</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.id} className="cursor-pointer border-b border-line hover:bg-paper-2" onClick={() => onOpen(c.id)}>
              <td className="py-2 text-xs">{formatWhen(c.createdAt)}</td>
              <td className="font-mono text-xs">{c.id}</td>
              <td>{c.product.name}</td>
              <td>{c.retailer}</td>
              <td>{c.status.replaceAll("_", " ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <p className="mt-4 text-sm text-muted">No rows for this filter. Empty is not a failure.</p>}
    </div>
  );
}

function ListingReview() {
  const [img, setImg] = useState<string | null>(null);
  const [text, setText] = useState("Mirchi Crunch 50g · listed MRP ₹20 · seller: Shree Mart");
  const [stage, setStage] = useState<"idle" | "analysing" | "ready">("idle");
  const [quality, setQuality] = useState("");

  async function onFile(f?: File) {
    if (!f) return;
    const data = await resizeToJpeg(f);
    setImg(data);
    setStage("analysing");
    const q = await assessQuality(data);
    setQuality(q.note);
    await new Promise((r) => setTimeout(r, 700));
    setStage("ready");
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div>
        <h1 className="flex items-center gap-2 font-display text-3xl text-navy">
          <ImagePlus className="size-7" /> Listing / image review
        </h1>
        <p className="mt-1 text-sm text-muted">
          Officer-uploaded screenshot or package photo plus optional listing text. Unseen sides are an evidence gap — never potentially absent.
        </p>
        <label className="mt-4 flex h-40 cursor-pointer items-center justify-center border border-dashed border-line bg-surface text-sm text-muted">
          Upload package or listing image
          <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
        </label>
        <textarea
          className="mt-3 w-full border border-line p-2 text-sm"
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {img && <img src={img} alt="Uploaded listing" className="mt-3 max-h-64 object-contain" />}
      </div>
      <div className="border border-line bg-surface p-4">
        {stage === "idle" && <p className="text-sm text-muted">Waiting for an image.</p>}
        {stage === "analysing" && <p className="text-sm text-evidence">Analysing visible evidence…</p>}
        {stage === "ready" && (
          <div>
            <p className="text-xs font-bold text-navy">Visible in image</p>
            <ul className="mt-2 list-disc pl-4 text-sm text-muted">
              <li>Commodity identity — candidate on captured face</li>
              <li>MRP — candidate if numerals are in view</li>
              <li>Supplied listing text (separately labelled): {text}</li>
            </ul>
            <p className="mt-3 text-xs text-muted">Image quality: {quality}</p>
            <p className="mt-4 border-l-4 border-attention bg-pale-amber px-3 py-2 text-sm text-attention">
              Evidence gap: this screenshot does not cover all package sides. Physical verification required. Absence is not established.
            </p>
            <p className="mt-3 text-[11px] text-muted">{PRELIMINARY_NOTICE}</p>
          </div>
        )}
      </div>
    </div>
  );
}
