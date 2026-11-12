"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Receipt,
} from "lucide-react";
import type { TransactionRecord } from "@/lib/transactions/types";

interface TransactionsViewProps {
  transactions: TransactionRecord[];
  onSelectTransaction: (tx: TransactionRecord) => void;
  externalSearchQuery?: string;
  persona?: "shopper" | "admin";
}

function MerchantAvatar({ merchant }: { merchant: string }) {
  const m = (merchant || "").toLowerCase();
  let initials = "MC";
  let color = "bg-gray-100 text-gray-700 border-gray-200";
  let statusText = "Merchant";

  if (m.includes("anker")) {
    initials = "AD";
    color = "bg-blue-100 text-blue-700 border-blue-200";
    statusText = "Verified Partner";
  } else if (m.includes("keychron")) {
    initials = "KC";
    color = "bg-indigo-100 text-indigo-700 border-indigo-200";
    statusText = "Verified Partner";
  } else if (m.includes("shady") || m.includes("poison") || m.includes("hostile")) {
    initials = "SD";
    color = "bg-red-100 text-red-700 border-red-200";
    statusText = "Hostile Page";
  } else if (m.includes("overpriced") || m.includes("pricey")) {
    initials = "OP";
    color = "bg-amber-100 text-amber-700 border-amber-200";
    statusText = "Budget Drift";
  } else {
    initials =
      merchant
        .split(" ")
        .map((w) => w[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase() || "MC";
  }

  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold shadow-2xs ${color}`}
      >
        {initials}
      </div>
      <div className="truncate">
        <span className="font-semibold text-gray-900 block truncate">{merchant}</span>
        <span className="text-[9px] text-gray-400 block">{statusText}</span>
      </div>
    </div>
  );
}

export function TransactionsView({
  transactions,
  onSelectTransaction,
  externalSearchQuery = "",
  persona = "shopper",
}: TransactionsViewProps) {
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const searchQuery = externalSearchQuery || internalSearchQuery;
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"time" | "amount" | "risk">("time");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const isShopper = persona === "shopper";

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.agent.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tx.paypalOrderId && tx.paypalOrderId.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "APPROVED" && (tx.status === "APPROVED" || tx.status === "CAPTURED")) ||
        (statusFilter === "BLOCKED" && tx.status === "BLOCKED") ||
        (statusFilter === "NEEDS_APPROVAL" && tx.status === "NEEDS_APPROVAL");

      return matchesSearch && matchesStatus;
    });
  }, [transactions, searchQuery, statusFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let diff = 0;
      if (sortBy === "time") {
        diff = new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      } else if (sortBy === "amount") {
        diff = parseFloat(b.amount) - parseFloat(a.amount);
      } else if (sortBy === "risk") {
        diff = b.riskScore - a.riskScore;
      }
      return sortOrder === "asc" ? -diff : diff;
    });
  }, [filtered, sortBy, sortOrder]);

  const totalPages = Math.ceil(sorted.length / pageSize) || 1;
  const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (field: "time" | "amount" | "risk") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {isShopper ? "My Orders & Receipts" : "Transaction Monitoring"}
            </h1>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                isShopper
                  ? "bg-blue-50 text-[#2563EB] border-blue-200"
                  : "bg-slate-900 text-white border-slate-700"
              }`}
            >
              {isShopper ? "Shopper View" : "Security Ledger"}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {isShopper
              ? "Complete history of items purchased by your AI shopping assistant via PayPal"
              : "Real-time ledger of autonomous agent payment authorizations and Policy Gate decisions"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">
            Showing <strong className="text-gray-900">{filtered.length}</strong> {isShopper ? "orders" : "total records"}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={
              isShopper
                ? "Search orders, items, stores, or PayPal transaction IDs..."
                : "Search transactions, agents, merchants, or PayPal IDs..."
            }
            value={searchQuery}
            onChange={(e) => {
              setInternalSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-lg border border-gray-200 bg-gray-50/50 pl-9 pr-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-hidden"
          />
        </div>

        {/* Status Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "ALL", label: isShopper ? "All Orders" : "All Statuses" },
            { id: "APPROVED", label: isShopper ? "Delivered & Paid" : "Approved / Captured" },
            { id: "BLOCKED", label: isShopper ? "Blocked Threats" : "Blocked Threats" },
            { id: "NEEDS_APPROVAL", label: isShopper ? "Needs My OK" : "Needs Approval" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setCurrentPage(1);
              }}
              className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-[0.98] ${
                statusFilter === tab.id
                  ? "bg-[#2563EB] text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200/80 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-gray-200 bg-gray-50/70 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3 cursor-pointer select-none" onClick={() => toggleSort("time")}>
                  <div className="flex items-center gap-1.5">
                    <span>Transaction ID & Timestamp</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-5 py-3">AI Agent / Scenario</th>
                <th className="px-5 py-3">Recipient / Merchant</th>
                <th className="px-5 py-3 cursor-pointer select-none" onClick={() => toggleSort("amount")}>
                  <div className="flex items-center gap-1.5">
                    <span>Amount ($)</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-5 py-3 cursor-pointer select-none" onClick={() => toggleSort("risk")}>
                  <div className="flex items-center gap-1.5">
                    <span>Risk Score</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400">
                    <Receipt className="mx-auto h-8 w-8 mb-2 opacity-40" />
                    No transactions matched your current filters.
                  </td>
                </tr>
              ) : (
                paginated.map((tx) => {
                  const isApproved = tx.status === "APPROVED" || tx.status === "CAPTURED";
                  const isBlocked = tx.status === "BLOCKED";
                  return (
                    <tr
                      key={tx.id}
                      onClick={() => onSelectTransaction(tx)}
                      className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="font-mono font-semibold text-gray-900">{tx.id}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          {new Date(tx.timestamp).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-medium text-gray-900">{tx.agent}</span>
                        <p className="text-[10px] text-gray-400 truncate max-w-[200px]">
                          {tx.prompt}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <MerchantAvatar merchant={tx.merchant} />
                        {tx.paypalOrderId && (
                          <div className="text-[9px] font-mono text-gray-400 mt-0.5 ml-9.5">
                            PayPal: {tx.paypalOrderId.slice(0, 10)}…
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-gray-900">${tx.amount}</span>
                        <span className="text-[10px] text-gray-400 ml-1">{tx.currency}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              tx.riskScore < 0.2
                                ? "bg-emerald-500"
                                : tx.riskScore < 0.7
                                ? "bg-amber-500"
                                : "bg-red-500"
                            }`}
                          />
                          <span className="text-[11px] font-semibold text-gray-700">
                            {Math.round(tx.riskScore * 100)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${
                            isApproved
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : isBlocked
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTransaction(tx);
                          }}
                          className="cursor-pointer rounded-full bg-white border border-gray-200 px-3.5 py-1 text-xs font-semibold text-[#2563EB] hover:bg-blue-50/70 hover:border-blue-200 transition-all shadow-2xs active:scale-[0.98]"
                        >
                          Details →
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between border-t border-gray-200 px-5 py-3 bg-gray-50/50 text-xs text-gray-500">
          <div>
            Page <strong className="text-gray-900">{currentPage}</strong> of{" "}
            <strong className="text-gray-900">{totalPages}</strong>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 disabled:opacity-40 hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 disabled:opacity-40 hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
