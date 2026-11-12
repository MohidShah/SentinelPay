"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import type { AuditEvent } from "@/lib/audit/log";
import { Badge, Button, Card, Spinner, type Tone } from "./ui";

const TYPE_TONE: Partial<Record<AuditEvent["type"], Tone>> = {
  GATE_PASS: "pass",
  PAYMENT_CAPTURED: "pass",
  MANDATE_APPROVED: "accent",
  GATE_BLOCK: "block",
  PAYMENT_FAILED: "block",
  USER_DENIED: "block",
  APPROVAL_REQUESTED: "warn",
};

function summary(e: AuditEvent): string {
  const d = e.detail as Record<string, unknown>;
  switch (e.type) {
    case "MANDATE_CREATED": {
      const draft = d.draft as { maxTotal?: { value: string }; allowedCategories?: string[] } | undefined;
      return `Draft: cap $${draft?.maxTotal?.value ?? "?"} · ${draft?.allowedCategories?.join(", ") ?? ""}`;
    }
    case "MANDATE_APPROVED":
      return `Signed · ${String(d.hash ?? "").slice(0, 16)}…`;
    case "SEARCH":
      return `${String(d.agent)} searched "${String(d.query)}"`;
    case "CART_PROPOSED": {
      const cart = d.cart as { items: { title: string; unitPrice: { value: string } }[]; extraFees: { label: string }[] };
      const fees = cart.extraFees.length ? ` + ${cart.extraFees.map((f) => f.label).join(", ")}` : "";
      return `${cart.items.map((i) => `${i.title} ($${i.unitPrice.value})`).join(", ")}${fees}`;
    }
    case "GATE_PASS":
    case "GATE_BLOCK":
    case "APPROVAL_REQUESTED": {
      const failed = (d.failedRules as { rule: string }[] | undefined) ?? [];
      const inj = d.injection as { detected: boolean } | undefined;
      const parts = [`total $${String(d.computedTotal)}`];
      if (failed.length) parts.push(failed.map((r) => r.rule).join(", "));
      if (inj?.detected) parts.push("injection detected");
      return parts.join(" · ");
    }
    default:
      return "";
  }
}

