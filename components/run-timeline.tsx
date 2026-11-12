"use client";

import React from "react";
import { Bot, Terminal, Search, ShoppingBag, ShieldCheck, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import type { AgentStep } from "@/lib/agent/types";
import { Card, Spinner } from "./ui";

export type TimelineItem = AgentStep | { type: "gate_checking" } | { type: "error"; message: string };

export function RunTimeline({ items, running }: { items: TimelineItem[]; running: boolean }) {
  const hasProposed = items.some((i) => i.type === "proposed");
  const hasGateCheck = items.some((i) => i.type === "gate_checking");
  const hasError = items.some((i) => i.type === "error");

  return (
    <Card className="overflow-hidden border border-gray-200 bg-white shadow-xs space-y-0">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50/70 px-5 py-3.5 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB] border border-blue-100 shadow-2xs">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-900 uppercase tracking-wider block">
              Autonomous Agent Execution
            </span>
            <span className="text-[10px] text-gray-400">Untrusted Zone &bull; Zero Payment Credential Access</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {running ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold text-[#2563EB]">
              <span className="h-2 w-2 rounded-full bg-[#2563EB] animate-pulse" />
              Live Execution
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-800">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              Execution Complete
            </span>
          )}
        </div>
      </div>

      {/* Visual Step Progress Indicator */}
      <div className="border-b border-gray-200 bg-white px-5 py-3 sm:px-6">
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="flex flex-col items-center">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2563EB] text-white text-[11px] font-bold shadow-2xs">
              ✓
            </div>
            <span className="text-[10px] font-medium text-gray-700 mt-1">1. Mandate Signed</span>
          </div>

          <div className="flex flex-col items-center">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                items.length > 0 ? "bg-[#2563EB] text-white" : "bg-gray-100 text-gray-400 border border-gray-200"
              }`}
            >
              2
            </div>
            <span className={`text-[10px] font-medium mt-1 ${items.length > 0 ? "text-[#2563EB] font-semibold" : "text-gray-400"}`}>
              2. Catalog Search
            </span>
          </div>

          <div className="flex flex-col items-center">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                hasGateCheck || hasProposed ? "bg-[#2563EB] text-white" : "bg-gray-100 text-gray-400 border border-gray-200"
              }`}
            >
              3
            </div>
            <span className={`text-[10px] font-medium mt-1 ${hasGateCheck || hasProposed ? "text-[#2563EB] font-semibold" : "text-gray-400"}`}>
              3. Policy Gate
            </span>
          </div>

          <div className="flex flex-col items-center">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                hasError
                  ? "bg-red-500 text-white"
                  : hasGateCheck && !running
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-400 border border-gray-200"
              }`}
            >
              {hasError ? "✗" : "4"}
            </div>
            <span className={`text-[10px] font-medium mt-1 ${hasGateCheck && !running ? "text-emerald-700 font-semibold" : "text-gray-400"}`}>
              4. PayPal Settlement
            </span>
          </div>
        </div>
      </div>

      {/* Streamed Timeline Rows */}
      <div className="p-5 sm:p-6 bg-gray-50/20">
        <ol className="relative space-y-4 border-l-2 border-gray-200 pl-5">
          {items.map((item, i) => (
            <li key={i} className="animate-rise relative">
              <span className={`absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-white ${dot(item)}`} />
              <Row item={item} />
            </li>
          ))}
          {running ? (
            <li className="relative flex items-center gap-2.5 text-xs text-gray-500">
              <span className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-[#2563EB] animate-pulse" />
              <Spinner className="text-[#2563EB]" />
              <span className="font-medium text-gray-700">Autonomous agent reasoning & querying product catalogs…</span>
            </li>
          ) : null}
        </ol>
      </div>
    </Card>
  );
}

function Row({ item }: { item: TimelineItem }) {
  switch (item.type) {
    case "thinking":
      return (
        <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2563EB]">
            <Terminal className="h-3.5 w-3.5" /> Agent Chain-of-Thought
          </div>
          <p className="mt-1 text-xs leading-relaxed text-gray-700">{item.message}</p>
        </div>
      );
    case "search":
      return (
        <div className="text-xs text-gray-700 flex items-center gap-1.5 flex-wrap">
          <Search className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-gray-500">Searching Channel3 index:</span>
          <span className="font-mono font-medium text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
            &ldquo;{item.query}&rdquo;
          </span>
          {item.maxPrice ? <span className="text-gray-500">(max ${item.maxPrice})</span> : null}
          <span className="ml-1 rounded-full bg-gray-100 border border-gray-200 px-2.5 py-0.5 text-[11px] text-gray-700 font-mono">
            {item.found} items found
          </span>
          {item.channel3Error ? (
            <div className="w-full mt-1.5 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs text-amber-800">
              Channel3 offline · using vetted partner catalog
            </div>
          ) : null}
        </div>
      );
    case "results":
      return (
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {item.products.slice(0, 6).map((p) => (
            <div
              key={p.productId}
              className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-3.5 hover:border-blue-200 transition-colors shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono">
                  <span className="truncate max-w-[120px]">{p.merchant}</span>
                  <span className="rounded bg-gray-100 px-1 text-[10px] text-gray-600">
                    {p.source === "fixture" ? "Partner" : "Channel3"}
                  </span>
                </div>
                <div className="mt-1 font-medium text-xs text-gray-900 line-clamp-2" title={p.title}>
                  {p.title}
                </div>
              </div>
              <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="font-mono text-xs font-bold text-emerald-700">${p.unitPrice.value}</span>
                <span className="text-[10px] text-gray-400 font-mono">{p.source}</span>
              </div>
            </div>
          ))}
        </div>
      );
    case "read_page":
      return (
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span className="text-gray-400">Inspecting merchant page:</span>
          <span className="font-mono text-gray-800 rounded bg-gray-100 px-2 py-0.5 border border-gray-200 text-[11px]">
            {shortUrl(item.url)}
          </span>
        </div>
      );
    case "proposed":
      return (
        <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-blue-900">
            <span className="flex items-center gap-1.5">
              <ShoppingBag className="h-4 w-4 text-[#2563EB]" /> Proposed Checkout Package
            </span>
            <span className="text-[11px] text-[#2563EB] font-medium">Ready for Gate Verification</span>
          </div>
          <div className="mt-2 text-xs text-gray-900 font-medium">
            {item.cart.items.map((i) => i.title).join(", ")}
          </div>
          {item.cart.extraFees.length ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {item.cart.extraFees.map((f) => (
                <span key={f.label} className="rounded bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 text-[11px]">
                  + {f.label}: ${f.amount}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      );
    case "gate_checking":
      return (
        <div className="flex items-center gap-2.5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-medium text-blue-900">
          <ShieldCheck className="h-4 w-4 text-[#2563EB]" />
          <span>Handoff to Trusted Zone: Sentinel Policy Gate verifying deterministic rules & injection scanner...</span>
          <ArrowRight className="h-3.5 w-3.5 text-blue-500 ml-auto" />
        </div>
      );
    case "error":
      return (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-800 font-medium flex items-center gap-2.5">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          <span>{item.message}</span>
        </div>
      );
  }
}

function dot(item: TimelineItem) {
  if (item.type === "error") return "bg-red-600 ring-2 ring-red-100";
  if (item.type === "gate_checking") return "bg-[#2563EB] ring-2 ring-blue-100";
  if (item.type === "proposed") return "bg-amber-500 ring-2 ring-amber-100";
  return "bg-gray-400";
}

function shortUrl(u: string) {
  try {
    const url = new URL(u);
    return url.hostname + (url.pathname.length > 1 ? url.pathname.slice(0, 24) : "");
  } catch {
    return u.slice(0, 40);
  }
}
