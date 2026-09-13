import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/site/shell";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/")({ component: Home });

const slides = [
  { src: "/media/kirana-shelf.jpg", n: "01", title: "Goods reach the shelf", cap: "Everyday packaged commodities in an Indian kirana" },
  { src: "/media/label-closeup.jpg", n: "02", title: "Declarations must be readable", cap: "MRP, net quantity, packer, date, consumer care" },
  { src: "/media/field-desk.jpg", n: "03", title: "The inspector records the scene", cap: "Photograph, GPS, time and SHA-256 travel with the file" },
  { src: "/media/mirchi-back.jpg", n: "04", title: "Evidence is mapped, not scored", cap: "Each declaration stays linked to its source region" },
  { src: "/media/godown.jpg", n: "05", title: "Repeated verified findings become action", cap: "Patterns count officer-confirmed records only" },
];

function Home() {
  const language = useApp((s) => s.language);
  const [i, setI] = useState(0);
  useEffect(() => {
    const tmr = setInterval(() => setI((n) => (n + 1) % slides.length), 3800);
    return () => clearInterval(tmr);
  }, []);

  return (
    <SiteShell>
      <section className="mx-auto grid w-[min(1200px,calc(100%-1.5rem))] items-center gap-8 pb-8 pt-10 lg:grid-cols-2 lg:gap-12 lg:pt-16">
        <div>
          <p className="text-[11px] font-extrabold tracking-[0.22em] text-accent uppercase">
            {t(language, "eyebrow")}
          </p>
          <h1 className="mt-4 font-display text-[clamp(3.4rem,8vw,6.6rem)] font-semibold leading-[0.88] tracking-[-0.04em] text-navy">
            {t(language, "heroTitle1")}
            <span className="mt-2 block italic text-accent">{t(language, "heroTitle2")}</span>
          </h1>
          <p className="mt-5 text-lg text-muted">{t(language, "heroTag")}</p>
          <div className="my-5 flex items-center gap-2">
            <i className="block h-1.5 w-16 bg-navy" />
            <i className="block h-1.5 w-9 bg-accent" />
            <i className="block h-1.5 w-5 bg-ochre" />
          </div>
          <p className="max-w-xl text-[17px] leading-relaxed text-muted">{t(language, "heroDesc")}</p>
          <div className="mt-7 flex flex-wrap gap-2">
            <Link to="/inspector">
              <Button variant="accent" size="lg">
                {t(language, "ctaInspector")}
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link to="/citizen">
              <Button variant="outline" size="lg">
                {t(language, "ctaCitizen")}
              </Button>
            </Link>
            <Link to="/officer">
              <Button variant="primary" size="lg">
                {t(language, "ctaOfficer")}
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-[11px] text-muted">
            <span className="font-semibold text-navy">Prototype note. </span>
            {t(language, "note")}
          </p>
        </div>

        <div className="relative">
          <div className="relative overflow-hidden rounded-sm border border-line bg-canvas p-6 flex items-center justify-center" style={{ minHeight: 320 }}>
            {/* Embedded video player: place `nirkshan_demo.mp4` (or .webm/.ogg) in public/media */}
            <div className="w-full max-w-3xl">
              <div className="mb-4 text-center">
                <h3 className="font-display text-2xl text-navy">Project demo video</h3>
                <p className="text-sm text-muted">Video source: public/media/nirkshan_demo.mp4</p>
              </div>
              <video
                controls
                className="w-full rounded-sm bg-black"
                poster="/media/nirkshan_demo-poster.jpg"
                preload="metadata"
                // many browsers block autoplay with sound; using muted autoplay is possible if desired
              >
                <source src="/media/nirkshan_demo.mp4" type="video/mp4" />
                <source src="/media/nirkshan_demo.webm" type="video/webm" />
                <source src="/media/nirkshan_demo.ogg" type="video/ogg" />
                {/* Fallback to audio for very small previews */}
                <p className="text-sm text-muted">Your browser does not support the video element. You can download the file <a href="/media/nirkshan_demo.mp4" className="underline">here</a>.</p>
              </video>
            </div>
          </div>
        </div>
      </section>

      <div className="border-y border-line bg-canvas/70 py-3">
        <div className="mx-auto flex w-[min(1200px,calc(100%-1.5rem))] items-center gap-4 overflow-x-auto text-[11px] whitespace-nowrap">
          <strong className="tracking-[0.14em] text-navy">FIELD RECORD</strong>
          <span className="size-1 rounded-full bg-accent" />
          <span className="text-muted">{t(language, "ribbon")}</span>
        </div>
      </div>

      <section className="mx-auto grid w-[min(1200px,calc(100%-1.5rem))] gap-4 py-16 md:grid-cols-3">
        {[
          { k: "01", t: "Inspector", d: "Download one assignment, capture offline, seal provenance, verify the map, generate the report.", to: "/inspector", c: "Open field path" },
          { k: "02", t: "Government officer", d: "See why a case is first, inspect proof, approve a verified pattern, assign follow-up.", to: "/officer", c: "Open the desk" },
          { k: "03", t: "Citizen", d: "Scan what is visible, confirm shop details, submit a structured lead. No official verdict.", to: "/citizen", c: "Start a scan" },
        ].map((card) => (
          <Link
            key={card.k}
            to={card.to}
            className="group border border-line bg-surface p-6 transition-colors hover:bg-paper-2"
          >
            <p className="font-display text-3xl text-accent">{card.k}</p>
            <h2 className="mt-3 font-display text-2xl text-navy">{card.t}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{card.d}</p>
            <p className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-navy">
              {card.c} <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </p>
          </Link>
        ))}
      </section>
    </SiteShell>
  );
}
