"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/pods", label: "Pods" },
  { href: "/profile", label: "Profile" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { authUser, isAuthenticated, logout } = useAuth();

  return (
    <div className="pp-shell text-[var(--foreground)]">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[#090b0a]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-6">
          <Link
            href={isAuthenticated ? "/pods" : "/"}
            className="flex min-w-0 items-center gap-3"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)] text-sm font-bold text-[var(--accent-ink)]">
              PP
            </div>
            <div className="min-w-0">
              <p className="pp-display text-lg leading-none font-semibold tracking-tight">
                PeerPod
              </p>
              <p className="mt-1 hidden truncate text-xs text-[var(--muted)] sm:block">
                Focus that moves the board
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <>
                <nav className="hidden items-center gap-1 md:flex">
                  {navItems.map((item) => {
                    const active = pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "rounded-lg px-3 py-2 text-sm transition",
                          active
                            ? "bg-white/8 text-white"
                            : "text-[var(--muted)] hover:bg-white/5 hover:text-white",
                        )}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>

                <div className="hidden h-6 w-px bg-white/10 lg:block" />

                <p className="hidden max-w-[10rem] truncate text-sm text-[var(--muted)] lg:block">
                  {authUser?.username}
                </p>

                <Button
                  type="button"
                  variant="secondary"
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
              <nav className="flex items-center gap-2">
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
                  Create account
                </Link>
              </nav>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
    </div>
  );
}
