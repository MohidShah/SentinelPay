"use client";

import { CheckCircle2, AlertTriangle, ShieldCheck, Lock, Clock, Tag, ShoppingBag } from "lucide-react";
import type { MandateNotice } from "@/lib/mandate/parser";
import type { Mandate } from "@/lib/types";
import { Badge, Button, Card, Label, Money, Spinner } from "./ui";

function expiresIn(iso: string): string {
  const mins = Math.round((new Date(iso).getTime() - Date.now()) / 60_000);
  if (mins <= 0) return "Expired";
  return mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60 ? `${mins % 60}m` : ""}`.trim() : `${mins}m`;
}

export function MandateCard({
  mandate,
  parsedBy,
  notices = [],
  onApprove,
  approving,
  onDiscard,
}: {
  mandate: Mandate;
  parsedBy?: string;
  notices?: MandateNotice[];
  onApprove?: () => void;
  approving?: boolean;
  onDiscard?: () => void;
}) {
  const active = mandate.status === "ACTIVE";
  const recurringConflict = notices.some((n) => n.code === "RECURRING_REQUESTED");

  return (
    <Card className="overflow-hidden border border-gray-200 bg-white shadow-sm">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-gray-50/75 px-5 py-3.5 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">AP2 Spending Mandate</div>
            <div className="text-xs text-gray-500 font-mono">
              POLICY ID: {mandate.id.slice(0, 18)}…
            </div>
          </div>
        </div>
        {active ? (
          <Badge tone="pass" icon={<Lock className="h-3 w-3" />}>
            Signed & Active
          </Badge>
        ) : (
          <Badge tone="warn" icon={<AlertTriangle className="h-3 w-3" />}>
            Draft Policy · Needs Signature
          </Badge>
        )}
      </div>

      {/* Main Specs */}
      <div className="grid gap-6 p-5 sm:p-6 sm:grid-cols-[1.1fr_1fr]">
        <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-5">
          <div className="flex items-center justify-between">
            <Label>Authorized Spending Cap</Label>
            <span className="text-xs font-mono font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {mandate.maxTotal.currency}
            </span>
          </div>
          <div className="mt-2">
            <Money value={mandate.maxTotal.value} className="text-4xl font-bold tracking-tight text-gray-900" />
          </div>
          <p className="mt-2 text-xs text-gray-600 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            Hard ceiling including taxes & shipping. Pure deterministic limit.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-xs">
            <Label>Category Filter</Label>
            <div className="mt-1 flex flex-wrap gap-1">
              {mandate.allowedCategories.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-800"
                >
                  <Tag className="h-2.5 w-2.5 text-gray-500" />
                  {c}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-xs">
            <Label>Max Quantity</Label>
            <div className="mt-1 font-semibold text-gray-900 flex items-center gap-1.5 text-sm">
              <ShoppingBag className="h-3.5 w-3.5 text-gray-500" />
              {mandate.maxQuantity} {mandate.maxQuantity === 1 ? "item" : "items"}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-xs">
            <Label>Recurring Charges</Label>
            <div className="mt-1 flex items-center gap-1.5">
              {recurringConflict ? (
                <span className="font-semibold text-amber-700 text-xs flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Blocked
                </span>
              ) : (
                <span className="font-semibold text-emerald-700 text-xs flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Forbidden
                </span>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-xs">
            <Label>Policy TTL</Label>
            <div className="mt-1 text-xs font-medium text-gray-800 flex items-center gap-1">
              <Clock className="h-3 w-3 text-gray-500" />
              Expires in {expiresIn(mandate.expiresAt)}
            </div>
          </div>

          {mandate.allowedMerchants?.length ? (
            <div className="col-span-2 rounded-xl border border-gray-200 bg-white p-3.5 shadow-xs">
              <Label>Merchant Whitelist</Label>
              <div className="mt-1 font-mono text-xs text-gray-800">
                {mandate.allowedMerchants.join(", ")}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Warnings */}
      {notices.length ? (
        <div className="space-y-2 border-t border-amber-200 bg-amber-50/70 px-5 py-3.5 sm:px-6">
          {notices.map((n) => (
            <div key={n.code} className="flex items-start gap-2 text-xs text-amber-900">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-700 mt-0.5 shrink-0" />
              <p className="font-medium leading-relaxed">{n.message}</p>
            </div>
          ))}
        </div>
      ) : null}

      {/* User Prompt Playback */}
      <div className="border-t border-gray-200 bg-gray-50/50 px-5 py-3.5 sm:px-6">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>ORIGINAL USER INTENT</span>
          <span>{parsedBy ? `Parsed via ${parsedBy === "llm" ? "AI Model (Zod Verified)" : "Deterministic Rules"}` : ""}</span>
        </div>
        <p className="mt-1 text-sm text-gray-800 font-medium italic">
          &ldquo;{mandate.userPrompt}&rdquo;
        </p>
        {active && mandate.signature ? (
          <div className="mt-2.5 flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-mono text-xs text-gray-500 shadow-xs">
            <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <Lock className="h-3 w-3" /> Ed25519 Cryptographic Signature Verified
            </span>
            <span className="truncate max-w-[260px] text-gray-400" title={mandate.signature}>
              {mandate.signature}
            </span>
          </div>
        ) : null}
      </div>

      {/* Action footer */}
      {!active && onApprove ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 bg-white px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Lock className="h-3.5 w-3.5 text-blue-600" />
            <span>Signing this policy cryptographically binds the agent to the spending cap.</span>
          </div>
          <div className="flex items-center gap-2">
            {onDiscard ? (
              <Button variant="ghost" onClick={onDiscard} disabled={approving} size="sm">
                Cancel
              </Button>
            ) : null}
            <Button variant="primary" onClick={onApprove} disabled={approving} size="md">
              {approving ? <Spinner /> : <ShieldCheck className="h-4 w-4" />}
              Approve & Sign Policy
            </Button>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
