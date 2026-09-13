import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Camera,
  Check,
  Download,
  RefreshCw,
  ShieldCheck,
  Upload,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Mark } from "@/components/site/mark";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StateChip, VerifyChip } from "@/lib/status";
import { capturePlan, INSPECTOR } from "@/lib/seed";
import { assessQuality, getCurrentPosition, resizeToJpeg, sha256OfBlob, dataUrlToBlob } from "@/lib/evidence";
import { useApp } from "@/lib/store";
import { cn, formatGps, formatWhen, shortHash, uid } from "@/lib/utils";
import type { DeclarationGroup, DeclarationResult, EvidenceItem, PackageFamily, VerificationAction } from "@/lib/types";
import { DECLARATION_META, PACKAGE_LABEL } from "@/lib/types";

export const Route = createFileRoute("/inspector")({ component: InspectorApp });

const STEPS = ["Assignments", "Case", "Capture", "Sync", "Map", "Verify", "Report"] as const;
type Step = (typeof STEPS)[number];

function InspectorApp() {
  const allCases = useApp((s) => s.cases);
  const cases = allCases.filter((c) => c.assignedTo === INSPECTOR.id);
  const [caseId, setCaseId] = useState("LM-0264");
  const [step, setStep] = useState<Step>("Assignments");
  const rec = allCases.find((c) => c.id === caseId);
  const offline = useApp((s) => s.offline);
  const toggleOffline = useApp((s) => s.toggleOffline);

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-surface px-3 py-2">
        <Link to="/" className="flex items-center gap-2 text-navy">
          <ArrowLeft className="size-4" />
          <Mark className="size-8" />
        </Link>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-navy">Inspector · {INSPECTOR.name}</p>
          <p className="truncate text-[10px] text-muted">
            {INSPECTOR.circle} · {rec ? `${rec.id} · ${rec.product.name}` : "Select an assignment"}
          </p>
        </div>
        <button
          onClick={toggleOffline}
          className={cn(
            "ml-auto inline-flex items-center gap-1.5 rounded-sm border px-2 py-1 text-[10px] font-bold",
            offline ? "border-line bg-pale-slate text-muted" : "border-line bg-pale-green text-verified",
          )}
        >
          {offline ? <WifiOff className="size-3.5" /> : <Wifi className="size-3.5" />}
          {offline ? "Offline" : "Online"}
        </button>
      </header>

      <div className="flex gap-1 overflow-x-auto border-b border-line bg-canvas px-2 py-2">
        {STEPS.map((s) => (
          <button
            key={s}
            onClick={() => setStep(s)}
            className={cn(
              "shrink-0 rounded-sm px-3 py-2 text-xs font-semibold",
              step === s ? "bg-navy text-surface" : "text-muted hover:bg-surface",
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <main className="mx-auto w-[min(1100px,100%)] p-4 pb-24">
        {step === "Assignments" && (
          <AssignmentList
            items={cases}
            current={caseId}
            onOpen={(id) => {
              setCaseId(id);
              setStep("Case");
            }}
          />
        )}
        {step === "Case" && rec && <CasePanel rec={rec} onStart={() => setStep("Capture")} />}
        {step === "Capture" && rec && <CapturePanel rec={rec} />}
        {step === "Sync" && rec && <SyncPanel rec={rec} onDone={() => setStep("Map")} />}
        {step === "Map" && rec && <MapPanel recId={rec.id} onOpen={() => setStep("Verify")} />}
        {step === "Verify" && rec && <VerifyPanel recId={rec.id} onDone={() => setStep("Report")} />}
        {step === "Report" && rec && <ReportPanel recId={rec.id} />}
      </main>
    </div>
  );
}

function AssignmentList({
  items,
  current,
  onOpen,
}: {
  items: { id: string; product: { name: string; image: string }; retailer: string; status: string; priority: string }[];
  current: string;
  onOpen: (id: string) => void;
}) {
  return (
    <div>
      <h1 className="font-display text-3xl text-navy">Assignments</h1>
      <p className="mt-1 text-sm text-muted">One downloaded case at a time for bounded offline work.</p>
      <ul className="mt-5 divide-y divide-line border border-line bg-surface">
        {items.map((c) => (
          <li key={c.id} className={cn("flex items-center gap-3 p-3", current === c.id && "bg-paper-2")}>
            <img src={c.product.image} alt="" className="size-14 object-cover" />
            <div className="min-w-0 flex-1">
              <p className="font-mono text-xs text-muted">{c.id}</p>
              <p className="truncate font-semibold text-navy">{c.product.name}</p>
              <p className="truncate text-xs text-muted">{c.retailer}</p>
            </div>
            <Badge tone={c.priority === "HIGH" ? "potential" : "slate"}>{c.priority}</Badge>
            <Button size="sm" onClick={() => onOpen(c.id)}>
              Open
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CasePanel({
  rec,
  onStart,
}: {
  rec: NonNullable<ReturnType<typeof useApp.getState>["cases"][number]>;
  onStart: () => void;
}) {
  const setFamily = useApp((s) => s.setPackageFamily);
  const confirm = useApp((s) => s.confirmCoverage);
  const family = rec.product.packageFamily;
  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <p className="text-[11px] font-extrabold tracking-[0.16em] text-accent">ASSIGNED CASE</p>
        <h1 className="mt-2 font-display text-3xl text-navy">{rec.id}</h1>
        <p className="mt-1 text-muted">{rec.product.name}</p>
        <dl className="mt-5 divide-y divide-line border-t border-line text-sm">
          {[
            ["Retailer", rec.retailer],
            ["Location", rec.location],
            ["Trigger", rec.trigger],
            ["Batch", rec.product.batch],
            ["Manufacturer", rec.product.manufacturer],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-2.5">
              <dt className="text-muted">{k}</dt>
              <dd className="max-w-[60%] text-right font-medium text-navy">{v}</dd>
            </div>
          ))}
        </dl>
        <h2 className="mt-6 text-sm font-bold text-navy">Package family</h2>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {(["FLEXIBLE", "RIGID_CUBOID", "CURVED_RIGID", "OTHER"] as PackageFamily[]).map((f) => (
            <button
              key={f}
              onClick={() => setFamily(rec.id, f)}
              className={cn(
                "border px-3 py-3 text-left text-sm",
                family === f ? "border-navy bg-navy text-surface" : "border-line bg-surface text-navy",
              )}
            >
              {PACKAGE_LABEL[f]}
            </button>
          ))}
        </div>
        {family === "OTHER" && (
          <div className="mt-3 border border-attention bg-pale-amber p-3 text-sm text-attention">
            Other Package never claims automatic completeness. Confirm inspected areas before any absence finding.
            <Button size="sm" variant="outline" className="mt-2" onClick={() => confirm(rec.id)}>
              Confirm coverage manually
            </Button>
          </div>
        )}
        <Button className="mt-6" size="lg" onClick={onStart}>
          Start capture
        </Button>
      </div>
      <img src={rec.product.image} alt={rec.product.name} className="h-80 w-full object-cover" />
    </div>
  );
}

function CapturePanel({ rec }: { rec: NonNullable<ReturnType<typeof useApp.getState>["cases"][number]> }) {
  const plan = capturePlan(rec.product.packageFamily);
  const allEvidence = useApp((s) => s.evidence);
  const evidence = allEvidence.filter((e) => e.caseId === rec.id);
  const addEvidence = useApp((s) => s.addEvidence);
  const [viewId, setViewId] = useState(plan[0]?.id ?? "v1");
  const view = plan.find((v) => v.id === viewId) ?? plan[0];
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [camOn, setCamOn] = useState(false);
  const [gps, setGps] = useState<{ lat: number; lon: number; acc: number } | null>(null);
  const [gpsNote, setGpsNote] = useState("Location not attached yet");
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function askGps() {
    try {
      const pos = await getCurrentPosition();
      setGps({ lat: pos.coords.latitude, lon: pos.coords.longitude, acc: pos.coords.accuracy });
      setGpsNote("Location allowed and attached to this record");
    } catch {
      setGpsNote("Location not granted. Evidence can still be stored; GPS will read as not captured.");
    }
  }

  async function startCam() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setBanner("Live camera needs a secure context. Use Choose photo instead.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      setCamOn(true);
      setBanner(null);
    } catch {
      setBanner("Camera permission denied. Choose a photo to continue.");
    }
  }

  async function register(dataUrl: string) {
    setBusy(true);
    try {
      const quality = await assessQuality(dataUrl);
      const hash = await sha256OfBlob(dataUrlToBlob(dataUrl));
      const item: EvidenceItem = {
        id: uid("evd"),
        caseId: rec.id,
        viewId: view.id,
        sequence: evidence.length + 1,
        dataUrl,
        capturedAt: new Date().toISOString(),
        lat: gps?.lat,
        lon: gps?.lon,
        accuracy: gps?.acc,
        sha256: hash,
        syncStatus: "LOCAL_ONLY",
        quality: quality.state,
        qualityNote: quality.note,
        source: "FIELD_CAPTURE",
      };
      addEvidence(item);
      setBanner(quality.note);
      const next = plan.find((p) => !evidence.some((e) => e.viewId === p.id) && p.id !== view.id);
      if (next && quality.state === "GOOD") setViewId(next.id);
    } finally {
      setBusy(false);
    }
  }

  async function snap() {
    const video = videoRef.current;
    if (!video?.srcObject) {
      setBanner("Start the camera, or choose a photo.");
      return;
    }
    const c = document.createElement("canvas");
    c.width = video.videoWidth || 900;
    c.height = video.videoHeight || 600;
    c.getContext("2d")?.drawImage(video, 0, 0, c.width, c.height);
    await register(c.toDataURL("image/jpeg", 0.9));
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setCamOn(false);
  }

  async function onFile(f?: File) {
    if (!f) return;
    const data = await resizeToJpeg(f);
    await register(data);
  }

  const capturedThis = evidence.filter((e) => e.viewId === view.id);

  return (
    <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
      <div>
        <p className="text-[11px] font-extrabold tracking-[0.16em] text-accent">NEXT EVIDENCE-BEARING VIEW</p>
        <h1 className="mt-2 font-display text-3xl text-navy">{view?.label}</h1>
        <p className="mt-1 text-sm text-muted">{view?.hint}</p>
        <div className="mt-3 flex flex-wrap gap-1">
          {plan.map((p) => (
            <button
              key={p.id}
              onClick={() => setViewId(p.id)}
              className={cn(
                "rounded-sm px-2 py-1 text-[10px] font-bold",
                p.id === view.id ? "bg-navy text-surface" : "bg-canvas text-muted",
              )}
            >
              {p.label}
              {evidence.some((e) => e.viewId === p.id && e.quality === "GOOD") ? " ·" : ""}
            </button>
          ))}
        </div>
        <div className="relative mt-4 min-h-72 overflow-hidden bg-ink">
          <video ref={videoRef} className={cn("h-72 w-full object-cover", !camOn && "hidden")} playsInline muted />
          {!camOn && (
            <div className="flex h-72 items-center justify-center text-sm text-surface/70">
              Camera idle · start camera or choose a photo
            </div>
          )}
          <div className="pointer-events-none absolute inset-10 border border-surface/70" />
        </div>
        {banner && (
          <p className="mt-3 border-l-4 border-attention bg-pale-amber px-3 py-2 text-sm text-attention">{banner}</p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="outline" onClick={askGps}>
            Allow location
          </Button>
          <Button onClick={startCam}>
            <Camera className="size-4" /> Start camera
          </Button>
          <Button variant="accent" disabled={busy} onClick={snap}>
            Capture view
          </Button>
          <label className="inline-flex h-11 items-center gap-2 rounded-sm border border-line px-4 text-sm font-semibold text-navy">
            <Upload className="size-4" /> Choose photo
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
          </label>
        </div>
        <p className="mt-2 text-[11px] text-muted">{gpsNote}</p>
      </div>
      <aside className="border border-line bg-surface p-4">
        <h2 className="text-sm font-bold text-navy">Provenance seal</h2>
        <p className="mt-1 text-xs text-muted">Recorded automatically. SHA-256 is a file fingerprint, not a claim that GPS cannot be spoofed.</p>
        <dl className="mt-4 space-y-2 text-xs">
          <Row k="Inspector" v={INSPECTOR.id} />
          <Row k="Case" v={rec.id} />
          <Row k="Sequence" v={String(evidence.length)} />
          <Row k="GPS" v={formatGps(gps?.lat, gps?.lon, gps?.acc)} />
          <Row k="Last capture" v={formatWhen(capturedThis.at(-1)?.capturedAt)} />
          <Row k="SHA-256" v={shortHash(capturedThis.at(-1)?.sha256, 16)} />
        </dl>
        {capturedThis.at(-1) && (
          <img src={capturedThis.at(-1)!.dataUrl} alt="Last capture" className="mt-3 h-40 w-full object-cover" />
        )}
      </aside>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-line py-1.5">
      <dt className="text-muted">{k}</dt>
      <dd className="font-mono text-[11px] text-navy">{v}</dd>
    </div>
  );
}

function SyncPanel({ rec, onDone }: { rec: { id: string }; onDone: () => void }) {
  const allEvidence = useApp((s) => s.evidence);
  const items = allEvidence.filter((e) => e.caseId === rec.id);
  const mark = useApp((s) => s.markSync);
  const run = useApp((s) => s.runAnalysis);
  const offline = useApp((s) => s.offline);
  const [stage, setStage] = useState("");

  async function syncAll() {
    if (offline) {
      setStage("Offline — connect, then synchronise. Local files are kept.");
      return;
    }
    for (const it of items) {
      if (it.syncStatus === "SYNCHRONISED") continue;
      mark(it.id, "UPLOADING");
      await wait(500);
      mark(it.id, "SYNCHRONISED", new Date().toISOString());
    }
    setStage("Queued → Extracting → Fusing → Rules");
    await wait(900);
    run(rec.id);
    setStage("Analysis ready. Open the Visual Compliance Map.");
    onDone();
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-navy">Synchronise</h1>
      <p className="mt-1 text-sm text-muted">Retry never creates a new evidence ID. Server receipt is required before Synced.</p>
      <ul className="mt-5 divide-y divide-line border border-line bg-surface">
        {items.length === 0 && <li className="p-4 text-sm text-muted">No local photographs yet.</li>}
        {items.map((e) => (
          <li key={e.id} className="flex items-center gap-3 p-3">
            <img src={e.dataUrl} alt="" className="size-12 object-cover" />
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[11px] text-navy">{e.id.slice(0, 16)}</p>
              <p className="text-xs text-muted">{e.qualityNote}</p>
            </div>
            <Badge
              tone={
                e.syncStatus === "SYNCHRONISED"
                  ? "verified"
                  : e.syncStatus === "FAILED"
                    ? "failure"
                    : e.syncStatus === "UPLOADING"
                      ? "attention"
                      : "slate"
              }
            >
              {e.syncStatus.replace("_", " ")}
            </Badge>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex gap-2">
        <Button onClick={syncAll} disabled={!items.length}>
          <RefreshCw className="size-4" /> Synchronise & analyse
        </Button>
      </div>
      {stage && <p className="mt-3 text-sm text-evidence">{stage}</p>}
    </div>
  );
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function MapPanel({ recId, onOpen }: { recId: string; onOpen: () => void }) {
  const maps = useApp((s) => s.maps);
  const map = maps[recId] ?? [];
  const [open, setOpen] = useState<DeclarationResult | null>(null);
  return (
    <div>
      <h1 className="font-display text-3xl text-navy">Visual Compliance Map</h1>
      <p className="mt-1 text-sm text-muted">
        A package-level evidence index — not a score, not a geographic map. Teal is source-backed evidence; green is reserved for officer verification.
      </p>
      <ul className="mt-5 divide-y divide-line border border-line bg-surface">
        {map.map((d) => (
          <li key={d.group}>
            <button
              className="flex w-full items-center gap-3 p-3 text-left"
              onClick={() => setOpen(d)}
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-navy">{d.label}</p>
                <p className="truncate text-sm text-muted">{d.fusedValue ?? "No fused value yet"}</p>
              </div>
              <StateChip state={d.state} />
              <VerifyChip action={d.verification} />
              <span className="text-[11px] text-muted">{d.sourceCount} src</span>
            </button>
          </li>
        ))}
      </ul>
      {open && <EvidenceDetail d={open} recId={recId} onClose={() => setOpen(null)} />}
      <Button className="mt-5" onClick={onOpen}>
        Continue to verification
      </Button>
    </div>
  );
}

function EvidenceDetail({
  d,
  recId,
  onClose,
}: {
  d: DeclarationResult;
  recId: string;
  onClose: () => void;
}) {
  const rec = useApp((s) => s.cases.find((c) => c.id === recId));
  const meta = DECLARATION_META[d.group];
  return (
    <div className="mt-4 grid gap-4 border border-line bg-surface p-4 lg:grid-cols-2">
      <div className="relative">
        <img src={rec?.product.image} alt="" className="w-full object-cover" />
        <div className="absolute top-[28%] left-[12%] h-[18%] w-[55%] border-2 border-evidence" />
        <p className="mt-2 text-[11px] text-muted">Source region highlighted on the supporting photograph.</p>
      </div>
      <div>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-navy">{d.label}</h3>
          <button className="text-xs text-muted" onClick={onClose}>
            Close
          </button>
        </div>
        <p className="mt-2 font-display text-2xl text-navy">{d.fusedValue ?? "—"}</p>
        <p className="mt-2 font-mono text-[11px] text-muted">
          {meta.rule} · {meta.version}
        </p>
        <div className="mt-3 flex gap-2">
          <StateChip state={d.state} />
          <VerifyChip action={d.verification} />
        </div>
        {d.state === "CONFLICTING" && (
          <p className="mt-3 text-sm text-attention">Two credible readings are retained. Fusion did not average them away.</p>
        )}
        {d.state === "POTENTIALLY_ABSENT" && !d.absenceEligible && (
          <p className="mt-3 text-sm text-attention">Coverage is not adequate — this cannot be treated as absence.</p>
        )}
      </div>
    </div>
  );
}

function VerifyPanel({ recId, onDone }: { recId: string; onDone: () => void }) {
  const maps = useApp((s) => s.maps);
  const map = maps[recId] ?? [];
  const verify = useApp((s) => s.verify);
  const complete = useApp((s) => s.completeReport);
  const [reason, setReason] = useState("Matches the captured source.");
  const [correct, setCorrect] = useState("");
  const [active, setActive] = useState<DeclarationGroup>(map[0]?.group ?? "D01_IDENTITY");
  const d = map.find((x) => x.group === active) ?? map[0];

  function act(action: VerificationAction) {
    if (!d) return;
    verify(recId, d.group, action, reason, action === "CORRECTED" ? correct : undefined);
  }

  const pending = map.filter((x) => x.verification === "UNREVIEWED");

  return (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <ul className="divide-y divide-line border border-line bg-surface">
        {map.map((x) => (
          <li key={x.group}>
            <button className={cn("w-full p-3 text-left", active === x.group && "bg-paper-2")} onClick={() => setActive(x.group)}>
              <p className="text-sm font-semibold text-navy">{x.label}</p>
              <div className="mt-1 flex gap-2">
                <StateChip state={x.state} />
                <VerifyChip action={x.verification} />
              </div>
            </button>
          </li>
        ))}
      </ul>
      {d && (
        <div className="border border-line bg-surface p-4">
          <h2 className="font-display text-2xl text-navy">{d.label}</h2>
          <p className="mt-1 text-muted">{d.fusedValue ?? "No value"}</p>
          <label className="mt-4 block text-xs font-bold text-muted">
            Reason
            <textarea
              className="mt-1 w-full border border-line bg-paper-2 p-2 text-sm text-ink"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
          <label className="mt-3 block text-xs font-bold text-muted">
            Corrected value (if correcting)
            <input
              className="mt-1 h-11 w-full border border-line bg-paper-2 px-3 text-sm"
              value={correct}
              onChange={(e) => setCorrect(e.target.value)}
            />
          </label>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="verified" onClick={() => act("ACCEPTED")}>
              <Check className="size-4" /> Accept
            </Button>
            <Button variant="outline" onClick={() => act("CORRECTED")}>
              Correct
            </Button>
            <Button variant="ghost" onClick={() => act("REJECTED")}>
              Reject recommendation
            </Button>
          </div>
          <p className="mt-3 text-[11px] text-muted">Rejecting an AI recommendation is not an error.</p>
          <Button
            className="mt-6"
            disabled={pending.length > 0}
            onClick={() => {
              complete(recId);
              onDone();
            }}
          >
            <ShieldCheck className="size-4" /> {pending.length ? `${pending.length} still unreviewed` : "Complete inspection"}
          </Button>
        </div>
      )}
    </div>
  );
}

function ReportPanel({ recId }: { recId: string }) {
  const rec = useApp((s) => s.cases.find((c) => c.id === recId));
  const maps = useApp((s) => s.maps);
  const map = maps[recId] ?? [];
  const allEvidence = useApp((s) => s.evidence);
  const evidence = allEvidence.filter((e) => e.caseId === recId);
  const ready = rec?.status === "REPORT_READY";

  function download() {
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>E-Niriksha ${recId}</title>
      <style>body{font-family:Georgia,serif;max-width:800px;margin:40px auto;color:#1c2128}h1{color:#203b61}table{width:100%;border-collapse:collapse}td,th{border:1px solid #d8d0c1;padding:8px;text-align:left}small{color:#6d6b65}</style></head>
      <body><h1>E-Niriksha inspection report</h1>
      <p><b>Case</b> ${recId}<br><b>Product</b> ${rec?.product.name}<br><b>Retailer</b> ${rec?.retailer}<br>
      <b>Inspector</b> ${INSPECTOR.id} ${INSPECTOR.name}<br>
      <small>Generated from officer-verified declarations. Not an autonomous legal decision.</small></p>
      <table><tr><th>Declaration</th><th>Value</th><th>Evidence</th><th>Officer action</th></tr>
      ${map.map((d) => `<tr><td>${d.label}</td><td>${d.fusedValue ?? "—"}</td><td>${d.state}</td><td>${d.verification}${d.verificationReason ? " — " + d.verificationReason : ""}</td></tr>`).join("")}
      </table>
      <p>Photographs sealed: ${evidence.length}. First hash: ${evidence[0]?.sha256 ?? "—"}</p>
      </body></html>`;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    a.download = `E-Niriksha-${recId}.html`;
    a.click();
  }

  return (
    <div className="border border-line bg-surface p-5">
      <h1 className="font-display text-3xl text-navy">Evidence-linked report</h1>
      {!ready && (
        <p className="mt-3 border-l-4 border-attention bg-pale-amber px-3 py-2 text-sm text-attention">
          Report generation is blocked until every declaration is accepted, corrected or rejected.
        </p>
      )}
      <table className="mt-5 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line text-[11px] tracking-wider text-muted">
            <th className="py-2">Declaration</th>
            <th>Value</th>
            <th>State</th>
            <th>Officer</th>
          </tr>
        </thead>
        <tbody>
          {map.map((d) => (
            <tr key={d.group} className="border-b border-line">
              <td className="py-2">{d.label}</td>
              <td>{d.fusedValue ?? "—"}</td>
              <td>
                <StateChip state={d.state} />
              </td>
              <td>
                <VerifyChip action={d.verification} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button className="mt-5" disabled={!ready} onClick={download}>
        <Download className="size-4" /> Download report
      </Button>
    </div>
  );
}
