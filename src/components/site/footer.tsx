export function SiteFooter() {
  return (
    <footer className="border-t border-line px-5 py-10 text-[11px] text-muted">
      <div className="mx-auto flex w-[min(1200px,100%)] flex-col justify-between gap-4 md:flex-row">
        <div>
          <p className="font-semibold text-navy">E-Niriksha</p>
          <p className="mt-1 max-w-xl leading-relaxed">
            Concept prototype for evidence-first Legal Metrology inspection and public reporting.
            Not an official Government of India website. No departmental emblem is used.
          </p>
        </div>
        <p className="leading-relaxed">
          Packaged Commodities Rules, 2011
          <br />
          Measure compliance. Protect consumers.
        </p>
      </div>
    </footer>
  );
}
