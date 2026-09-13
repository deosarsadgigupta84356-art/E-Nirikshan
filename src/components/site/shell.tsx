import { SiteFooter } from "./footer";
import { SiteNav } from "./nav";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="paper-grid min-h-screen">
      <SiteNav />
      {children}
      <SiteFooter />
    </div>
  );
}
