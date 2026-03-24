"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bot, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getSessionToken, clearSession } from "@/lib/api-client";
import { userService } from "@/services/user.service";
import { DASHBOARD_NAV } from "@/utils/dashboard-nav";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const token = getSessionToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    let cancelled = false;
    userService
      .getMe()
      .then((u) => {
        if (!cancelled) setEmail(u.email);
      })
      .catch(() => {
        if (!cancelled) setEmail("");
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  const logout = () => {
    clearSession();
    router.push("/login");
  };

  if (!ready) {
    return (
      <div className="bg-background text-muted-foreground flex min-h-screen items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" aria-hidden />
        <span className="sr-only">Loading workspace</span>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground flex min-h-screen">
      <aside
        className={cn(
          "border-sidebar-border bg-sidebar text-sidebar-foreground fixed inset-y-0 left-0 z-40 w-60 border-r max-lg:transition-transform lg:static",
          mobileOpen ? "translate-x-0" : "max-lg:-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
          <div className="bg-sidebar-primary/15 text-sidebar-primary flex size-9 items-center justify-center rounded-lg">
            <Bot className="size-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-sidebar-foreground truncate text-sm font-semibold">Agentic</p>
            <p className="text-muted-foreground truncate text-xs">Communications</p>
          </div>
        </div>
        <nav className="flex flex-col gap-0.5 p-3" aria-label="Main">
          {DASHBOARD_NAV.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/dashboard"
                ? pathname === "/dashboard" || pathname === "/dashboard/"
                : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="size-4 shrink-0 opacity-80" aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {mobileOpen ? (
        <button
          type="button"
          className="bg-foreground/20 fixed inset-0 z-30 lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-border bg-card/80 supports-[backdrop-filter]:bg-card/60 sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b px-4 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen((o) => !o)}
              aria-expanded={mobileOpen}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
            <h1 className="text-foreground truncate text-sm font-medium tracking-tight max-sm:max-w-[140px]">
              {DASHBOARD_NAV.find((n) =>
                n.href === "/dashboard"
                  ? pathname === "/dashboard" || pathname === "/dashboard/"
                  : pathname === n.href || pathname.startsWith(`${n.href}/`)
              )?.label ?? "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground hidden max-w-[200px] truncate text-sm sm:inline">{email}</span>
            <Button type="button" variant="outline" size="sm" onClick={logout} className="gap-1.5">
              <LogOut className="size-3.5" aria-hidden />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
