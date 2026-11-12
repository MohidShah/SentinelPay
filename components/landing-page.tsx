"use client";

import React from "react";
import { SentinelLogo } from "./sentinel-logo";
import {
  ShieldAlert,
  Lock,
  ArrowRight,
  ChevronRight,
  Ban,
  DollarSign,
} from "lucide-react";

interface LandingPageProps {
  onEnterApp: () => void;
  onExploreScenario?: (scenario: string) => void;
  onOpenSelector?: () => void;
}

/* ============================================================================
 * Partner & Tech Stack Logos (High-Fidelity Vectors)
 * ============================================================================ */

function PayPalBrandIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.945 2.502a.855.855 0 0 1 .843-.715h6.818c3.084 0 5.488 1.543 5.093 5.01-.32 2.809-2.227 4.417-4.793 4.417H9.722l-1.39 8.804a.641.641 0 0 1-.633.535l-.623-.216z"
        fill="#003087"
      />
      <path
        d="M8.332 21.337h4.084a.855.855 0 0 0 .844-.716l.872-5.526.055-.306a.855.855 0 0 1 .844-.716h1.22c3.084 0 5.488-1.543 5.882-5.01.298-2.617-1.31-4.062-4.033-4.439a6.63 6.63 0 0 0-1.745-.147H9.722a.855.855 0 0 0-.844.716l-1.93 12.23a.641.641 0 0 0 .633.74l.751.174z"
        fill="#0079C1"
      />
      <path
        d="M9.722 9.098h3.184c2.566 0 4.473-1.608 4.793-4.417.135-1.187-.042-2.128-.574-2.825a4.83 4.83 0 0 0-2.316-.979H8.878a.855.855 0 0 0-.844.715L6.46 11.536h2.418l.844-2.438z"
        fill="#00457C"
        opacity="0.35"
      />
    </svg>
  );
}

function APIMaticBrandIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="apm-top" x1="16" y1="3" x2="16" y2="15" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366F1" />
          <stop offset="1" stopColor="#4F46E5" />
        </linearGradient>
        <linearGradient id="apm-left" x1="4" y1="10" x2="16" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4338CA" />
          <stop offset="1" stopColor="#312E81" />
        </linearGradient>
        <linearGradient id="apm-right" x1="16" y1="10" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#818CF8" />
          <stop offset="1" stopColor="#6366F1" />
        </linearGradient>
      </defs>
      <path d="M16 3.5L27 9.8V22.2L16 28.5L5 22.2V9.8L16 3.5Z" stroke="#4F46E5" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M16 3.5L27 9.8L16 16L5 9.8L16 3.5Z" fill="url(#apm-top)" />
      <path d="M5 9.8L16 16V28.5L5 22.2V9.8Z" fill="url(#apm-left)" />
      <path d="M16 16L27 9.8V22.2L16 28.5V16Z" fill="url(#apm-right)" />
      <path d="M11.5 14L8.5 16L11.5 18" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20.5 14L23.5 16L20.5 18" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16" cy="16" r="2.2" fill="#38BDF8" />
    </svg>
  );
}

function Channel3BrandIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ch3-grad" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#6D28D9" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="28" height="28" rx="7" fill="url(#ch3-grad)" />
      <circle cx="13" cy="13" r="5.5" stroke="#FFFFFF" strokeWidth="2" />
      <path d="M17.2 17.2L22.5 22.5" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M10 11C11 9.8 13 9.8 14 11" stroke="#38BDF8" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="13" cy="13" r="1.5" fill="#FACC15" />
    </svg>
  );
}

function GoogleGeminiBrandIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gemini-grad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1B72E8" />
          <stop offset="35%" stopColor="#60A5FA" />
          <stop offset="70%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
      </defs>
      <path
        d="M16 2C16 9.73 9.73 16 2 16C9.73 16 16 22.27 16 30C16 22.27 22.27 16 30 16C22.27 16 16 9.73 16 2Z"
        fill="url(#gemini-grad)"
      />
      <path
        d="M25 3C25 4.66 23.66 6 22 6C23.66 6 25 7.34 25 9C25 7.34 26.34 6 28 6C26.34 6 25 4.66 25 3Z"
        fill="#38BDF8"
      />
    </svg>
  );
}

function Ed25519BrandIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ed-grad" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#059669" />
          <stop offset="1" stopColor="#047857" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="28" height="28" rx="7" fill="url(#ed-grad)" />
      <path
        d="M16 6L23 9.5V15C23 19.5 20 22.8 16 24.2C12 22.8 9 19.5 9 15V9.5L16 6Z"
        fill="#10B981"
        stroke="#A7F3D0"
        strokeWidth="1.2"
      />
      <circle cx="16" cy="12.5" r="2.2" fill="#FFFFFF" />
      <path d="M16 14.7V19" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      <path d="M14.5 17H17.5" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function DrizzleSqliteBrandIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sql-grad" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0284C7" />
          <stop offset="1" stopColor="#0369A1" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="28" height="28" rx="7" fill="url(#sql-grad)" />
      <ellipse cx="15" cy="8.5" rx="7.5" ry="3" fill="#E0F2FE" />
      <path d="M7.5 8.5V13.5C7.5 15.2 10.8 16.5 15 16.5C19.2 16.5 22.5 15.2 22.5 13.5V8.5" stroke="#E0F2FE" strokeWidth="1.6" fill="none" />
      <path d="M7.5 13.5V18.5C7.5 20.2 10.8 21.5 15 21.5C19.2 21.5 22.5 20.2 22.5 18.5V13.5" stroke="#E0F2FE" strokeWidth="1.6" fill="none" />
      <path
        d="M23 15C23 18.2 20.5 20.5 18 20.5C15.5 20.5 16 17.8 19 12C22.2 15 23 15 23 15Z"
        fill="#FACC15"
        stroke="#EAB308"
        strokeWidth="1"
      />
    </svg>
  );
}

