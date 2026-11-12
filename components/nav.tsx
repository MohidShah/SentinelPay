"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Shopping Assistant" },
  { href: "/audit", label: "Audit & Proofs" },
];

export function Nav() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <Logo />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[17px] font-semibold tracking-tight text-ink group-hover:text-white transition-colors">
                Sentinel<span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">Pay</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-pass-line bg-pass-bg/80 px-2 py-0.5 text-[10px] font-medium text-pass">
                <span className="h-1.5 w-1.5 rounded-full bg-pass animate-pulse" />
                PayPal Sandbox
              </span>
            </div>
            <span className="hidden text-[10px] font-medium tracking-wide text-faint sm:inline">
              AP2 INTENT MANDATES &bull; INJECTION FIREWALL
            </span>
          </div>
        </Link>
        <nav className="flex items-center gap-1.5">
          {LINKS.map((l) => {
            const active = l.href === "/" ? path === "/" : path.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`relative rounded-lg px-3.5 py-1.5 text-[13px] font-medium transition-all ${
                  active
                    ? "bg-surface text-ink border border-line-strong shadow-sm"
                    : "text-muted hover:text-ink hover:bg-surface/50"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent-bg via-surface to-raised border border-line-strong shadow-md">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 2.5 4 5.5v6c0 5 3.4 8.8 8 10 4.6-1.2 8-5 8-10v-6l-8-3Z"
          stroke="url(#shield-grad)"
          strokeWidth="1.8"
        />
        <path
          d="m8.5 12 2.4 2.4 4.6-4.8"
          stroke="#10b981"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient id="shield-grad" x1="4" y1="2.5" x2="20" y2="21.5" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38bdf8" />
            <stop offset="1" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
