"use client";

import React, { useState, useEffect } from "react";
import {
  Scale,
  Lock,
  DollarSign,
  Ban,
  RefreshCw,
  Tag,
  Store,
} from "lucide-react";

type MandateItem = {
  id: string;
  userPrompt: string;
  body: {
    maxTotal?: { value: string; currency: string };
    allowedCategories?: string[];
    allowedMerchants?: string[];
    maxQuantity?: number;
    allowRecurring?: boolean;
    expiresAt?: string;
  };
  status: string;
  signature?: string;
  createdAt: string;
};

export function PoliciesView() {
  const [mandates, setMandates] = useState<MandateItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMandates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/mandates", { cache: "no-store" });
      const data = await res.json();
      setMandates(data.mandates || []);
    } catch (e) {
      console.error("Failed to load mandates", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMandates();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Policies & Spending Limits</h1>
          <p className="text-xs text-gray-500">
            AP2 Intent Mandates and active enterprise policy constraints enforced on all autonomous agents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadMandates}
            disabled={loading}
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 active:scale-[0.98] transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Mandates
          </button>
        </div>
      </div>

      {/* Enterprise Policy Guarantees Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
            <Ban className="h-4 w-4 text-red-600" />
            Zero Subscription Lock
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Autonomous agents are mathematically prohibited from creating recurring payments, auto-renewals, or monthly subscriptions.
          </p>
          <div className="pt-2 text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 inline-block">
            allowRecurring: false (Enforced)
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
            <DollarSign className="h-4 w-4 text-blue-600" />
            Deterministic Spending Cap
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Total payment order amount is verified against the signed AP2 mandate maxTotal ceiling using trusted catalog prices only.
          </p>
          <div className="pt-2 text-[10px] font-mono text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200 inline-block">
            Catalog Total &le; Signed Cap
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
            <Lock className="h-4 w-4 text-indigo-600" />
            Ed25519 Cryptographic Proofs
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Every approved transaction receives an immutable Ed25519 signature binding the human mandate, proposed cart, and PayPal order ID.
          </p>
          <div className="pt-2 text-[10px] font-mono text-indigo-700 bg-indigo-50 px-2 py-1 rounded border border-indigo-200 inline-block">
            Ed25519 + Canonical SHA-256
          </div>
        </div>
      </div>

      {/* Active AP2 Intent Mandates Ledger */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-gray-200 px-5 py-4 bg-gray-50/50 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Active AP2 Intent Mandates</h2>
            <p className="text-xs text-gray-400">Cryptographically signed user intent policies</p>
          </div>
          <span className="text-xs font-semibold text-gray-600">
            {mandates.length} Registered Mandate(s)
          </span>
        </div>

        {mandates.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Scale className="mx-auto h-8 w-8 mb-2 opacity-40" />
            No mandates registered in database yet. Create one via the Shopping Assistant!
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {mandates.map((m) => {
              const body = m.body || {};
              const cap = body.maxTotal?.value || "100.00";
              const categories = body.allowedCategories || ["General Products"];
              const merchants = body.allowedMerchants || ["All verified retailers"];
              const expiresAt = body.expiresAt ? new Date(body.expiresAt).toLocaleDateString() : "Valid";

              return (
                <div key={m.id} className="p-5 hover:bg-gray-50/50 transition-colors space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-gray-900">{m.id}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                          m.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-gray-100 text-gray-600 border-gray-200"
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Cap Limit:</span>
                      <span className="font-bold text-sm text-gray-900">${cap} USD</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-700 font-medium italic bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                    &ldquo;{m.userPrompt}&rdquo;
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5 text-gray-400" />
                      <span>
                        Categories: <strong>{categories.join(", ")}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Store className="h-3.5 w-3.5 text-gray-400" />
                      <span>
                        Merchants: <strong>{merchants.join(", ")}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5 text-gray-400" />
                      <span>
                        Recurring: <strong>Forbidden</strong> &bull; Expires: <strong>{expiresAt}</strong>
                      </span>
                    </div>
                  </div>

                  {m.signature && (
                    <div className="text-[10px] font-mono text-gray-400 truncate max-w-lg">
                      Signature: {m.signature}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
