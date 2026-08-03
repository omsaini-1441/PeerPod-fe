"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SiteAtmosphere, type AtmosphereVariant } from "@/components/aceternity/site-atmosphere";
import { BrandMark } from "@/components/brand/brand-mark";
import { useAuth } from "@/components/providers/auth-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/pods", label: "Pods" },
  { href: "/profile", label: "Profile" },
];

function atmosphereForPath(pathname: string): AtmosphereVariant {
  if (pathname === "/") return "hero";
  if (pathname === "/pods") return "pods";
  if (pathname.startsWith("/pods/")) return "room";
  return "app";
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { authUser, isAuthenticated, logout } = useAuth();
  const atmosphere = atmosphereForPath(pathname);

  return (
    <div className="pp-shell relative overflow-x-hidden text-[var(--foreground)]">
      <SiteAtmosphere variant={atmosphere} />

      <div className="sticky top-0 z-40 px-4 pt-4 sm:px-5">
        <header className="mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full border border-[var(--border)] bg-[#0c0f0d]/75 px-3 py-2 shadow-[0_8px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:px-4">
          <Link
            href={isAuthenticated ? "/pods" : "/"}
            className="flex min-w-0 items-center gap-2.5 rounded-full py-1 pl-1 pr-2 transition-opacity hover:opacity-90"
          >
            <BrandMark size={32} />
            <span className="pp-display truncate text-base font-semibold tracking-tight text-white sm:text-lg">
              PeerPod
            </span>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {isAuthenticated ? (
              <>
                <nav className="hidden items-center gap-0.5 md:flex">
                  {navItems.map((item) => {
                    const active = pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "rounded-full px-3.5 py-1.5 text-sm transition-all duration-[var(--duration-med)] ease-[var(--ease-out-expo)]",
                          active
                            ? "bg-white/10 text-white"
                            : "text-[var(--muted)] hover:bg-white/5 hover:text-white",
                        )}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>

                <p className="hidden max-w-[9rem] truncate px-2 text-sm text-[var(--muted)] lg:block">
                  {authUser?.username}
                </p>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    void logout().then(() => {
                      window.location.assign("/login");
                    });
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <nav className="flex items-center gap-1.5">
                <Link
                  href="/login"
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className={cn(buttonVariants({ variant: "default", size: "sm" }))}
                >
                  Join
                </Link>
              </nav>
            )}
          </div>
        </header>
      </div>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-5 py-8 sm:px-6 sm:py-12">
        {children}
      </main>
    </div>
  );
}
