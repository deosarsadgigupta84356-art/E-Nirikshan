import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Upload } from "lucide-react";
import { Mark } from "@/components/site/mark";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PRELIMINARY_NOTICE } from "@/lib/seed";
import { assessQuality, resizeToJpeg } from "@/lib/evidence";
import { useApp } from "@/lib/store";
import type { PackageFamily, PublicStatus } from "@/lib/types";
import { PACKAGE_LABEL } from "@/lib/types";
import { cn, formatWhen } from "@/lib/utils";

export const Route = createFileRoute("/citizen")({ component: CitizenApp });

const STEPS = ["Scan", "Confirm", "Track"] as const;
type Step = (typeof STEPS)[number];

const STATUS: PublicStatus[] = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "INSPECTION_ASSIGNED",
  "INSPECTION_COMPLETED",
  "CLOSED",
];

function CitizenApp() {
  const [step, setStep] = useState<Step>("Scan");
  const [family, setFamily] = useState<PackageFamily>("FLEXIBLE");
  const [img, setImg] = useState<string | null>(null);
  const [issues, setIssues] = useState<string[]>([]);
  const [product, setProduct] = useState("Mirchi Crunch Potato Chips 50 g");
  const [shop, setShop] = useState("");
  const [location, setLocation] = useState("Bengaluru");
  const [notes, setNotes] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const submit = useApp((s) => s.submitComplaint);
  const complaints = useApp((s) => s.complaints);
  const mine = complaints.find((c) => c.trackingToken === token) ?? complaints[0];

  async function onFile(f?: File) {
    if (!f) return;
    const data = await resizeToJpeg(f);
    const q = await assessQuality(data);
    setImg(data);
    const found = [
      q.state === "BLUR" || q.state === "GLARE" ? q.note : "Visible print is readable enough for a preliminary look.",
      "Commodity identity — candidate visible",
      "MRP / retail sale price — candidate visible",
      "Net quantity — candidate visible",
      "Manufacturer / packer — needs a clearer frame",
      "Consumer care — not seen on this face; physical verification required",
    ];
    setIssues(found);
  }

  function send() {
    const c = submit({
      productName: product,
      shop: shop || "Shop not named",
      location,
      notes,
      image: img ?? "/media/mirchi-crunch.jpg",
      possibleIssues: issues,
    });
    setToken(c.trackingToken);
    setStep("Track");
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="flex items-center gap-3 border-b border-line bg-surface px-3 py-3">
        <Link to="/" className="flex items-center gap-2 text-navy">
          <ArrowLeft className="size-4" />
          <Mark className="size-8" />
        </Link>
        <div>
          <p className="text-sm font-bold text-navy">Citizen scan</p>
          <p className="text-[10px] text-muted">Preliminary · not an official finding</p>
        </div>
      </header>
      <div className="flex gap-1 border-b border-line bg-canvas px-3 py-2">
        {STEPS.map((s, i) => (
          <button
            key={s}
            onClick={() => setStep(s)}
            className={cn(
              "flex-1 py-2 text-sm font-semibold",
              step === s ? "border-b-2 border-accent text-navy" : "text-muted",
            )}
          >
            {i + 1}. {s}
          </button>
        ))}
      </div>
      <main className="mx-auto w-[min(720px,100%)] p-4 pb-24">
        {step === "Scan" && (
          <div>
            <h1 className="font-display text-4xl text-navy">Check what is visible.</h1>
            <p className="mt-2 text-sm text-muted">Choose a package shape, then photograph the declaration panel. Results stay preliminary.</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {(["FLEXIBLE", "RIGID_CUBOID", "CURVED_RIGID", "OTHER"] as PackageFamily[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFamily(f)}
                  className={cn(
                    "border px-3 py-3 text-left text-sm",
                    family === f ? "border-navy bg-navy text-surface" : "border-line bg-surface",
                  )}
                >
                  {PACKAGE_LABEL[f]}
                </button>
              ))}
            </div>
            <label className="mt-4 flex h-48 cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-line bg-surface text-sm text-muted">
              <Upload className="size-5" />
              Choose a package image
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
            </label>
            {img && <img src={img} alt="Uploaded pack" className="mt-3 max-h-64 w-full object-contain" />}
            {issues.length > 0 && (
              <div className="mt-4 border border-line bg-surface p-4">
                <p className="text-xs font-bold text-navy">Preliminary review</p>
                <ul className="mt-2 space-y-1 text-sm text-muted">
                  {issues.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
                <p className="mt-3 border-l-4 border-accent bg-paper-2 px-3 py-2 text-xs text-muted">{PRELIMINARY_NOTICE}</p>
                <Button className="mt-4" variant="accent" onClick={() => setStep("Confirm")}>
                  Confirm & submit
                </Button>
              </div>
            )}
            <button
              className="mt-4 text-xs font-bold text-navy underline"
              onClick={() => {
                setImg("/media/mirchi-crunch.jpg");
                setIssues([
                  "Commodity identity — candidate visible",
                  "MRP — candidate visible",
                  "Net quantity — candidate visible",
                  "Consumer care — not seen on this face; physical verification required",
                ]);
              }}
            >
              Use the Mirchi Crunch example
            </button>
          </div>
        )}

        {step === "Confirm" && (
          <div>
            <h1 className="font-display text-3xl text-navy">Confirm the lead</h1>
            <p className="mt-1 text-sm text-muted">Correct what you can see. This becomes a structured government lead, not a verdict.</p>
            <label className="mt-4 block text-xs font-bold text-muted">
              Product
              <input className="mt-1 h-11 w-full border border-line bg-surface px-3 text-sm" value={product} onChange={(e) => setProduct(e.target.value)} />
            </label>
            <label className="mt-3 block text-xs font-bold text-muted">
              Shop
              <input className="mt-1 h-11 w-full border border-line bg-surface px-3 text-sm" value={shop} onChange={(e) => setShop(e.target.value)} placeholder="Shop name and area" />
            </label>
            <label className="mt-3 block text-xs font-bold text-muted">
              City / location
              <input className="mt-1 h-11 w-full border border-line bg-surface px-3 text-sm" value={location} onChange={(e) => setLocation(e.target.value)} />
            </label>
            <label className="mt-3 block text-xs font-bold text-muted">
              What you noticed
              <textarea className="mt-1 w-full border border-line bg-surface p-3 text-sm" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </label>
            <p className="mt-3 text-xs text-muted">{PRELIMINARY_NOTICE}</p>
            <Button className="mt-4" variant="accent" onClick={send}>
              Submit structured lead
            </Button>
          </div>
        )}

        {step === "Track" && (
          <div>
            <h1 className="font-display text-3xl text-navy">Track complaint</h1>
            {token && (
              <p className="mt-2 text-sm">
                Tracking token <span className="font-mono font-bold text-navy">{token}</span>
              </p>
            )}
            <ol className="mt-6 space-y-3">
              {STATUS.map((s) => {
                const active = mine && STATUS.indexOf(mine.status) >= STATUS.indexOf(s);
                const current = mine?.status === s;
                return (
                  <li
                    key={s}
                    className={cn("border px-4 py-3", current ? "border-navy bg-surface" : "border-line bg-canvas")}
                  >
                    <p className="text-sm font-semibold text-navy">{s.replaceAll("_", " ")}</p>
                    {current && <Badge tone="navy">Current</Badge>}
                    {active && !current && <p className="text-[11px] text-verified">Reached</p>}
                  </li>
                );
              })}
            </ol>
            {mine && (
              <p className="mt-4 text-xs text-muted">
                {mine.productName} · {mine.shop} · submitted {formatWhen(mine.createdAt)}
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
