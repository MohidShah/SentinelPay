"use client";

import React from "react";
import {
  Cpu,
  Play,
  CheckCircle2,
} from "lucide-react";

interface AgentsViewProps {
  onLaunchAgent: (scenario: string) => void;
}

export function AgentsView({ onLaunchAgent }: AgentsViewProps) {
  const agents = [
    {
      id: "llm",
      name: "Google Gemini Live AI Agent",
      role: "Autonomous Real-World Shopping Assistant",
      model: "gemini-2.5-flash / channel3",
      status: "Active & Connected",
      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      indicator: "bg-emerald-500",
      riskTier: "Low (0.05)",
      riskColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
      description:
        "Full autonomous reasoning loop. Calls Channel3 API to search real live products across web retailers, parses specifications, and builds structured purchase carts.",
      permissions: [
        "Live Channel3 Search Enabled",
        "PayPal Sandbox Order Creation",
        "Deterministic Gate Validation",
        "Strict AP2 Mandate Conformance",
      ],
      defaultPrompt: "Buy me noise-canceling headphones under $150, rated well, no subscriptions.",
    },
    {
      id: "honest",
      name: "Honest Baseline Agent",
      role: "Compliant Reference Agent",
      model: "scripted:honest",
      status: "Verified Safe",
      statusColor: "bg-blue-50 text-blue-700 border-blue-200",
      indicator: "bg-blue-500",
      riskTier: "Clean (0.00)",
      riskColor: "text-blue-700 bg-blue-50 border-blue-200",
      description:
        "Deterministic benchmark agent. Consistently picks verified products from the trusted catalog that strictly adhere to all signed mandate rules.",
      permissions: [
        "Standard Catalog Resolution",
        "Zero Surcharge Guarantee",
        "Auto-Approval on Rule Pass",
      ],
      defaultPrompt: "Find a 100W USB-C GaN charger under $45, no recurring charges.",
    },
    {
      id: "compromised",
      name: "Poisoned Page Test Agent",
      role: "Adversarial Prompt Injection Simulation",
      model: "scripted:compromised",
      status: "Threat Detected / Blocked",
      statusColor: "bg-red-50 text-red-700 border-red-200",
      indicator: "bg-red-500",
      riskTier: "Critical (0.98)",
      riskColor: "text-red-700 bg-red-50 border-red-200",
      description:
        "Simulates an agent visiting a malicious seller webpage with zero-width invisible instructions or hidden CSS directives designed to hijack the cart.",
      permissions: [
        "Simulated Hostile Extraction",
        "Firewall Quoting Active",
        "Payment Access Denied by Policy Gate",
      ],
      defaultPrompt: "Buy me noise-canceling headphones under $150, rated well.",
    },
    {
      id: "over_budget",
      name: "Over-Budget Test Agent",
      role: "Spending Limit Violation Tester",
      model: "scripted:over_budget",
      status: "Cap Breach Blocked",
      statusColor: "bg-amber-50 text-amber-700 border-amber-200",
      indicator: "bg-amber-500",
      riskTier: "High (0.85)",
      riskColor: "text-amber-700 bg-amber-50 border-amber-200",
      description:
        "Attempts to propose premium items exceeding the signed AP2 mandate maxTotal ceiling to verify mathematical enforcement.",
      permissions: [
        "Catalog Item Resolution",
        "Strict Limit Enforcement",
        "Immediate Hard Block Trigger",
      ],
      defaultPrompt: "Find a wireless mechanical keyboard for my Mac, max $90.",
    },
    {
      id: "hidden_fee",
      name: "Hidden-Fee Test Agent",
      role: "Undisclosed Surcharge & Negative Option Tester",
      model: "scripted:hidden_fee",
      status: "Fee Anomaly Blocked",
      statusColor: "bg-purple-50 text-purple-700 border-purple-200",
      indicator: "bg-purple-500",
      riskTier: "Elevated (0.65)",
      riskColor: "text-purple-700 bg-purple-50 border-purple-200",
      description:
        "Purchases from an unscrupulous merchant that silently adds non-mandated handling fees or covert subscription sign-up flags.",
      permissions: [
        "Hidden Surcharge Inspection",
        "Zero-Fee Rule Enforcement",
        "Payment Capture Blocked",
      ],
      defaultPrompt: "Buy a waterproof travel backpack under $70, single purchase only.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">AI Agent Activity & Fleet Roster</h1>
          <p className="text-xs text-gray-500">
            Monitor, inspect, and benchmark autonomous AI shopping agents against SentinelPay guardrails
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-700">
            5 Fleet Profiles Configured
          </span>
        </div>
      </div>

      {/* Agents Roster Cards */}
      <div className="grid grid-cols-1 gap-5">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-xs hover:border-blue-200 transition-all sm:flex-row sm:items-center gap-6"
          >
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
                  <Cpu className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-900">{agent.name}</h3>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${agent.statusColor}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${agent.indicator}`} />
                      {agent.status}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-gray-400">{agent.role}</div>
                </div>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed max-w-3xl">
                {agent.description}
              </p>

              {/* Permissions & Security Flags */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {agent.permissions.map((perm, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1 text-[10px] font-medium text-gray-600 border border-gray-100"
                  >
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    {perm}
                  </span>
                ))}
              </div>
            </div>

            {/* Launch / Metrics Column */}
            <div className="flex flex-col items-start sm:items-end justify-between border-t border-gray-100 pt-3 sm:border-t-0 sm:pt-0 sm:border-l sm:pl-6 sm:border-gray-100 gap-3 min-w-[200px]">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400">Security Risk Rating</span>
                <div className="mt-0.5">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold border ${agent.riskColor}`}
                  >
                    {agent.riskTier}
                  </span>
                </div>
              </div>

              <button
                onClick={() => onLaunchAgent(agent.id)}
                className="cursor-pointer inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-[#2563EB] hover:bg-blue-700 px-5 py-2 text-xs font-semibold text-white shadow-xs transition-all active:scale-[0.98]"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                Launch Test Run
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
