import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuditTable } from "@/components/audit-table";

export const metadata = { title: "Audit & Intent Proofs · SentinelPay" };

export default function AuditPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Dashboard
          </Link>
        </div>

        <section className="pt-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-blue-700">
              IMMUTABLE EVENT LOG
            </span>
            <span className="text-[12px] text-gray-500">SQLite Telemetry &bull; Ed25519 Signatures</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            SentinelPay Audit Log & Intent Proofs
          </h1>
          <p className="mt-1.5 text-[14px] leading-relaxed text-gray-600 max-w-2xl">
            Every mandate creation, LLM search query, proposed cart, deterministic gate check, and cryptographic Ed25519
            proof is recorded in an immutable ledger. Click any row to inspect the canonical payload and signatures.
          </p>
        </section>

        <AuditTable />
      </div>
    </div>
  );
}
