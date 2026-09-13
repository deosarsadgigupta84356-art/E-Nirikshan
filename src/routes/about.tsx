import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";

export const Route = createFileRoute("/about")({ component: About });

function About() {
  return (
    <SiteShell>
      <div className="mx-auto w-[min(1200px,calc(100%-1.5rem))] py-16">
        <p className="text-[11px] font-extrabold tracking-[0.22em] text-accent uppercase">About the concept</p>
        <h1 className="mt-3 font-display text-[clamp(2.6rem,6vw,4.6rem)] leading-[0.95] text-navy">
          Built around
          <br />
          evidence, not theatre.
        </h1>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <article className="border border-line bg-surface p-8">
            <h2 className="font-display text-3xl text-navy">What belongs here</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Package-adaptive capture, bounded offline work, evidence provenance, six declaration groups, Visual Compliance Map states, role-based workflows, officer verification and citizen preliminary reporting.
            </p>
            <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-muted">
              <li>Commodity identity</li>
              <li>Manufacturer / packer / importer</li>
              <li>Net quantity</li>
              <li>MRP / retail sale price</li>
              <li>Month / year of manufacture</li>
              <li>Consumer care</li>
            </ul>
          </article>
          <article className="border border-line bg-surface p-8">
            <h2 className="font-display text-3xl text-navy">What this prototype will not do</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              It will not issue a legal decision, scrape marketplaces, treat a listing screenshot as a complete package, count citizen leads as verified patterns, or invent physical font size without calibration.
            </p>
            <p className="mt-5 border-l-4 border-accent bg-paper-2 px-4 py-3 text-sm text-muted">
              <span className="font-semibold text-navy">Officer verification. </span>
              AI-supported evidence is shown separately from the officer decision. The responsible officer remains the final verifier.
            </p>
          </article>
        </div>
      </div>
    </SiteShell>
  );
}
