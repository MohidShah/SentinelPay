"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Copy,
  Check,
  Key,
  Database,
  Cpu,
  Layers,
  Code,
  ExternalLink,
  Download,
} from "lucide-react";
import { SentinelIcon } from "../sentinel-logo";

export function SettingsView() {
  const [publicKey, setPublicKey] = useState<string>("");
  const [copiedKey, setCopiedKey] = useState(false);
  const [systemStatus, setSystemStatus] = useState<{
    ai: boolean;
    aiProvider: string | null;
    channel3: boolean;
    paypal: boolean;
  } | null>(null);

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then((s) => setSystemStatus(s))
      .catch(() => {});

    fetch("/api/crypto/public-key")
      .then((r) => r.json())
      .then((k) => setPublicKey(k.publicKeyPem || ""))
      .catch(() => {});
  }, []);

  const copyPublicKey = () => {
    navigator.clipboard.writeText(publicKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Platform Settings & Diagnostics</h1>
          <p className="text-xs text-gray-500">
            Hardware security parameters, PayPal credentials status, and cryptographic signing keys
          </p>
        </div>
      </div>

      {/* Integration Diagnostics Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* PayPal Sandbox Diagnostics */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-900">PayPal Server SDK Integration</h3>
                <p className="text-[11px] text-gray-400">APIMatic Generated SDK Controller</p>
              </div>
            </div>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                systemStatus?.paypal
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  systemStatus?.paypal ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                }`}
              />
              {systemStatus?.paypal ? "Sandbox Live" : "Unconfigured"}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-gray-500">Environment Target:</span>
              <span className="font-mono font-semibold text-gray-900">PayPal Sandbox</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-gray-500">Orders Controller:</span>
              <span className="font-mono text-emerald-700 font-medium">OrdersController.createOrder</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-gray-500">Intent Execution:</span>
              <span className="font-mono text-gray-900">CheckoutPaymentIntent.Capture</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-gray-500">Trust Boundary:</span>
              <span className="font-mono text-blue-600 font-semibold">lib/pipeline/run.ts only</span>
            </div>
          </div>
        </div>

        {/* Channel3 Product Search API */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200">
                <Database className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-900">Channel3 Product Intelligence</h3>
                <p className="text-[11px] text-gray-400">Live Web E-Commerce Search</p>
              </div>
            </div>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                systemStatus?.channel3
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-gray-100 text-gray-700 border-gray-200"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  systemStatus?.channel3 ? "bg-emerald-500" : "bg-gray-400"
                }`}
              />
              {systemStatus?.channel3 ? "Active & Verified" : "Offline"}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-gray-500">API Endpoint:</span>
              <span className="font-mono text-gray-900">https://api.channel3.ai/v1</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-gray-500">Real-Time Search:</span>
              <span className="font-medium text-emerald-700">Online Web Catalog</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-gray-500">Fallback Fixtures:</span>
              <span className="font-mono text-gray-900">lib/catalog/fixtures.ts</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-gray-500">Data Sanitization:</span>
              <span className="font-semibold text-blue-600">Zero-Width Strip + Injection Scanner</span>
            </div>
          </div>
        </div>

        {/* AI Model Intelligence */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 border border-purple-200">
                <Cpu className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-900">AI Provider & Reasoning Engine</h3>
                <p className="text-[11px] text-gray-400">Tool Calling & Structured Output</p>
              </div>
            </div>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                systemStatus?.ai
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              {systemStatus?.ai ? "Model Online" : "Scripted Only"}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-gray-500">Active Provider:</span>
              <span className="font-mono font-semibold text-gray-900">
                {systemStatus?.aiProvider || "Google Gemini / Anthropic"}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-gray-500">Schema Enforcement:</span>
              <span className="font-mono text-gray-900">Zod (ProposedCartSchema)</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-gray-500">Isolation Zone:</span>
              <span className="text-amber-700 font-semibold">Untrusted Agent Zone</span>
            </div>
          </div>
        </div>

        {/* Database & Cryptography Engine */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600 border border-teal-200">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-900">Database & Proof Engine</h3>
                <p className="text-[11px] text-gray-400">Drizzle ORM & SQLite</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              covenant.db
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-gray-500">Database Engine:</span>
              <span className="font-mono text-gray-900">SQLite (@libsql/client)</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-gray-500">Signing Algorithm:</span>
              <span className="font-mono text-gray-900">Ed25519 (Node Crypto)</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-gray-500">Audit Ledger:</span>
              <span className="text-emerald-700 font-semibold">Append-Only Immutable Telemetry</span>
            </div>
          </div>
        </div>

        {/* APIMatic ContextMatic & OpenAPI 3.1 Portal */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
                <Code className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-900">APIMatic ContextMatic &amp; OpenAPI</h3>
                <p className="text-[11px] text-gray-400">Official PayPal SDK &amp; API Portal</p>
              </div>
            </div>
            <a
              href="/api/openapi"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
            >
              <span>View OpenAPI 3.1</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-gray-500">SDK Generation:</span>
              <span className="font-mono text-gray-900">@paypal/paypal-server-sdk</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-gray-500">OpenAPI Spec Endpoint:</span>
              <span className="font-mono text-emerald-700 font-medium">GET /api/openapi</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-gray-500">ContextMatic Log:</span>
              <span className="font-mono text-gray-900">SUBMISSION.md (4 SDK Model Lookups)</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-gray-500">Client CodeGen Ready:</span>
              <span className="text-[#2563EB] font-semibold">Python, TypeScript, Java, C#</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ed25519 Public Verification Key Block */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-blue-600" />
            <h3 className="text-xs font-bold text-gray-900">
              SentinelPay Ed25519 Public Verification Key
            </h3>
          </div>
          <button
            onClick={copyPublicKey}
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 active:scale-[0.98] transition-all"
          >
            {copiedKey ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            {copiedKey ? "Copied PEM" : "Copy Public Key"}
          </button>
        </div>
        <p className="text-xs text-gray-500">
          This public key can be distributed to merchants, auditors, or external verifiers to validate
          that any Intent Proof or Mandate signature was created by this SentinelPay security node.
        </p>

        <div className="rounded-lg bg-gray-900 p-3 font-mono text-[11px] text-blue-300 overflow-x-auto">
          <pre>{publicKey || "Loading cryptographic verification key..."}</pre>
        </div>
      </div>

      {/* Brand Identity & Asset Package */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-3">
            <SentinelIcon size={32} />
            <div>
              <h3 className="text-xs font-bold text-gray-900">Brand Identity &amp; Favicon Package</h3>
              <p className="text-[11px] text-gray-400">Vector SVG Marks, ICO Favicon, and High-Res App Icons</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold text-[#2563EB]">
            Production Ready
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Mark Preview 1 */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 bg-gray-50/50 text-center gap-2">
            <SentinelIcon size={48} variant="primary" />
            <span className="text-xs font-bold text-gray-800 mt-1">Electric Blue Icon</span>
            <span className="text-[10px] text-gray-400">Primary App Mark</span>
            <a
              href="/brand-icon.svg"
              download="sentinelpay-icon.svg"
              className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-[#2563EB] hover:underline"
            >
              <Download className="h-3 w-3" />
              <span>Download SVG</span>
            </a>
          </div>

          {/* Mark Preview 2 */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 bg-[#0F172A] text-center gap-2">
            <SentinelIcon size={48} variant="slate" />
            <span className="text-xs font-bold text-white mt-1">Enclave Slate Icon</span>
            <span className="text-[10px] text-gray-400">Security Operations Mark</span>
            <a
              href="/logo.svg"
              download="sentinelpay-logo.svg"
              className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:underline"
            >
              <Download className="h-3 w-3" />
              <span>Download Lockup</span>
            </a>
          </div>

          {/* Mark Preview 3 */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 bg-gray-50/50 text-center gap-2">
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/favicon-32x32.png" alt="Favicon 32x32" className="h-8 w-8 rounded-lg shadow-2xs" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/favicon-16x16.png" alt="Favicon 16x16" className="h-4 w-4 rounded-xs" />
            </div>
            <span className="text-xs font-bold text-gray-800 mt-1">Favicon &amp; Apple Touch</span>
            <span className="text-[10px] text-gray-400">16px / 32px / 180px PNG + ICO</span>
            <a
              href="/favicon.ico"
              download="favicon.ico"
              className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-[#2563EB] hover:underline"
            >
              <Download className="h-3 w-3" />
              <span>Download ICO</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
