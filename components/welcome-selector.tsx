"use client";

import React from "react";
import { SentinelLogo } from "./sentinel-logo";
import {
  Shield,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";

interface WelcomeSelectorProps {
  onSelectStory: () => void;
  onSelectShopper: () => void;
  onSelectAdmin: () => void;
  onRunScenario?: (scenario: string) => void;
}

export function WelcomeSelector({
  onSelectStory,
  onSelectShopper,
  onSelectAdmin,
  onRunScenario,
}: WelcomeSelectorProps) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 selection:bg-blue-100 selection:text-blue-900 flex flex-col justify-between">
      {/* Top Brand Bar */}
      <header className="border-b border-gray-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <SentinelLogo size="md" />

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              PayPal Sandbox Live
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-[#2563EB]">
              AP2 Protocol Active
            </span>
          </div>
        </div>
      </header>

      {/* Main Hero & Selector Area */}
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 flex-1 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-semibold text-[#2563EB] mb-3 shadow-2xs">
            <Shield className="h-3.5 w-3.5 text-[#2563EB]" />
            <span>PayPal AI Hackathon 2026 &bull; Official Submission</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-5xl leading-tight">
            Select Your Evaluation Experience
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
            SentinelPay is the financial security gateway for autonomous AI shopping agents transacting on PayPal. Choose how you would like to explore the platform:
          </p>
        </div>

        {/* The 3 Choice Cards Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 max-w-6xl mx-auto w-full">
          {/* Card 1: Consumer Shopper Mode */}
          <div
            onClick={onSelectShopper}
            className="group relative flex flex-col justify-between rounded-3xl border border-gray-200/90 bg-white p-6 shadow-xs hover:border-blue-400 hover:shadow-md transition-all duration-200 cursor-pointer text-left"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#2563EB] group-hover:scale-105 transition-transform">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[10px] font-bold text-[#2563EB]">
                  Shopper Mode
                </span>
              </div>

              <h2 className="text-lg font-bold tracking-tight text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                Customer Shopping Experience
              </h2>
              <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                Experience how an everyday buyer uses AI shopping agents safely on PayPal with zero credential exposure and strict budget caps.
              </p>

              <div className="mt-5 space-y-2.5 border-t border-gray-100 pt-4 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <span className="text-[#2563EB] font-bold">&bull;</span>
                  <span><strong>AI Shopping Assistant:</strong> Natural language intent</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">&bull;</span>
                  <span><strong>AP2 Shopper Shield:</strong> $250.00 daily safety cap</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-500 font-bold">&bull;</span>
                  <span><strong>1-Click Sign-Off:</strong> Human review for orders &gt;$50</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#2563EB] group-hover:translate-x-1 transition-transform">
              <span>Launch Shopper Mode</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>

          {/* Card 2: Enterprise Security Operations Console */}
          <div
            onClick={onSelectAdmin}
            className="group relative flex flex-col justify-between rounded-3xl border-2 border-[#2563EB] bg-gradient-to-b from-blue-50/50 via-white to-white p-6 shadow-md shadow-blue-500/10 hover:shadow-lg transition-all duration-200 cursor-pointer text-left"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2563EB] text-white shadow-xs group-hover:scale-105 transition-transform">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-blue-100 border border-blue-200 px-2.5 py-0.5 text-[10px] font-bold text-[#2563EB]">
                  ⭐ Judge Recommended
                </span>
              </div>

              <h2 className="text-lg font-bold tracking-tight text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                Enterprise Security Console
              </h2>
              <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                Full enterprise security console: 11-rule deterministic Policy Gate, Prompt Injection scanner, and Ed25519 cryptographic enclave.
              </p>

              <div className="mt-5 space-y-2.5 border-t border-gray-100 pt-4 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">&bull;</span>
                  <span><strong>11 Deterministic Rules:</strong> Zero credential leaks</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-500 font-bold">&bull;</span>
                  <span><strong>Injection Scanner:</strong> Real-time attack quarantine</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#2563EB] font-bold">&bull;</span>
                  <span><strong>Hardware Enclave:</strong> Ed25519 keys &amp; SQLite audit</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-white bg-[#2563EB] px-4 py-2.5 rounded-xl shadow-xs group-hover:bg-blue-700 transition-colors">
              <span>Launch Security Console</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>

          {/* Card 3: Product Story & Architecture */}
          <div
            onClick={onSelectStory}
            className="group relative flex flex-col justify-between rounded-3xl border border-gray-200/90 bg-white p-6 shadow-xs hover:border-blue-400 hover:shadow-md transition-all duration-200 cursor-pointer text-left"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 group-hover:scale-105 transition-transform">
                  <BookOpen className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-gray-100 border border-gray-200 px-2.5 py-0.5 text-[10px] font-semibold text-gray-600">
                  Architecture &amp; Pitch
                </span>
              </div>

              <h2 className="text-lg font-bold tracking-tight text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                Product Story &amp; Architecture
              </h2>
              <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                Review the core security dilemma: why autonomous agents cannot hold payment credentials and how AP2 solves it.
              </p>

              <div className="mt-5 space-y-2.5 border-t border-gray-100 pt-4 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <span className="text-indigo-500 font-bold">&bull;</span>
                  <span><strong>The Dilemma:</strong> Why LLMs fail on money</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#2563EB] font-bold">&bull;</span>
                  <span><strong>Google AP2 Protocol:</strong> 4-stage pipeline</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 font-bold">&bull;</span>
                  <span><strong>Hackathon Pitch:</strong> 3-min video script &amp; vision</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#2563EB] group-hover:translate-x-1 transition-transform">
              <span>Explore Product Story</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Quick Test Scenario Launch Bar */}
        <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-4 shadow-2xs max-w-6xl mx-auto w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-gray-700">Quick Test Scenarios:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                onRunScenario?.("compromised");
              }}
              className="cursor-pointer inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50/80 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 transition-all active:scale-[0.98]"
            >
              <ShieldAlert className="h-3.5 w-3.5 text-red-600" />
              <span>Prompt Injection Attack</span>
            </button>
            <button
              onClick={() => {
                onRunScenario?.("over_budget");
              }}
              className="cursor-pointer inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50/80 px-3 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition-all active:scale-[0.98]"
            >
              <span>Budget Cap Breach</span>
            </button>
            <button
              onClick={() => {
                onRunScenario?.("honest");
              }}
              className="cursor-pointer inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-all active:scale-[0.98]"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Compliant Agent Run</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200/80 bg-white py-4 text-center text-xs text-gray-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SentinelPay &bull; Built for PayPal AI Hackathon 2026</span>
          <div className="flex flex-wrap items-center justify-center gap-3 text-gray-500 font-medium text-[11px]">
            <span className="text-gray-700 font-semibold">PayPal Server SDK</span>
            <span>&bull;</span>
            <span className="text-gray-700 font-semibold">APIMatic ContextMatic</span>
            <span>&bull;</span>
            <span className="text-gray-700 font-semibold">Channel3 API</span>
            <span>&bull;</span>
            <span className="text-gray-700 font-semibold">Google Gemini</span>
            <span>&bull;</span>
            <span className="text-gray-700 font-semibold">Ed25519 Enclave</span>
            <span>&bull;</span>
            <span className="text-gray-700 font-semibold">Drizzle + SQLite</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
