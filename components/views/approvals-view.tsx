"use client";

import React, { useState, useEffect } from "react";
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Info,
} from "lucide-react";

type ApprovalItem = {
  id: string;
  mandateId: string;
  cart: {
    items?: { productId: string; title: string; merchant: string; unitPrice: { value: string } }[];
    extraFees?: { label: string; amount: string }[];
    agentReasoning?: string;
  };
  decision: {
    outcome: string;
    computedTotal: string;
    ruleResults?: { rule: string; passed: boolean; detail: string; severity: "hard" | "soft" }[];
    injection?: { detected: boolean; confidence: number; evidence: string[] };
  };
  status: "PENDING" | "APPROVED" | "DENIED";
  createdAt: string;
  resolvedAt?: string | null;
};

export function ApprovalsView({ persona = "shopper" }: { persona?: "shopper" | "admin" } = {}) {
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ id: string; message: string; success: boolean } | null>(null);

  const isShopper = persona === "shopper";

  const loadApprovals = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/approvals", { cache: "no-store" });
      const data = await res.json();
      setApprovals(data.approvals || []);
    } catch (e) {
      console.error("Failed to load approvals", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, []);

  const handleAction = async (id: string, action: "APPROVE" | "REJECT") => {
    setProcessingId(id);
    setActionFeedback(null);
    try {
      const res = await fetch(`/api/approvals/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionFeedback({
          id,
          message: action === "APPROVE" ? `Transaction approved! PayPal capture confirmed: ${data.orderId || "OK"}` : "Transaction rejected and permanently blocked.",
          success: true,
        });
        await loadApprovals();
      } else {
        setActionFeedback({
          id,
          message: data.error || "Failed to process approval action",
          success: false,
        });
      }
    } catch {
      setActionFeedback({
        id,
        message: "Network error processing action",
        success: false,
      });
    } finally {
      setProcessingId(null);
    }
  };

  const pendingApprovals = approvals.filter((a) => a.status === "PENDING");
  const resolvedApprovals = approvals.filter((a) => a.status !== "PENDING");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {isShopper ? "Orders Needing Your Sign-Off" : "Human Approval Center"}
            </h1>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                isShopper
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : "bg-slate-900 text-white border-slate-700"
              }`}
            >
              {isShopper ? "1-Click Approvals" : "Human-in-the-Loop"}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {isShopper
              ? "Orders selected by your shopping assistant that exceed $50 or have special notes. Give 1-click confirmation before PayPal settlement."
              : "Authorizations flagged by Policy Gate soft constraints requiring explicit human-in-the-loop sign-off"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadApprovals}
            disabled={loading}
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 active:scale-[0.98] transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-[#2563EB]" : ""}`} />
            {isShopper ? "Refresh Orders" : "Refresh Queue"}
          </button>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {actionFeedback && (
        <div
          className={`flex items-center justify-between rounded-xl p-4 text-xs font-medium border ${
            actionFeedback.success
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {actionFeedback.success ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <span>{actionFeedback.message}</span>
          </div>
        </div>
      )}

      {/* Pending Items Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <h2 className="text-sm font-bold text-gray-900">
              Pending Authorization Queue ({pendingApprovals.length})
            </h2>
          </div>
        </div>

        {pendingApprovals.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center">
            <UserCheck className="mx-auto h-10 w-10 text-gray-300 mb-3" />
            <h3 className="text-sm font-semibold text-gray-900">All caught up!</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              There are currently no transactions waiting for human authorization. Any transactions flagged with soft policy warnings will queue here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingApprovals.map((appr) => {
              const softFails = (appr.decision.ruleResults || []).filter((r) => !r.passed);
              const items = appr.cart.items || [];
              const isBusy = processingId === appr.id;

              return (
                <div
                  key={appr.id}
                  className="rounded-xl border border-amber-200 bg-white p-6 shadow-sm space-y-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-gray-900">{appr.id}</span>
                          <span className="rounded-full bg-amber-100 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                            Awaiting Authorization
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-400">
                          Mandate: {appr.mandateId} &bull; Received {new Date(appr.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900">
                        ${appr.decision.computedTotal}
                      </div>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold">USD Total</span>
                    </div>
                  </div>

                  {/* Why Approval is Required */}
                  <div className="rounded-lg bg-amber-50/60 p-3.5 border border-amber-100">
                    <div className="text-xs font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                      <Info className="h-3.5 w-3.5 text-amber-600" />
                      Why Human Approval is Required:
                    </div>
                    {softFails.length > 0 ? (
                      <ul className="list-disc pl-5 text-xs text-amber-800 space-y-1">
                        {softFails.map((f, idx) => (
                          <li key={idx}>
                            <strong>{f.rule}</strong>: {f.detail}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-amber-800">
                        Transaction exceeds typical autonomous spending velocity limits or requires confirmation for external merchant checkout.
                      </p>
                    )}
                  </div>

                  {/* Proposed Items in Cart */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                      Cart Contents ({items.length} items)
                    </span>
                    <div className="divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
                      {items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50/30 text-xs">
                          <div>
                            <span className="font-medium text-gray-900">{item.title}</span>
                            <div className="text-[10px] text-gray-400">
                              Merchant: {item.merchant} &bull; ID: {item.productId}
                            </div>
                          </div>
                          <span className="font-bold text-gray-900">${item.unitPrice.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => handleAction(appr.id, "REJECT")}
                      disabled={isBusy}
                      className="cursor-pointer rounded-full border border-red-200 bg-white px-5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-all shadow-2xs disabled:opacity-50 active:scale-[0.98]"
                    >
                      Reject & Block
                    </button>
                    <button
                      onClick={() => handleAction(appr.id, "APPROVE")}
                      disabled={isBusy}
                      className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-[#2563EB] hover:bg-blue-700 px-6 py-2.5 text-xs font-semibold text-white transition-all shadow-xs disabled:opacity-50 active:scale-[0.98]"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {isBusy ? "Processing PayPal Capture..." : "Authorize & Capture Payment"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Historical Resolved Approvals */}
      {resolvedApprovals.length > 0 && (
        <div className="mt-8 space-y-4">
          <h2 className="text-sm font-bold text-gray-900">Past Human Decisions History</h2>
          <div className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden">
            <div className="divide-y divide-gray-100">
              {resolvedApprovals.map((appr) => (
                <div key={appr.id} className="flex items-center justify-between p-4 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-gray-900">{appr.id}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                          appr.status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {appr.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Resolved {appr.resolvedAt ? new Date(appr.resolvedAt).toLocaleString() : "Recently"}
                    </p>
                  </div>
                  <div className="text-right font-bold text-gray-900">
                    ${appr.decision.computedTotal} USD
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
