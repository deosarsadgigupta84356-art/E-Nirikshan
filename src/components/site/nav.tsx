import { Link, useRouterState } from "@tanstack/react-router";
import { Mark } from "./mark";
import { LANGS, t } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", key: "navHome" },
  { to: "/journey", key: "navJourney" },
  { to: "/roles", key: "navRoles" },
  { to: "/about", key: "navAbout" },
] as const;

export function SiteNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const language = useApp((s) => s.language);
  const setLanguage = useApp((s) => s.setLanguage);

  return (
    <header className="sticky top-3 z-40 mx-auto w-[min(1200px,calc(100%-1.25rem))]">
      <div className="flex min-h-[4.25rem] items-center gap-3 rounded-2xl border border-line bg-surface/95 px-3 py-2 shadow-[var(--shadow-border)] backdrop-blur-sm">
        <Link to="/" className="flex min-w-0 items-center gap-2.5 px-1">
          <Mark className="size-11 shrink-0" />
          <span className="leading-tight">
            <span className="block font-display text-lg font-semibold text-navy">E-Niriksha</span>
            <span className="block text-[9px] font-bold tracking-[0.16em] text-muted">
              LEGAL METROLOGY · INDIA
            </span>
          </span>
        </Link>
        <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "px-3 py-2 text-sm font-semibold text-muted transition-colors",
                pathname === l.to && "border-b-2 border-accent text-navy",
              )}
            >
              {t(language, l.key)}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <label className="hidden items-center gap-2 rounded-sm border border-line bg-paper-2 px-2 py-1.5 sm:flex">
            <span className="text-[9px] font-bold tracking-wider text-muted">भाषा</span>
            <select
              className="bg-transparent text-xs font-bold text-navy outline-none"
              value={language}
              onChange={(e) => setLanguage(e.target.value as typeof language)}
              aria-label="Language"
            >
              {LANGS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>
          <Link
            to="/officer"
            className="hidden rounded-sm bg-navy px-3 py-2 text-xs font-bold text-surface sm:inline-flex"
          >
            {t(language, "ctaOfficer")}
          </Link>
        </div>
      </div>
      <nav className="mt-2 flex gap-1 overflow-x-auto rounded-xl border border-line bg-surface px-2 py-1 md:hidden">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className={cn(
              "shrink-0 px-3 py-2 text-xs font-semibold text-muted",
              pathname === l.to && "text-navy",
            )}
          >
            {t(language, l.key)}
          </Link>
        ))}
      </nav>
    </header>
  );
}
