import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/roles")({ component: Roles });

function Roles() {
  return (
    <SiteShell>
      <div className="mx-auto w-[min(1200px,calc(100%-1.5rem))] py-16">
        <p className="text-[11px] font-extrabold tracking-[0.22em] text-accent uppercase">People, not dashboards</p>
        <h1 className="mt-3 font-display text-[clamp(2.6rem,6vw,4.6rem)] leading-[0.95] text-navy">
          Three views of
          <br />
          one evidence chain.
        </h1>
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="border border-line bg-surface p-6">
            {[
              { n: "01", t: "Government officer", d: "Priority queue, systemic patterns, history, evidence-grounded review and coordinated follow-up.", to: "/officer" },
              { n: "02", t: "Legal Metrology inspector", d: "Assigned case, package-adaptive capture, offline evidence, compliance map and evidence-linked report.", to: "/inspector" },
              { n: "03", t: "Citizen", d: "Preliminary scan, visible-information review, confirmation, complaint submission and tracking.", to: "/citizen" },
            ].map((r, i) => (
              <div key={r.n} className={`grid grid-cols-[64px_1fr_auto] items-center gap-4 py-5 ${i < 2 ? "border-b border-line" : ""}`}>
                <p className="font-display text-3xl text-accent">{r.n}</p>
                <div>
                  <h2 className="text-lg font-semibold text-navy">{r.t}</h2>
                  <p className="mt-1 text-sm text-muted leading-relaxed">{r.d}</p>
                </div>
                <Link to={r.to}>
                  <Button variant="outline" size="sm">
                    Open
                  </Button>
                </Link>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <figure className="col-span-2 min-h-56 overflow-hidden border-8 border-surface shadow-[var(--shadow-border)]">
              <img src="/media/kirana-shelf.jpg" alt="Kirana shelves of packaged goods" className="h-full w-full object-cover" />
            </figure>
            <figure className="overflow-hidden border-8 border-surface">
              <img src="/media/kisan-ghar.jpg" alt="Mustard oil bottle" className="h-48 w-full object-cover" />
            </figure>
            <figure className="overflow-hidden border-8 border-surface">
              <img src="/media/label-closeup.jpg" alt="Package label close-up" className="h-48 w-full object-cover" />
            </figure>
          </div>
        </div>
        <p className="mt-10 border border-line bg-surface px-5 py-4 text-xs leading-relaxed text-muted">
          <span className="font-semibold text-navy">Identity note. </span>
          E-Niriksha is a concept interface. It does not use a Government of India emblem or claim departmental ownership.
        </p>
      </div>
    </SiteShell>
  );
}
