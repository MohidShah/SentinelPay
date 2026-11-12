"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Menu,
  Search,
  RefreshCw,
  Bell,
  ArrowRight,
  X,
  ShieldCheck,
  KeyRound,
  LogOut,
  User,
  ChevronDown,
  ShoppingBag,
  PanelLeftOpen,
} from "lucide-react";
import { Sidebar, type NavTab } from "./sidebar";
import { SentinelLogo } from "./sentinel-logo";
import { OverviewView } from "./views/overview-view";
import { TransactionsView } from "./views/transactions-view";
import { AgentsView } from "./views/agents-view";
import { ApprovalsView } from "./views/approvals-view";
import { SecurityView } from "./views/security-view";
import { PoliciesView } from "./views/policies-view";
import { AuditView } from "./views/audit-view";
import { SettingsView } from "./views/settings-view";
import { ShopFlow } from "./shop-flow";
import { TransactionDetailsModal } from "./transaction-details-modal";
import type { TransactionRecord, TransactionStats } from "@/lib/transactions/types";

interface DashboardShellProps {
  initialScenario?: string;
  initialPersona?: "shopper" | "admin";
  onBackToWelcome?: () => void;
  onOpenStory?: () => void;
}

export function DashboardShell({
  initialScenario,
  initialPersona = "shopper",
  onBackToWelcome,
  onOpenStory,
}: DashboardShellProps) {
  type AgentScenario = "llm" | "honest" | "compromised" | "over_budget" | "hidden_fee";
  type PersonaMode = "shopper" | "admin";

  const [persona, setPersona] = useState<PersonaMode>(initialPersona);
  const [activeTab, setActiveTab] = useState<NavTab>(initialScenario ? "shopping" : "overview");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [stats, setStats] = useState<TransactionStats>({
    totalCount: 0,
    approvedCount: 0,
    blockedCount: 0,
    pendingApprovalsCount: 0,
    totalVolume: 0,
    riskAlertRate: 0,
  });

  const [selectedTransaction, setSelectedTransaction] = useState<TransactionRecord | null>(null);
  const [shoppingInitialScenario, setShoppingInitialScenario] = useState<AgentScenario | undefined>(
    initialScenario as AgentScenario | undefined
  );
  const [shoppingInitialPrompt, setShoppingInitialPrompt] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const profileContainerRef = useRef<HTMLDivElement>(null);

  const handlePersonaChange = (newPersona: PersonaMode) => {
    setPersona(newPersona);
    if (newPersona === "shopper") {
      // If currently on an admin-exclusive tab, gently route to overview
      if (["security", "policies", "audit", "settings", "agents"].includes(activeTab)) {
        setActiveTab("overview");
      }
    }
  };

  const fetchTransactions = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/transactions", { cache: "no-store" });
      const data = await res.json();
      if (data.transactions) {
        setTransactions(data.transactions);
        setStats(data.stats);
      }
    } catch (e) {
      console.error("Failed to load transactions", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Update scenario if changed from outside
  useEffect(() => {
    if (initialScenario) {
      setShoppingInitialScenario(initialScenario as AgentScenario);
      setActiveTab("shopping");
    }
  }, [initialScenario]);

  // Update persona if changed from outside
  useEffect(() => {
    if (initialPersona) {
      setPersona(initialPersona);
    }
  }, [initialPersona]);

  // Close search and profile dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (searchContainerRef.current && !searchContainerRef.current.contains(target)) {
        setIsSearchOpen(false);
      }
      if (profileContainerRef.current && !profileContainerRef.current.contains(target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLaunchAgent = (scenario: string, prompt?: string) => {
    setShoppingInitialScenario(scenario as AgentScenario);
    if (prompt !== undefined) {
      setShoppingInitialPrompt(prompt);
    }
    setActiveTab("shopping");
  };

  // Live matching search results for instant preview
  const searchResults = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return transactions.filter(
      (tx) =>
        tx.id.toLowerCase().includes(q) ||
        tx.agent.toLowerCase().includes(q) ||
        tx.merchant.toLowerCase().includes(q) ||
        tx.prompt.toLowerCase().includes(q) ||
        (tx.paypalOrderId && tx.paypalOrderId.toLowerCase().includes(q))
    ).slice(0, 5);
  }, [transactions, searchQuery]);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-gray-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Primary Sidebar (Collapsible & Categorized) */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === "transactions" || tab === "overview" || tab === "approvals") {
            fetchTransactions();
          }
        }}
        pendingApprovalsCount={stats.pendingApprovalsCount}
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        onBackToWelcome={onBackToWelcome}
        onOpenStory={onOpenStory}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        persona={persona}
        onTogglePersona={handlePersonaChange}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Sleek Minimalist Top Header */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-gray-200/90 bg-white/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Desktop Expand Sidebar button when collapsed */}
            {isSidebarCollapsed && (
              <button
                onClick={() => setIsSidebarCollapsed(false)}
                className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 cursor-pointer transition-colors"
                title="Expand sidebar"
                aria-label="Expand sidebar"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </button>
            )}

            {/* Mobile Brand Mark */}
            <div className="flex lg:hidden items-center">
              <SentinelLogo size="sm" showSubtitle={false} />
            </div>

            {/* Quick Global Search / Command Bar */}
            <div ref={searchContainerRef} className="relative hidden sm:block">
              <div className="flex items-center justify-between rounded-full border border-gray-200 bg-[#F8FAFC] px-3.5 py-1.5 text-xs text-gray-500 w-80 shadow-2xs focus-within:border-[#2563EB] focus-within:bg-white transition-all">
                <div className="flex items-center gap-2 flex-1">
                  <Search className="h-3.5 w-3.5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsSearchOpen(true);
                    }}
                    onFocus={() => {
                      if (searchQuery.trim().length > 0) setIsSearchOpen(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && searchQuery.trim().length > 0) {
                        setIsSearchOpen(false);
                        setActiveTab("transactions");
                      }
                      if (e.key === "Escape") setIsSearchOpen(false);
                    }}
                    placeholder="Search transactions, agents..."
                    className="bg-transparent text-xs text-gray-900 placeholder-gray-400 focus:outline-hidden w-full"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setIsSearchOpen(false);
                      }}
                      className="text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <kbd className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-mono text-gray-400 shadow-2xs">
                  ⌘K
                </kbd>
              </div>

              {/* Instant Search Results Dropdown */}
              {isSearchOpen && searchQuery.trim().length > 0 && (
                <div className="absolute top-full left-0 mt-1.5 w-96 rounded-2xl border border-gray-200 bg-white p-3 shadow-lg z-50 animate-rise">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Search Results ({searchResults.length})
                    </span>
                    <button
                      onClick={() => {
                        setIsSearchOpen(false);
                        setActiveTab("transactions");
                      }}
                      className="text-[11px] font-semibold text-[#2563EB] hover:text-blue-700 cursor-pointer flex items-center gap-1"
                    >
                      <span>View in ledger</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>

                  {searchResults.length === 0 ? (
                    <div className="py-4 text-center text-xs text-gray-400">
                      No matching records found for &ldquo;{searchQuery}&rdquo;
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {searchResults.map((tx) => (
                        <div
                          key={tx.id}
                          onClick={() => {
                            setSelectedTransaction(tx);
                            setIsSearchOpen(false);
                          }}
                          className="flex items-center justify-between rounded-xl p-2 hover:bg-blue-50/50 cursor-pointer transition-colors"
                        >
                          <div className="truncate mr-2">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[11px] font-semibold text-gray-900">
                                {tx.id.slice(0, 10)}
                              </span>
                              <span className="text-[10px] text-gray-500 truncate max-w-[140px]">
                                {tx.merchant}
                              </span>
                            </div>
                            <div className="text-[10px] text-gray-400 truncate max-w-[200px]">
                              {tx.prompt}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-xs font-bold text-gray-900">${tx.amount}</div>
                            <span
                              className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-full border ${
                                tx.status === "APPROVED" || tx.status === "CAPTURED"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : tx.status === "BLOCKED"
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}
                            >
                              {tx.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* 1-Click Persona View Switcher (Sleek, pill-shaped, zero wrap) */}
            <div className="flex items-center rounded-full bg-gray-100 p-1 border border-gray-200/80 shadow-2xs shrink-0">
              <button
                onClick={() => handlePersonaChange("shopper")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  persona === "shopper"
                    ? "bg-white text-[#2563EB] shadow-2xs font-bold"
                    : "text-gray-500 hover:text-gray-900"
                }`}
                title="Switch to Shopper View (Consumer Mode)"
              >
                <ShoppingBag className="h-3.5 w-3.5 shrink-0" />
                <span>Shopper</span>
              </button>
              <button
                onClick={() => handlePersonaChange("admin")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  persona === "admin"
                    ? "bg-[#0F172A] text-white shadow-2xs font-bold"
                    : "text-gray-500 hover:text-gray-900"
                }`}
                title="Switch to Enterprise Security Console"
              >
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                <span>Admin</span>
              </button>
            </div>

            {/* Subtle Sandbox Status Chip (Single-line, non-intrusive) */}
            <div className="hidden xl:flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 shrink-0 whitespace-nowrap">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>PayPal Sandbox</span>
            </div>

            {/* Shopeers-style Tools: Theme toggle, Notifications, Refresh */}
            <div className="flex items-center gap-1 pl-1 border-l border-gray-200 shrink-0">
              <button
                onClick={fetchTransactions}
                disabled={isRefreshing}
                title="Refresh ledger state"
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer shrink-0"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-[#2563EB]" : ""}`} />
              </button>

              <button
                onClick={() => setActiveTab("approvals")}
                className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer shrink-0"
                title={persona === "shopper" ? "Orders Needing My Sign-Off" : "Pending Approvals"}
                aria-label={persona === "shopper" ? "Orders Needing My Sign-Off" : "Pending Approvals"}
              >
                <Bell className="h-4 w-4" />
                {stats.pendingApprovalsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                )}
              </button>

              {/* Fully Interactive Demo User Profile (Shopeers style avatar) */}
              <div ref={profileContainerRef} className="relative shrink-0 ml-1">
                <button
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100/80 cursor-pointer transition-colors shrink-0"
                  title="Demo Account Profile"
                >
                  <div className="relative shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2563EB] text-[11px] font-bold text-white shadow-2xs ring-2 ring-blue-100">
                      {persona === "shopper" ? "AC" : "EV"}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </div>
                  <div className="hidden 2xl:flex flex-col text-left whitespace-nowrap">
                    <span className="text-xs font-semibold text-gray-900 leading-tight">
                      {persona === "shopper" ? "Alex Chen" : "Elena Vance"}
                    </span>
                    <span className="text-[10px] text-gray-400 leading-tight">
                      {persona === "shopper" ? "Verified Shopper" : "Security Admin"}
                    </span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                </button>

                {/* Profile Dropdown Card */}
                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl z-50 animate-rise">
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2563EB] text-white font-bold text-sm shadow-xs">
                        {persona === "shopper" ? "AC" : "EV"}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-gray-900 truncate">
                            {persona === "shopper" ? "Alex Chen" : "Elena Vance"}
                          </span>
                          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 text-[9px] font-semibold text-emerald-700">
                            Verified
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 truncate">
                          {persona === "shopper" ? "alex.chen@gmail.com" : "elena.vance@sentinelpay.io"}
                        </p>
                        <span className="text-[10px] text-gray-400 block mt-0.5">
                          Role: {persona === "shopper" ? "Verified PayPal Shopper" : "Merchant Security Admin"}
                        </span>
                      </div>
                    </div>

                    {/* Enclave / Protection Card */}
                    <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/60 p-2.5 text-[11px] text-blue-900 space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold text-[#2563EB]">
                        {persona === "shopper" ? (
                          <ShieldCheck className="h-3.5 w-3.5" />
                        ) : (
                          <KeyRound className="h-3.5 w-3.5" />
                        )}
                        <span>
                          {persona === "shopper" ? "AP2 Shopper Shield Active" : "Ed25519 Enclave Keyholder"}
                        </span>
                      </div>
                      <p className="text-[10px] text-blue-700/80">
                        {persona === "shopper"
                          ? "$250.00 daily safety cap • Zero passwords or payment tokens shared with AI agents."
                          : "Authorized to sign AP2 mandates & configure merchant policy limits."}
                      </p>
                    </div>

                    {/* Quick Profile Navigation Links */}
                    <div className="mt-3 space-y-1 border-t border-gray-100 pt-2 text-xs">
                      {persona === "shopper" ? (
                        <>
                          <button
                            onClick={() => {
                              setIsProfileOpen(false);
                              setActiveTab("shopping");
                            }}
                            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-gray-700 hover:bg-gray-50 hover:text-gray-900 cursor-pointer transition-colors"
                          >
                            <ShoppingBag className="h-3.5 w-3.5 text-[#2563EB]" />
                            <span>AI Shopping Assistant</span>
                          </button>

                          <button
                            onClick={() => {
                              setIsProfileOpen(false);
                              setActiveTab("approvals");
                            }}
                            className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-gray-700 hover:bg-gray-50 hover:text-gray-900 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <Bell className="h-3.5 w-3.5 text-amber-500" />
                              <span>Orders Needing My Sign-Off</span>
                            </div>
                            {stats.pendingApprovalsCount > 0 && (
                              <span className="rounded-full bg-amber-100 px-1.5 text-[10px] font-bold text-amber-800">
                                {stats.pendingApprovalsCount}
                              </span>
                            )}
                          </button>

                          <button
                            onClick={() => {
                              setIsProfileOpen(false);
                              setActiveTab("transactions");
                            }}
                            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-gray-700 hover:bg-gray-50 hover:text-gray-900 cursor-pointer transition-colors"
                          >
                            <User className="h-3.5 w-3.5 text-gray-400" />
                            <span>My Orders &amp; Receipts</span>
                          </button>

                          <button
                            onClick={() => {
                              setIsProfileOpen(false);
                              handlePersonaChange("admin");
                            }}
                            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-blue-700 hover:bg-blue-50 cursor-pointer transition-colors border-t border-gray-100 mt-1 pt-1.5 font-semibold"
                          >
                            <ShieldCheck className="h-3.5 w-3.5 text-[#2563EB]" />
                            <span>Switch to Security Admin Mode 🛡️</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setIsProfileOpen(false);
                              setActiveTab("settings");
                            }}
                            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-gray-700 hover:bg-gray-50 hover:text-gray-900 cursor-pointer transition-colors"
                          >
                            <ShieldCheck className="h-3.5 w-3.5 text-[#2563EB]" />
                            <span>Hardware Enclave &amp; Keys</span>
                          </button>

                          <button
                            onClick={() => {
                              setIsProfileOpen(false);
                              setActiveTab("approvals");
                            }}
                            className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-gray-700 hover:bg-gray-50 hover:text-gray-900 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <Bell className="h-3.5 w-3.5 text-amber-500" />
                              <span>Pending Approvals Queue</span>
                            </div>
                            {stats.pendingApprovalsCount > 0 && (
                              <span className="rounded-full bg-amber-100 px-1.5 text-[10px] font-bold text-amber-800">
                                {stats.pendingApprovalsCount}
                              </span>
                            )}
                          </button>

                          <button
                            onClick={() => {
                              setIsProfileOpen(false);
                              setActiveTab("transactions");
                            }}
                            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-gray-700 hover:bg-gray-50 hover:text-gray-900 cursor-pointer transition-colors"
                          >
                            <User className="h-3.5 w-3.5 text-gray-400" />
                            <span>PayPal Settlement Ledger</span>
                          </button>

                          <button
                            onClick={() => {
                              setIsProfileOpen(false);
                              handlePersonaChange("shopper");
                            }}
                            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-blue-700 hover:bg-blue-50 cursor-pointer transition-colors border-t border-gray-100 mt-1 pt-1.5 font-semibold"
                          >
                            <ShoppingBag className="h-3.5 w-3.5 text-[#2563EB]" />
                            <span>Switch to Shopper Mode 🛍️</span>
                          </button>
                        </>
                      )}

                      {onBackToWelcome && (
                        <button
                          onClick={() => {
                            setIsProfileOpen(false);
                            onBackToWelcome();
                          }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-gray-500 hover:bg-gray-50 hover:text-[#2563EB] cursor-pointer transition-colors border-t border-gray-100 mt-1 pt-1.5"
                        >
                          <LogOut className="h-3.5 w-3.5 text-gray-400" />
                          <span>Switch Evaluation Mode</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Main Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {activeTab === "overview" && (
              <OverviewView
                stats={stats}
                recentTransactions={transactions}
                onSelectTransaction={(tx) => setSelectedTransaction(tx)}
                onNavigate={(tab) => {
                  setActiveTab(tab);
                  if (tab === "transactions" || tab === "approvals") fetchTransactions();
                }}
                onRunScenario={(scenario, prompt) => handleLaunchAgent(scenario, prompt)}
                persona={persona}
                onTogglePersona={handlePersonaChange}
              />
            )}

            {activeTab === "transactions" && (
              <TransactionsView
                transactions={transactions}
                onSelectTransaction={(tx) => setSelectedTransaction(tx)}
                externalSearchQuery={searchQuery}
                persona={persona}
              />
            )}

            {activeTab === "shopping" && (
              <div className="space-y-6">
                <div className="flex flex-col gap-1 border-b border-gray-200 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-semibold text-[#2563EB]">
                      Autonomous Shopping Assistant
                    </span>
                    <span className="text-xs text-gray-400">Live Agent Execution &amp; Policy Gate</span>
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                    Agent Purchase Execution
                  </h1>
                  <p className="text-xs text-gray-500">
                    Create a natural language intent mandate, watch the autonomous agent search the web, and witness real-time Policy Gate enforcement before PayPal order capture.
                  </p>
                </div>

                <ShopFlow
                  key={`${shoppingInitialScenario || "default"}-${shoppingInitialPrompt}`}
                  initialAgent={shoppingInitialScenario}
                  initialPrompt={shoppingInitialPrompt}
                />
              </div>
            )}

            {activeTab === "agents" && (
              <AgentsView onLaunchAgent={(scenario) => handleLaunchAgent(scenario)} />
            )}

            {activeTab === "approvals" && <ApprovalsView persona={persona} />}

            {activeTab === "security" && <SecurityView />}

            {activeTab === "policies" && <PoliciesView />}

            {activeTab === "audit" && <AuditView />}

            {activeTab === "settings" && <SettingsView />}
          </div>
        </main>
      </div>

      {/* Interactive Transaction Details Modal */}
      <TransactionDetailsModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </div>
  );
}