const partnerIntegrations = [
  {
    name: "PayPal Server SDK",
    desc: "Official Server SDK Order Capture",
    Icon: PayPalBrandIcon,
    iconBg: "bg-blue-50/70 border-blue-100",
    hoverBorder: "hover:border-blue-300",
  },
  {
    name: "APIMatic",
    desc: "ContextMatic & OpenAPI 3.1 Spec",
    Icon: APIMaticBrandIcon,
    iconBg: "bg-indigo-50/70 border-indigo-100",
    hoverBorder: "hover:border-indigo-300",
  },
  {
    name: "Channel3 Search",
    desc: "Live web e-commerce product index",
    Icon: Channel3BrandIcon,
    iconBg: "bg-purple-50/70 border-purple-100",
    hoverBorder: "hover:border-purple-300",
  },
  {
    name: "Google Gemini AI",
    desc: "Autonomous tool calling & parsing",
    Icon: GoogleGeminiBrandIcon,
    iconBg: "bg-pink-50/70 border-pink-100",
    hoverBorder: "hover:border-pink-300",
  },
  {
    name: "Ed25519 Signing",
    desc: "Node crypto Intent Proofs",
    Icon: Ed25519BrandIcon,
    iconBg: "bg-emerald-50/70 border-emerald-100",
    hoverBorder: "hover:border-emerald-300",
  },
  {
    name: "Drizzle + SQLite",
    desc: "Immutable audit telemetry ledger",
    Icon: DrizzleSqliteBrandIcon,
    iconBg: "bg-sky-50/70 border-sky-100",
    hoverBorder: "hover:border-sky-300",
  },
];

