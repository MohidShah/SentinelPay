"use client";

import React, { useState } from "react";
import {
  X,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Copy,
  Check,
  Cpu,
  Receipt,
} from "lucide-react";
import type { TransactionRecord } from "@/lib/transactions/types";

interface TransactionDetailsModalProps {
  transaction: TransactionRecord | null;
  onClose: () => void;
}

export function TransactionDetailsModal({ transaction, onClose }: TransactionDetailsModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [verifyingProof, setVerifyingProof] = useState(false);
  const [proofVerificationResult, setProofVerificationResult] = useState<{
    valid?: boolean;
    error?: string;
  } | null>(null);

  if (!transaction) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const verifySignature = async () => {
    if (!transaction.proofId) return;
    setVerifyingProof(true);
    setProofVerificationResult(null);
    try {
      const res = await fetch(`/api/proofs/${transaction.proofId}/verify`, { method: "POST" });
      const data = await res.json();
      setProofVerificationResult({
        valid: data.valid,
        error: data.error,
      });
    } catch {
      setProofVerificationResult({
        valid: false,
        error: "Failed to connect to verification API",
      });
    } finally {
      setVerifyingProof(false);
    }
  };

  const isBlocked = transaction.status === "BLOCKED";
  const isApproved = transaction.status === "APPROVED" || transaction.status === "CAPTURED";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-xs">
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden animate-rise">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                isApproved
                  ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                  : isBlocked
                  ? "bg-red-50 text-red-600 border-red-200"
                  : "bg-amber-50 text-amber-600 border-amber-200"
              }`}
            >
              {isApproved ? (
                <ShieldCheck className="h-5 w-5" />
              ) : isBlocked ? (
                <ShieldAlert className="h-5 w-5" />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">Transaction Security Audit</h2>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                    isApproved
                      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                      : isBlocked
                      ? "bg-red-100 text-red-800 border-red-200"
                      : "bg-amber-100 text-amber-800 border-amber-200"
                  }`}
                >
                  {transaction.status}
                </span>
              </div>
              <p className="text-xs font-mono text-gray-500">{transaction.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 space-y-6 overflow-y-auto p-6 text-sm">
          {/* Key Financial Snapshot */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-3">
              <span className="text-[11px] font-medium text-gray-500">Total Amount</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-bold text-gray-900">${transaction.amount}</span>
                <span className="text-xs text-gray-500">{transaction.currency}</span>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-3">
              <span className="text-[11px] font-medium text-gray-500">Merchant / Destination</span>
              <div className="mt-1 truncate text-sm font-semibold text-gray-900">
                {transaction.merchant}
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-3">
              <span className="text-[11px] font-medium text-gray-500">Security Risk Score</span>
              <div className="mt-1 flex items-center gap-1.5">
                <div
                  className={`h-2.5 w-2.5 rounded-full ${
                    transaction.riskScore < 0.2
                      ? "bg-emerald-500"
                      : transaction.riskScore < 0.7
                      ? "bg-amber-500"
                      : "bg-red-500"
                  }`}
                />
                <span className="text-sm font-bold text-gray-900">
                  {Math.round(transaction.riskScore * 100)}%
                </span>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-3">
              <span className="text-[11px] font-medium text-gray-500">Created Timestamp</span>
              <div className="mt-1 truncate text-xs font-medium text-gray-700">
                {new Date(transaction.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </div>
            </div>
          </div>

          {/* AI Agent Context */}
          <div className="rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
              <Cpu className="h-4 w-4 text-blue-600" />
              Agent Context & Natural Language Intent
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Executing Agent:</span>
                <span className="font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">
                  {transaction.agent}
                </span>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-700 border border-gray-100 italic">
                &ldquo;{transaction.prompt}&rdquo;
              </div>
            </div>
          </div>

          {/* Items Proposed for Purchase */}
          <div className="rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
              <Receipt className="h-4 w-4 text-blue-600" />
              Proposed Cart Items ({transaction.items.length})
            </div>
            <div className="divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
              {transaction.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white hover:bg-gray-50/50">
                  <div>
                    <div className="font-medium text-xs text-gray-900">{item.title}</div>
                    <div className="text-[11px] text-gray-400">
                      ID: {item.productId} &bull; Merchant: {item.merchant}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-xs text-gray-900">${item.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prompt Injection Firewall Analysis */}
          <div
            className={`rounded-xl border p-4 ${
              transaction.injection.detected
                ? "border-red-200 bg-red-50/30"
                : "border-gray-200 bg-gray-50/30"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700">
                <ShieldAlert
                  className={`h-4 w-4 ${
                    transaction.injection.detected ? "text-red-600" : "text-emerald-600"
                  }`}
                />
                Prompt Injection Firewall Radar
              </div>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                  transaction.injection.detected
                    ? "bg-red-100 text-red-800 border-red-200"
                    : "bg-emerald-100 text-emerald-800 border-emerald-200"
                }`}
              >
                {transaction.injection.detected
                  ? `Hostile Injections Flagged (${Math.round(transaction.injection.confidence * 100)}% Conf)`
                  : "No Prompt Injection Detected"}
              </span>
            </div>

            {transaction.injection.detected ? (
              <div className="space-y-2 mt-3 text-xs">
                <div className="text-red-700 font-medium">Evidence patterns identified:</div>
                <ul className="list-disc pl-5 space-y-1 text-red-600 text-xs">
                  {transaction.injection.evidence.map((ev, i) => (
                    <li key={i}>{ev}</li>
                  ))}
                </ul>
                {transaction.injection.quotedPayload && (
                  <div className="mt-2 rounded-lg bg-red-100/70 p-3 font-mono text-[11px] text-red-900 border border-red-200">
                    <div className="text-[10px] font-bold text-red-700 uppercase mb-1">
                      Quoted Hostile Injected String Caught in DOM:
                    </div>
                    {transaction.injection.quotedPayload}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-500 mt-1">
                Zero-width unicode scanners, hidden CSS tags, and role-override heuristic filters
                reported clean payload integrity across all scanned source pages.
              </p>
            )}
          </div>

          {/* 11-Rule Deterministic Policy Evaluation Breakdown */}
          <div className="rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                11-Rule Policy Compliance Evaluation
              </div>
              <span className="text-[11px] text-gray-400">Zero Hallucination Policy Gate</span>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {transaction.rulesEvaluated.map((r, idx) => (
                <div
                  key={idx}
                  className={`flex items-start justify-between rounded-lg p-2.5 text-xs border ${
                    r.passed
                      ? "bg-emerald-50/50 border-emerald-100 text-emerald-950"
                      : "bg-red-50/50 border-red-100 text-red-950"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {r.passed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <X className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-mono font-semibold">{r.rule}</span>
                      <p className="text-[11px] text-gray-600 mt-0.5">{r.detail}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${
                      r.severity === "hard"
                        ? "bg-gray-100 text-gray-700 border-gray-200"
                        : "bg-amber-100 text-amber-800 border-amber-200"
                    }`}
                  >
                    {r.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Cryptographic Intent Proof & PayPal Sandbox Status */}
          <div className="rounded-xl border border-gray-200 p-4 bg-gray-50/40">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700">
                <Lock className="h-4 w-4 text-blue-600" />
                Cryptographic Intent Proof & PayPal Handoff
              </div>
              {transaction.proofId && (
                <button
                  onClick={verifySignature}
                  disabled={verifyingProof}
                  className="cursor-pointer rounded-full bg-[#2563EB] px-3.5 py-1 text-xs font-semibold text-white hover:bg-blue-700 transition-all shadow-2xs disabled:opacity-50"
                >
                  {verifyingProof ? "Verifying..." : "Verify Ed25519 Signature"}
                </button>
              )}
            </div>

            {proofVerificationResult && (
              <div
                className={`mb-3 rounded-lg p-2.5 text-xs font-medium border ${
                  proofVerificationResult.valid
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-red-50 text-red-800 border-red-200"
                }`}
              >
                {proofVerificationResult.valid
                  ? "✓ Cryptographic Proof Validated: SHA-256 hash & Ed25519 signature match canonical mandate."
                  : `✗ Verification Failed: ${proofVerificationResult.error}`}
              </div>
            )}

            <div className="space-y-2 text-xs">
              {transaction.paypalOrderId && (
                <div className="flex items-center justify-between rounded-lg bg-white p-2.5 border border-gray-200">
                  <span className="text-gray-500">PayPal Order ID:</span>
                  <div className="flex items-center gap-1.5 font-mono text-gray-900 font-semibold">
                    <span>{transaction.paypalOrderId}</span>
                    <button
                      onClick={() => copyToClipboard(transaction.paypalOrderId!, "paypal")}
                      className="text-gray-400 hover:text-gray-700"
                    >
                      {copiedKey === "paypal" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              )}

              {transaction.proofHash && (
                <div className="flex items-center justify-between rounded-lg bg-white p-2.5 border border-gray-200">
                  <span className="text-gray-500">Canonical SHA-256 Hash:</span>
                  <div className="flex items-center gap-1.5 font-mono text-gray-900 text-[11px]">
                    <span className="truncate max-w-[280px]">{transaction.proofHash}</span>
                    <button
                      onClick={() => copyToClipboard(transaction.proofHash!, "hash")}
                      className="text-gray-400 hover:text-gray-700"
                    >
                      {copiedKey === "hash" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              )}

              {transaction.signature && (
                <div className="flex items-center justify-between rounded-lg bg-white p-2.5 border border-gray-200">
                  <span className="text-gray-500">Ed25519 Proof Signature:</span>
                  <div className="flex items-center gap-1.5 font-mono text-gray-900 text-[11px]">
                    <span className="truncate max-w-[280px]">{transaction.signature}</span>
                    <button
                      onClick={() => copyToClipboard(transaction.signature!, "sig")}
                      className="text-gray-400 hover:text-gray-700"
                    >
                      {copiedKey === "sig" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end border-t border-gray-200 bg-gray-50/50 px-6 py-3.5">
          <button
            onClick={onClose}
            className="cursor-pointer rounded-full bg-white px-5 py-2 text-xs font-semibold text-gray-700 border border-gray-300 hover:bg-gray-100 transition-all shadow-2xs active:scale-[0.98]"
          >
            Close Audit View
          </button>
        </div>
      </div>
    </div>
  );
}
