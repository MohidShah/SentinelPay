"use client";

import React from "react";
import { AuditTable } from "../audit-table";
import { Lock } from "lucide-react";

export function AuditView() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Audit Logs & Cryptographic Proofs</h1>
          <p className="text-xs text-gray-500">
            Immutable SQLite telemetry ledger tracking every mandate, agent search, gate check, and PayPal capture
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-700">
            <Lock className="h-3 w-3" />
            Ed25519 Signed Telemetry
          </span>
        </div>
      </div>

      {/* Embedded Audit Table */}
      <AuditTable />
    </div>
  );
}