export function LandingPage({ onEnterApp, onExploreScenario, onOpenSelector }: LandingPageProps) {
  const securityPillars = [
    {
      icon: ShieldAlert,
      title: "Prompt Injection Firewall",
      color: "text-red-600 bg-red-50 border-red-200",
      description:
        "Malicious sellers hide zero-width unicode or hidden CSS directives to trick agents into buying $200 warranties or gift cards. SentinelPay strips and quotes hostile payloads before payment.",
    },
    {
      icon: Ban,
      title: "Zero Subscription Lock",
      color: "text-amber-600 bg-amber-50 border-amber-200",
      description:
        "Recurring memberships, auto-renewals, and negative-option billings are deterministically rejected. Autonomous agents are mathematically prohibited from committing to recurring charges.",
    },
    {
      icon: DollarSign,
      title: "Deterministic Spending Cap",
      color: "text-[#2563EB] bg-blue-50 border-blue-200",
      description:
        "Prompts are not limits. Agents can be persuaded to overspend. SentinelPay recalculates prices strictly from trusted catalog data and blocks checkouts that exceed the signed cap.",
    },
    {
      icon: Lock,
      title: "Ed25519 Intent Proofs",
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
      description:
        "Every approved transaction generates an immutable cryptographic signature binding the human mandate, proposed cart, and PayPal Order ID for complete auditability.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Human Intent Mandate",
      desc: "User inputs natural language ('Buy headphones under $150, no subscriptions'). A structured AP2 policy is signed with Ed25519.",
    },
    {
      number: "02",
      title: "Untrusted Agent Search",
      desc: "Autonomous LLM searches live web products via Channel3. The agent has zero access to payment credentials or PayPal tokens.",
    },
    {
      number: "03",
      title: "Deterministic Policy Gate",
      desc: "Outside the model, 11 hard/soft rules evaluate prices, categories, and merchants, while a dual-layer scanner intercepts injections.",
    },
    {
      number: "04",
      title: "PayPal Settlement",
      desc: "Only on a verified PASS does the Payment Executor invoke @paypal/paypal-server-sdk to create and capture the sandbox order.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <SentinelLogo size="md" />

          <div className="flex items-center gap-2.5">
            {onOpenSelector && (
              <button
                onClick={onOpenSelector}
                className="cursor-pointer inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-all shadow-2xs"
              >
                <span>Portal Selector</span>
              </button>
            )}

            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              PayPal Sandbox Live
            </span>
            <button
              onClick={onEnterApp}
              className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-[#2563EB] hover:bg-blue-700 px-5 py-2 text-xs font-semibold text-white shadow-xs transition-all active:scale-[0.98]"
            >
              <span>Launch Live Dashboard</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-24 border-b border-gray-200/70 bg-gradient-to-b from-white via-white to-gray-50/50">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          {/* Tag Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-4 py-1 text-xs font-semibold text-[#2563EB] shadow-2xs mb-6">
            <span className="flex h-2 w-2 rounded-full bg-[#2563EB]" />
            <span>Built for PayPal AI Hackathon 2026 &bull; AP2 Protocol Implementation</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl font-extrabold tracking-tight text-[#0F172A] sm:text-5xl lg:text-6xl max-w-4xl mx-auto leading-tight">
            The Security Layer for Autonomous AI Commerce on{" "}
            <span className="text-[#2563EB]">PayPal</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            People want AI agents to shop for them, but cannot trust agents with payment credentials.
            SentinelPay enforces cryptographically signed <strong>AP2 Intent Mandates</strong> and an external
            deterministic <strong>Policy Gate</strong> before any PayPal order is created or settled.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <button
              onClick={onEnterApp}
              className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-[#2563EB] hover:bg-blue-700 px-7 py-3 text-sm font-semibold text-white shadow-xs transition-all active:scale-[0.98]"
            >
              <span>Enter Security Platform</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                onEnterApp();
                onExploreScenario?.("compromised");
              }}
              className="cursor-pointer inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 hover:border-gray-400 transition-all active:scale-[0.98]"
            >
              <ShieldAlert className="h-4 w-4 text-red-600" />
              <span>Test Prompt Injection Defense</span>
            </button>
          </div>

          {/* Quick Stats Badges */}
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 max-w-3xl mx-auto text-left">
            <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Policy Checks</span>
              <div className="text-lg font-bold text-gray-900 mt-0.5">11 Pure Rules</div>
              <span className="text-[11px] text-gray-500">Zero model hallucinations</span>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Payment Access</span>
              <div className="text-lg font-bold text-[#2563EB] mt-0.5">0 Credentials</div>
              <span className="text-[11px] text-gray-500">Agent completely isolated</span>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Injections Blocked</span>
              <div className="text-lg font-bold text-red-600 mt-0.5">100% Caught</div>
              <span className="text-[11px] text-gray-500">Zero-width & hidden CSS</span>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Auditability</span>
              <div className="text-lg font-bold text-emerald-600 mt-0.5">Ed25519</div>
              <span className="text-[11px] text-gray-500">Immutable Intent Proofs</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Process Section */}
      <section className="py-16 sm:py-20 bg-white border-b border-gray-200/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">End-to-End Workflow</span>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 mt-2">
              How SentinelPay Protects Autonomous Purchases
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              Spending limits cannot live inside the model&apos;s system prompt. They must be enforced by deterministic code holding the payment credentials.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((st, i) => (
              <div
                key={i}
                className="relative rounded-2xl border border-gray-200 bg-gray-50/40 p-6 flex flex-col justify-between hover:border-blue-200 transition-all hover:bg-white shadow-2xs"
              >
                <div>
                  <span className="font-mono text-2xl font-black text-[#2563EB]/30">{st.number}</span>
                  <h3 className="text-base font-bold text-gray-900 mt-2">{st.title}</h3>
                  <p className="text-xs text-gray-600 mt-2 leading-relaxed">{st.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center text-[11px] font-semibold text-[#2563EB]">
                  <span>AP2 Phase {i + 1}</span>
                  <ChevronRight className="h-3.5 w-3.5 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4 Core Security Pillars */}
      <section className="py-16 sm:py-20 bg-[#F8FAFC] border-b border-gray-200/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">Guardrail Architecture</span>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 mt-2">
              The 4 Hard Barriers
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              Engineered outside the AI inference loop to prevent malicious merchant attacks and runaway agent spending.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {securityPillars.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-2xs space-y-3 hover:border-gray-300 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${p.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900">{p.title}</h3>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{p.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tech Stack & Sponsor Ecosystem */}
      <section className="py-14 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Powered By Production Infrastructure &amp; Hackathon Partners</span>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 text-xs text-gray-600">
            {partnerIntegrations.map((p) => {
              const IconComponent = p.Icon;
              return (
                <div
                  key={p.name}
                  className={`group flex flex-col items-center text-center rounded-2xl border border-gray-200/80 bg-white p-4 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 ${p.hoverBorder}`}
                >
                  <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl border ${p.iconBg} group-hover:scale-110 transition-transform duration-200 shadow-2xs`}>
                    <IconComponent className="w-7 h-7" />
                  </div>
                  <strong className="block text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {p.name}
                  </strong>
                  <span className="mt-1 text-[11px] text-gray-500 leading-snug">
                    {p.desc}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-10">
            <button
              onClick={onEnterApp}
              className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-[#2563EB] px-8 py-3.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition-all active:scale-[0.98]"
            >
              <span>Explore Live Platform & Demo</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-8 text-center text-xs text-gray-500">
        <p>SentinelPay &bull; Open-source under MIT License &bull; Built for PayPal AI Hackathon 2026</p>
      </footer>
    </div>
  );
}
