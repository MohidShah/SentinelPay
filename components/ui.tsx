import type { ReactNode } from "react";

export type Tone = "pass" | "warn" | "block" | "neutral" | "accent" | "primary";

const TONE: Record<Tone, string> = {
  pass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warn: "bg-amber-50 text-amber-700 border-amber-200",
  block: "bg-red-50 text-red-700 border-red-200",
  neutral: "bg-gray-50 text-gray-700 border-gray-200",
  accent: "bg-blue-50 text-blue-700 border-blue-200",
  primary: "bg-blue-50 text-blue-700 border-blue-200",
};

export function Badge({
  tone = "neutral",
  children,
  icon,
  className = "",
}: {
  tone?: Tone;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-tight ${TONE[tone]} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
}

export function Card({
  children,
  className = "",
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <section
      className={`rounded-xl border border-gray-200 bg-white shadow-sm transition-all ${
        hover ? "hover:border-gray-300 hover:shadow" : ""
      } ${className}`}
    >
      {children}
    </section>
  );
}

export function Label({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`text-[11px] font-semibold uppercase tracking-wider text-gray-500 ${className}`}>
      {children}
    </div>
  );
}

/** Display-only formatting ("2200.00" → "$2,200.00"). Values stay decimal strings everywhere else. */
export function formatUsd(value: string | number): string {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return `$${value}`;
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function Money({ value, className = "" }: { value: string; className?: string }) {
  return <span className={`font-mono tabular-nums tracking-tight ${className}`}>{formatUsd(value)}</span>;
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
};

export function Button({ variant = "secondary", size = "md", className = "", ...props }: ButtonProps) {
  const sizeStyles = {
    sm: "h-8 px-3.5 text-xs gap-1.5 rounded-full",
    md: "h-9 px-4.5 text-xs font-semibold gap-2 rounded-full",
    lg: "h-10 px-6 text-sm font-semibold gap-2.5 rounded-full",
  }[size];

  const variantStyles = {
    primary:
      "bg-[#2563EB] text-white font-semibold hover:bg-blue-700 shadow-xs border border-[#2563EB] active:scale-[0.98] cursor-pointer transition-all",
    secondary:
      "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 shadow-2xs active:scale-[0.98] cursor-pointer transition-all",
    outline:
      "border border-[#2563EB]/30 bg-blue-50/50 text-[#2563EB] hover:bg-blue-50 hover:border-[#2563EB] active:scale-[0.98] cursor-pointer transition-all",
    ghost:
      "text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:scale-[0.98] cursor-pointer transition-all",
    danger:
      "bg-red-600 text-white hover:bg-red-700 shadow-xs border border-red-600 active:scale-[0.98] cursor-pointer transition-all",
  }[variant];

  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50 ${sizeStyles} ${variantStyles} ${className}`}
    />
  );
}

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg className={`h-4 w-4 animate-spin text-current ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export const Icon = {
  check: (c = "h-3.5 w-3.5") => (
    <svg className={c} viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="m3.5 8.5 3 3 6-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  x: (c = "h-3.5 w-3.5") => (
    <svg className={c} viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="m4.5 4.5 7 7m0-7-7 7" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  alert: (c = "h-3.5 w-3.5") => (
    <svg className={c} viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M8 2.5 14 13H2L8 2.5Z" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M8 6.5v3M8 11.2v.1" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  shield: (c = "h-4 w-4") => (
    <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M12 2.5 4 5.5v6c0 5 3.4 8.8 8 10 4.6-1.2 8-5 8-10v-6l-8-3Z" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  ),
  shieldCheck: (c = "h-4 w-4") => (
    <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M12 2.5 4 5.5v6c0 5 3.4 8.8 8 10 4.6-1.2 8-5 8-10v-6l-8-3Z" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  lock: (c = "h-3.5 w-3.5") => (
    <svg className={c} viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
      <rect x="3" y="7" width="10" height="7" rx="1.5" strokeWidth="1.5" />
      <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" strokeWidth="1.5" />
    </svg>
  ),
  terminal: (c = "h-3.5 w-3.5") => (
    <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <polyline points="4 17 10 11 4 5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="12" y1="19" x2="20" y2="19" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  cart: (c = "h-3.5 w-3.5") => (
    <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path
        d="M3 4h2l2 12h11l2-8H6.5"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="20" r="1.5" fill="currentColor" />
      <circle cx="17" cy="20" r="1.5" fill="currentColor" />
    </svg>
  ),
  zap: (c = "h-3.5 w-3.5") => (
    <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M13 2 4 14h7l-1 8 10-13h-7l1-7Z" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  ),
};
