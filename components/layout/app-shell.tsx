"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";

const navItems = [
  { href: "/pods", label: "Pods" },
  { href: "/profile", label: "Profile" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { authUser, token, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.18),_transparent_35%),linear-gradient(180deg,#0b1020_0%,#0f172a_45%,#020617_100%)] text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/60 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href={token ? "/pods" : "/login"} className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/20 text-lg font-semibold text-indigo-200">
              PP
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-indigo-200/70">
                PeerPod
              </p>
              <p className="text-xs text-slate-400">
                Focus with people who make it count
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            {token ? (
              <>
                <nav className="hidden items-center gap-2 md:flex">
                  {navItems.map((item) => {
                    const active = pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`rounded-full px-4 py-2 text-sm transition ${
                          active
                            ? "bg-indigo-500 text-white"
                            : "text-slate-300 hover:bg-white/5"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium text-white">{authUser?.username}</p>
                  <p className="text-xs text-slate-400">Ready to move the board</p>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5"
                >
                  Logout
                </button>
              </>
            ) : (
              <nav className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="rounded-full px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-400"
                >
                  Create account
                </Link>
              </nav>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
