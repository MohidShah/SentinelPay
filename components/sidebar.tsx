"use client";

import React, { useState } from "react";
import { SentinelIcon, SentinelLogo } from "./sentinel-logo";
import {
  LayoutDashboard,
  ReceiptText,
  ShoppingBag,
  Cpu,
  UserCheck,
  ShieldCheck,
  Scale,
  ScrollText,
  Settings,
  ChevronRight,
  Shield,
  BookOpen,
  Compass,
  PanelLeftClose,
} from "lucide-react";

export type NavTab =
  | "overview"
  | "transactions"
  | "shopping"
  | "agents"
  | "approvals"
  | "security"
  | "policies"
  | "audit"
  | "settings";

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  pendingApprovalsCount?: number;
  isOpen?: boolean;
  onClose?: () => void;
  onBackToWelcome?: () => void;
  onOpenStory?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  persona?: "shopper" | "admin";
  onTogglePersona?: (p: "shopper" | "admin") => void;
}

export function Sidebar({
  activeTab,
  onTabChange,
  pendingApprovalsCount = 0,
  isOpen = false,
  onClose,
  onBackToWelcome,
  onOpenStory,
  isCollapsed: controlledCollapsed,
  onToggleCollapse,
  persona = "shopper",
  onTogglePersona,
}: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  const toggleCollapse = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed((prev) => !prev);
    }
  };

  const adminSections = [
    {
      category: "AI Commerce",
      items: [
        { id: "overview" as NavTab, label: "Overview", icon: LayoutDashboard },
        { id: "shopping" as NavTab, label: "Shopping Assistant", icon: ShoppingBag },
        { id: "agents" as NavTab, label: "AI Agents", icon: Cpu },
      ],
    },
    {
      category: "Payment Security",
      items: [
        { id: "transactions" as NavTab, label: "Transactions", icon: ReceiptText },
        {
          id: "approvals" as NavTab,
          label: "Approvals",
          icon: UserCheck,
          badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
          badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
        },
        { id: "security" as NavTab, label: "Security Monitoring", icon: ShieldCheck },
        { id: "policies" as NavTab, label: "Policies & Limits", icon: Scale },
      ],
    },
    {
      category: "Governance & Enclave",
      items: [
        { id: "audit" as NavTab, label: "Audit Logs & Proofs", icon: ScrollText },
        { id: "settings" as NavTab, label: "Settings & Enclave", icon: Settings },
      ],
    },
  ];

  const shopperSections = [
    {
      category: "Shopping & Orders",
      items: [
        { id: "shopping" as NavTab, label: "AI Shopping Assistant", icon: ShoppingBag },
        { id: "overview" as NavTab, label: "My Spend & Budget", icon: LayoutDashboard },
        { id: "transactions" as NavTab, label: "My Orders & Receipts", icon: ReceiptText },
        {
          id: "approvals" as NavTab,
          label: "Needs My Sign-Off",
          icon: UserCheck,
          badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
          badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
        },
      ],
    },
  ];

  const navSections = persona === "shopper" ? shopperSections : adminSections;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-gray-200 bg-white transition-all duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${isCollapsed ? "w-20" : "w-64"}`}
      >
        {/* Brand Header */}
        <div
          className={`flex h-16 shrink-0 items-center border-b border-gray-200 bg-white transition-all ${
            isCollapsed ? "justify-center px-2" : "justify-between px-4"
          }`}
        >
          {isCollapsed ? (
            <button
              onClick={toggleCollapse}
              className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-gray-100 transition-all cursor-pointer group"
              title="Expand sidebar • SentinelPay"
              aria-label="Expand sidebar"
            >
              <SentinelIcon size={34} className="group-hover:scale-105" />
            </button>
          ) : (
            <>
              <div
                onClick={() => {
                  onTabChange("overview");
                  onClose?.();
                }}
                className="flex items-center gap-3 cursor-pointer group truncate"
                title="SentinelPay Overview"
              >
                <SentinelLogo size="md" showSubtitle={false} />
              </div>

              {/* Desktop Collapse Toggle */}
              <button
                onClick={toggleCollapse}
                className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 cursor-pointer transition-colors"
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {/* Navigation Links Grouped by Domain */}
        <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
          {navSections.map((section) => (
            <div key={section.category} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {section.category}
                </div>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      onClose?.();
                    }}
                    title={isCollapsed ? item.label : undefined}
                    className={`group relative flex w-full items-center rounded-xl text-xs font-medium cursor-pointer transition-all duration-150 ${
                      isCollapsed
                        ? "justify-center p-2.5"
                        : "justify-between px-3.5 py-2.5"
                    } ${
                      isActive
                        ? "bg-blue-50/80 text-[#2563EB] font-semibold shadow-2xs before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r-full before:bg-[#2563EB]"
                        : "text-gray-600 hover:bg-gray-100/70 hover:text-gray-900"
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Icon
                        className={`h-4 w-4 shrink-0 transition-colors ${
                          isActive ? "text-[#2563EB]" : "text-gray-400 group-hover:text-gray-600"
                        }`}
                      />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {item.badge !== undefined ? (
                      isCollapsed ? (
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                      ) : (
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                            item.badgeColor || "bg-blue-100 text-[#2563EB] border-blue-200"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )
                    ) : isActive && !isCollapsed ? (
                      <ChevronRight className="h-3.5 w-3.5 text-[#2563EB]" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          ))}

          {/* Persona Switch Prompt for Shoppers */}
          {persona === "shopper" && onTogglePersona && (
            <div className="pt-2 px-1">
              <button
                onClick={() => onTogglePersona("admin")}
                className={`group flex w-full items-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50 hover:bg-blue-50/60 hover:border-blue-200 p-2.5 transition-all cursor-pointer ${
                  isCollapsed ? "justify-center" : "justify-between"
                }`}
                title="Switch to Enterprise Security Console"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <ShieldCheck className="h-4 w-4 text-[#2563EB] shrink-0 group-hover:scale-110 transition-transform" />
                  {!isCollapsed && (
                    <div className="text-left truncate">
                      <span className="text-xs font-semibold text-gray-800 block truncate group-hover:text-[#2563EB]">
                        Security Operations Console
                      </span>
                      <span className="text-[10px] text-gray-400 block truncate">
                        11 Rules, Enclave &amp; Logs
                      </span>
                    </div>
                  )}
                </div>
                {!isCollapsed && <ChevronRight className="h-3.5 w-3.5 text-gray-400 group-hover:text-[#2563EB]" />}
              </button>
            </div>
          )}

          {/* Single Dedicated Evaluation & Story Entry */}
          {(onBackToWelcome || onOpenStory) && (
            <div className="pt-3 mt-3 border-t border-gray-100 space-y-1">
              {!isCollapsed && (
                <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Judge Hub
                </div>
              )}
              {onBackToWelcome && (
                <button
                  onClick={() => {
                    onBackToWelcome();
                    onClose?.();
                  }}
                  title="Return to Experience Selector"
                  className={`group flex w-full items-center rounded-xl text-xs font-medium text-gray-600 hover:bg-blue-50/70 hover:text-[#2563EB] cursor-pointer transition-all ${
                    isCollapsed ? "justify-center p-2.5" : "gap-3 px-3.5 py-2"
                  }`}
                >
                  <Compass className="h-4 w-4 text-[#2563EB] shrink-0" />
                  {!isCollapsed && <span>Switch Mode</span>}
                </button>
              )}
              {onOpenStory && (
                <button
                  onClick={() => {
                    onOpenStory();
                    onClose?.();
                  }}
                  title="View Product Story & Pitch"
                  className={`group flex w-full items-center rounded-xl text-xs font-medium text-gray-600 hover:bg-blue-50/70 hover:text-[#2563EB] cursor-pointer transition-all ${
                    isCollapsed ? "justify-center p-2.5" : "gap-3 px-3.5 py-2"
                  }`}
                >
                  <BookOpen className="h-4 w-4 text-[#2563EB] shrink-0" />
                  {!isCollapsed && <span>Product Story</span>}
                </button>
              )}
            </div>
          )}
        </nav>

        {/* AP2 Security / Protection Card */}
        <div className="p-3 border-t border-gray-100">
          {isCollapsed ? (
            <button
              onClick={() => onTabChange(persona === "shopper" ? "shopping" : "settings")}
              title={persona === "shopper" ? "AP2 Shopper Shield • Zero Password Leaks" : "AP2 Security Enclave • Keys Isolated"}
              className="w-full flex justify-center p-2 rounded-xl bg-blue-50 text-[#2563EB] hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <Shield className="h-4 w-4" />
            </button>
          ) : persona === "shopper" ? (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2563EB] via-[#1D4ED8] to-[#1E40AF] p-4 text-white shadow-sm shadow-blue-500/10">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xs mb-2.5">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <h4 className="text-xs font-bold tracking-tight">AP2 Shopper Shield</h4>
              <p className="mt-1 text-[10px] text-blue-100 leading-relaxed">
                Zero password leaks. Every purchase is verified before PayPal capture.
              </p>
              <button
                onClick={() => onTabChange("shopping")}
                className="mt-3 w-full cursor-pointer rounded-xl bg-white text-[#2563EB] hover:bg-blue-50 py-1.5 text-center text-[11px] font-bold shadow-xs transition-all active:scale-[0.98]"
              >
                Shop with Assistant
              </button>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2563EB] via-[#1D4ED8] to-[#1E40AF] p-4 text-white shadow-sm shadow-blue-500/10">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xs mb-2.5">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <h4 className="text-xs font-bold tracking-tight">AP2 Security Enclave</h4>
              <p className="mt-1 text-[10px] text-blue-100 leading-relaxed">
                Ed25519 keys & PayPal tokens isolated from LLM agents.
              </p>
              <button
                onClick={() => onTabChange("settings")}
                className="mt-3 w-full cursor-pointer rounded-xl bg-white text-[#2563EB] hover:bg-blue-50 py-1.5 text-center text-[11px] font-bold shadow-xs transition-all active:scale-[0.98]"
              >
                Verify Public Key
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