export function AuditTable() {
  const [events, setEvents] = useState<AuditEvent[] | null>(null);
  const [type, setType] = useState("ALL");
  const [mandate, setMandate] = useState("ALL");
  const [open, setOpen] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/audit", { cache: "no-store" });
      setEvents((await res.json()).events ?? []);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  const mandates = useMemo(() => [...new Set((events ?? []).map((e) => e.mandateId).filter(Boolean))] as string[], [events]);
  const types = useMemo(() => [...new Set((events ?? []).map((e) => e.type))].sort(), [events]);
  const rows = useMemo(
    () => (events ?? []).filter((e) => (type === "ALL" || e.type === type) && (mandate === "ALL" || e.mandateId === mandate)),
    [events, type, mandate]
  );
  const count = (t: string) => (events ?? []).filter((e) => e.type === t).length;

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedRows = rows.slice(startIndex, startIndex + pageSize);

  const handleTypeChange = (newType: string) => {
    setType(newType);
    setCurrentPage(1);
  };

  const handleMandateChange = (newMandate: string) => {
    setMandate(newMandate);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Mandates" value={count("MANDATE_APPROVED")} />
        <Metric label="Passed" value={count("GATE_PASS")} tone="text-pass" />
        <Metric label="Needs approval" value={count("APPROVAL_REQUESTED")} tone="text-warn" />
        <Metric label="Blocked" value={count("GATE_BLOCK")} tone="text-block" />
      </div>

      <Card className="overflow-hidden border border-gray-200 bg-white shadow-xs">
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 px-4 py-3 bg-gray-50/50">
          <Select value={type} onChange={handleTypeChange} label="Event type" options={["ALL", ...types]} />
          <Select
            value={mandate}
            onChange={handleMandateChange}
            label="Mandate"
            options={["ALL", ...mandates]}
            format={(m) => (m === "ALL" ? "All mandates" : `${m.slice(0, 12)}…`)}
          />
          <div className="ml-auto flex items-center gap-3 text-xs text-gray-500">
            <span>
              Showing <strong className="text-gray-900">{rows.length ? startIndex + 1 : 0}</strong>–
              <strong className="text-gray-900">{Math.min(startIndex + pageSize, rows.length)}</strong> of{" "}
              <strong className="text-gray-900">{rows.length}</strong> events
            </span>
            <Button variant="ghost" onClick={load} className="h-8 px-3 text-xs">
              {loading ? <Spinner /> : null} Refresh
            </Button>
          </div>
        </div>

        {events === null ? (
          <div className="flex items-center gap-2 px-4 py-10 text-sm text-gray-500">
            <Spinner /> Loading audit log
          </div>
        ) : rows.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-gray-500">
            No events match the current filter. Create and run a mandate to fill the log.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-[13px]">
              <thead className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/80 sticky top-0 z-10 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2.5">Time</th>
                  <th className="px-4 py-2.5">Event</th>
                  <th className="px-4 py-2.5">Mandate</th>
                  <th className="px-4 py-2.5">Detail</th>
                  <th className="px-4 py-2.5 text-right">Risk Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedRows.map((e) => (
                  <Fragment key={e.id}>
                    <tr
                      onClick={() => setOpen(open === e.id ? null : e.id)}
                      className="cursor-pointer hover:bg-blue-50/40 transition-colors"
                    >
                      <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-gray-500">
                        {new Date(e.createdAt).toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge tone={TYPE_TONE[e.type] ?? "neutral"}>{e.type}</Badge>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs text-gray-400">{e.mandateId?.slice(4, 12)}</td>
                      <td className="max-w-[360px] truncate px-4 py-2.5 text-gray-800" title={summary(e)}>
                        {summary(e)}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <Risk value={e.riskScore} />
                      </td>
                    </tr>
                    {open === e.id ? (
                      <tr className="border-b border-gray-200 bg-gray-50/60">
                        <td colSpan={5} className="px-4 py-3">
                          <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-all font-mono text-[11px] text-gray-600 bg-white p-3 rounded-lg border border-gray-200 shadow-2xs">
                            {JSON.stringify(e.detail, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Scalable Pagination Footer */}
        {rows.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-200 px-4 py-3 bg-gray-50/50 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="h-7 rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-700 outline-none focus:border-[#2563EB]"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span>per page &bull; Page <strong className="text-gray-900">{currentPage}</strong> of <strong className="text-gray-900">{totalPages}</strong></span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="cursor-pointer rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs"
              >
                &larr; Prev
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5 && currentPage > 3) {
                  pageNum = Math.min(totalPages - 4, currentPage - 2) + i;
                }
                const isActive = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`cursor-pointer h-7 w-7 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-[#2563EB] text-white shadow-xs"
                        : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="cursor-pointer rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs"
              >
                Next &rarr;
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function Metric({ label, value, tone = "text-gray-900" }: { label: string; value: number; tone?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
      <div className="text-[11px] font-semibold tracking-wider uppercase text-gray-400">{label}</div>
      <div className={`mt-1.5 font-mono text-2xl font-bold tracking-tight ${tone}`}>{value}</div>
    </div>
  );
}

function Risk({ value }: { value: number | null }) {
  if (value === null) return <span className="text-faint">—</span>;
  const pct = Math.round(value * 100);
  const color = value >= 0.6 ? "bg-block" : value > 0 ? "bg-warn" : "bg-pass";
  return (
    <span className="inline-flex items-center gap-2">
      <span className="h-1.5 w-12 overflow-hidden rounded-full bg-raised">
        <span className={`block h-full ${color}`} style={{ width: `${Math.max(pct, 6)}%` }} />
      </span>
      <span className="w-8 font-mono text-[12px] text-muted">{pct}%</span>
    </span>
  );
}

function Select({
  value,
  onChange,
  options,
  label,
  format = (o) => (o === "ALL" ? "All events" : o),
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  label: string;
  format?: (o: string) => string;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 rounded-md border border-line bg-raised px-2 text-[12px] text-ink outline-none focus:border-accent"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {format(o)}
        </option>
      ))}
    </select>
  );
}
