import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";

export const Route = createFileRoute("/journey")({ component: Journey });

const steps = [
  { n: "01", t: "Plan", d: "Versioned rules and the package profile ask for the next evidence-bearing view — not a fixed front/back checklist." },
  { n: "02", t: "Capture", d: "On-device blur, glare and coverage checks. GPS, time and SHA-256 are recorded automatically." },
  { n: "03", t: "Preserve", d: "One downloaded assignment can be completed offline. Sync is manual, duplicate-safe and hash-checked." },
  { n: "04", t: "Map", d: "Declarations show as Supported, Conflicting, Unresolved, Obscured, Potentially absent or N/A." },
  { n: "05", t: "Verify", d: "Accept, correct or reject. AI never becomes the legal finding." },
  { n: "06", t: "Act", d: "Only officer-verified records raise a systemic pattern. The officer approves any coordinated case." },
];

function Journey() {
  return (
    <SiteShell>
      <div className="mx-auto w-[min(1200px,calc(100%-1.5rem))] py-16">
        <p className="text-[11px] font-extrabold tracking-[0.22em] text-accent uppercase">The field journey</p>
        <h1 className="mt-3 font-display text-[clamp(2.6rem,6vw,4.6rem)] leading-[0.95] text-navy">
          From package
          <br />
          to evidence.
        </h1>
        <p className="mt-4 max-w-xl text-muted leading-relaxed">
          The interface follows the evidence chain. Offline capture is bounded; heavier processing waits for sync. A missing photograph is a recapture prompt, not a violation.
        </p>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <figure className="relative min-h-[380px] overflow-hidden border border-line">
            <img src="/media/godown.jpg" alt="Warehouse of packaged goods" className="h-full w-full object-cover" />
            <figcaption className="absolute top-5 right-5 rotate-2 border border-line bg-surface px-3 py-2 text-[10px] font-bold tracking-wider text-accent">
              FIELD RECORD · PROVENANCE FIRST
            </figcaption>
          </figure>
          <div className="border border-line bg-surface p-8">
            <p className="text-[11px] font-extrabold tracking-[0.18em] text-accent">01 · TRACEABLE CAPTURE</p>
            <h2 className="mt-3 font-display text-3xl text-navy">Record the scene before interpreting it.</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Every inspector photograph carries case identity, inspector identity, sequence, GPS and accuracy, capture/sync time, and a SHA-256 fingerprint of the file bytes.
            </p>
            <dl className="mt-6 divide-y divide-line border-t border-line text-sm">
              <div className="flex justify-between gap-4 py-3">
                <dt className="text-muted">Capture profile</dt>
                <dd className="font-semibold text-navy">Package-adaptive</dd>
              </div>
              <div className="flex justify-between gap-4 py-3">
                <dt className="text-muted">Offline state</dt>
                <dd className="font-semibold text-navy">One assignment</dd>
              </div>
              <div className="flex justify-between gap-4 py-3">
                <dt className="text-muted">Final finding</dt>
                <dd className="font-semibold text-navy">Officer verification</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-12 grid border-y border-line md:grid-cols-3">
          {steps.map((s, i) => (
            <article key={s.n} className={`p-6 ${i < steps.length - 1 ? "border-b border-line md:border-b-0 md:border-r" : ""}`}>
              <p className="font-display text-2xl text-accent">{s.n}</p>
              <h3 className="mt-4 text-lg font-semibold text-navy">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.d}</p>
            </article>
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
