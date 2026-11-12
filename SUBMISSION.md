# SentinelPay — Project Overview & Hackathon Submission

> **PayPal AI Hackathon 2026 Submission**  
> **Tagline:** *Trust Every Transaction. Control Every Agent.*  
> **Live Repository:** [https://github.com/MohidShah/SentinelPay](https://github.com/MohidShah/SentinelPay)

---

## 📖 1. Text Description — Features & Functionality

### The Core Problem
Autonomous AI shopping agents are transforming commerce: users can now instruct agents to find products, compare prices, and complete purchases on their behalf. However, granting an LLM raw access to credit card credentials, payment tokens, or direct checkout accounts introduces existential financial risks:
- **Prompt Injection & Web Poisoning**: Malicious sellers embed hidden CSS (`display:none`) or prompt injection payloads in merchant catalog pages to hijack the agent into purchasing unauthorized gift cards or transferring funds.
- **Hidden Fees & Subscription Traps**: Deceptive checkouts slip in hidden recurring subscriptions, expedited handling surcharges, or undisclosed recurring fees.
- **Budget Creep & Hallucination**: LLMs can miscalculate quantities, round up totals, or purchase products outside the user’s designated budget or merchant categories.

### The Solution: SentinelPay
**SentinelPay** is an enterprise-grade financial security gateway and policy firewall for autonomous AI agents transacting over PayPal. Inspired by Google's Agent Payment Protocol (AP2) and zero-trust architecture, SentinelPay ensures that **AI agents never touch payment credentials**, and **no money ever moves without a cryptographically signed spending mandate and strict policy gate clearance**.

---

### Key Features & Capabilities

```
User Prompt ("Buy me noise-canceling headphones under $150, no subscriptions")
   │
   ▼
1. Intent Parser (Google Gemini 3.1 Flash Lite) ──► Strict Zod Policy
   │
   ▼
2. User Approval & Ed25519 Cryptographic Signing ──► ACTIVE Mandate
   │
   ▼
3. Autonomous Shopping Agent (Channel3 API Search) ──► Proposed Cart
   │  [Zero Access to Payment Tokens]
   ▼
4. Sentinel Policy Gate (11 Hard/Soft Checks) ──► Deterministic Verification
   │  [Dual-Layer Prompt Injection & Poisoning Firewall]
   ├─── Soft Policy Exception? ──► Human-in-the-Loop Sign-off Queue
   └─── Violation Detected? ──► INSTANT BLOCK (Funds Protected)
   │
   ▼ All Rules Passed (GATE_PASS)
5. Proof of Intent (PoI) Engine (SHA-256 Canonical Hash + Ed25519 Signature)
   │
   ▼
6. PayPal Sandbox Payment Execution (`@paypal/paypal-server-sdk`)
   │  ──► Orders: Create & Capture
   ▼
7. Real-time Audit Trail & Telemetry (Turso Cloud SQLite)
```

#### 1. Cryptographic Intent Mandates (AP2 Protocol Inspired)
- Translates natural language prompts into immutable spending policies.
- Parameters enforced: `maxTotal`, `currency`, `allowedCategories`, `maxQuantity`, `allowRecurring: false`, and `expiresAt`.
- User signs the mandate via **Ed25519 digital signatures**, making it mathematically impossible for the agent or merchant to alter policy constraints.

#### 2. Zero-Credential Autonomous Shopping Agent
- The AI agent searches live merchant inventory via the Channel3 API.
- Evaluates real product specs, compares prices, and selects the optimal item.
- Operates in a **sandboxed environment with zero knowledge of PayPal client secrets, cards, or user tokens**.

#### 3. Deterministic Sentinel Policy Gate (11 Rules)
- A non-LLM, deterministic policy engine evaluates every proposed cart against the signed mandate:
  1. `mandate_valid`: Mandate is active and unexpired.
  2. `signature_valid`: Cryptographic Ed25519 user signature is intact.
  3. `catalog_resolved`: Proposed items match real product IDs in merchant inventory.
  4. `price_integrity`: Proposed price matches verified catalog pricing.
  5. `total_within_cap`: Total cost $\le$ user's strict spending cap.
  6. `category_allowed`: Merchant category matches authorized whitelist.
  7. `quantity_within_limit`: Item count does not exceed limit.
  8. `no_subscriptions`: Strict blocking of recurring billing or auto-renewal markers.
  9. `no_surprise_fees`: Rejection of unauthorized shipping or handling surcharges.
  10. `currency_match`: Enforces currency match (USD sandbox).
  11. `prompt_injection_absent`: Heuristic and steganographic payload firewall.

#### 4. Dual-Layer Prompt Injection & Steganography Firewall
- **Layer 1 (Steganography & Zero-Width Scanners)**: Strips invisible Unicode characters (`\u200B`, `\u200C`, `\uFEFF`, etc.) used to hide instructions from human review.
- **Layer 2 (Instruction Override Scanner)**: Detects adversarial jailbreaks, role-hijacking phrases (`"IGNORE ALL PREVIOUS INSTRUCTIONS"`), hidden DOM tags (`<div style="display:none">`), and exfiltration attempts (e.g. adding unauthorized gift cards).

#### 5. Cryptographic Proof of Intent (PoI)
- Generates an immutable cryptographic certificate for every approved purchase.
- Canonical JSON representation of `{ mandateId, cartHash, paypalOrderId, timestamp }` hashed with **SHA-256** and signed with SentinelPay’s private Ed25519 key.
- Publicly verifiable by anyone via `POST /api/proofs/:id/verify` or through the interactive verification modal.

#### 6. Human-in-the-Loop Approval Queue
- If a proposed cart exceeds a soft threshold or requires explicit merchant verification, it is routed to an interactive approval queue.
- Users can review the item breakdown, risk score, and policy audit details before granting a one-time sign-off.

#### 7. Modern Fintech Management Dashboard
- Built with **Next.js 15 App Router**, **React 19**, and **Tailwind CSS v4**.
- Complete views: Live Overview, Active Spending Policies, Transaction Feed, Human Approvals Queue, Cryptographic Security & Audit Logs, and Developer Settings.
- Scalable vector brand identity with high-contrast favicon and collapsed-sidebar optimization.

---

## 🛠️ 2. Tools — AI Services, Models & Developer Tools Used

SentinelPay integrates modern AI models, payment SDKs, and developer tooling to deliver its financial gateway:

### 1. Google Gemini 3.1 Flash Lite (`gemini-3.1-flash-lite`)
- **What it is**: Google's lightweight, high-speed, 1-million-token-context multimodal frontier model.
- **How it was used in SentinelPay**:
  1. **Intent Parsing**: Powers `/api/mandates/parse`. It receives natural language requests (e.g. *"Buy me a wireless mechanical keyboard under $120 from Keychron, single purchase only"*) and extracts structured JSON adhering to our Zod schema (`searchQuery`, `maxTotal`, `allowedCategories`, `allowRecurring: false`, `maxQuantity`).
  2. **Shopping Agent Reasoning**: Analyzes real-time search results returned from the Channel3 API, evaluates customer reviews, compares pricing against the user's constraints, and proposes the final checkout payload.
  3. **Adversarial Resilience**: Tested against adversarial product descriptions to verify that the agent respects system boundary instructions.

### 2. Vercel AI SDK (`ai` v7 + `@ai-sdk/google` + `@ai-sdk/anthropic`)
- **What it is**: Unified TypeScript library for building AI applications with structured outputs, streaming, and tool execution.
- **How it was used in SentinelPay**:
  - Encapsulates model interactions inside `lib/ai/model.ts`.
  - Enables **zero-downtime provider switching**: SentinelPay can seamlessly switch between **Google Gemini** (`gemini-3.1-flash-lite`, `gemini-2.5-flash`) and **Anthropic Claude** (`claude-3-5-sonnet`) by changing just 3 environment variables (`AI_PROVIDER`, `AI_MODEL`, `AI_API_KEY`) without modifying any application code.

### 3. PayPal Server SDK (`@paypal/paypal-server-sdk` v2.5.0)
- **What it is**: The official Node.js server SDK for PayPal's v2 Orders API.
- **How it was used in SentinelPay**:
  - Implements the isolated payment execution engine in `lib/paypal/executor.ts`.
  - Securely manages PayPal Sandbox OAuth 2.0 client credential handshakes.
  - Generates orders (`OrdersController.createOrder`) only after receiving explicit `GATE_PASS` clearance from the Sentinel Policy Gate.
  - Captures authorized transactions (`OrdersController.captureOrder`) and records the resulting PayPal Order ID into the cryptographic Proof of Intent.
  - **Zero Credential Leakage**: This is the **only** module in the entire application with access to PayPal credentials; AI agents and browser clients have zero access.

### 4. Channel3 Product Search API (`api.trychannel3.com`)
- **What it is**: Real-time multi-merchant ecommerce search API (PayPal AI Hackathon partner).
- **How it was used in SentinelPay**:
  - Implemented in `lib/channel3/client.ts`.
  - Enables the autonomous shopping agent to query real live merchant catalogs for physical goods, retrieving actual merchant names, product titles, live pricing, and verified inventory URLs.

### 5. APIMatic ContextMatic
- **What it is**: API documentation and SDK intelligence platform for PayPal developer tools.
- **How it was used in SentinelPay**:
  - Used during architecture design to inspect PayPal's v2 Orders API specifications, verify capture payloads, and validate TypeScript SDK typing constraints.
  - Implemented strictly with APIMatic's official `@paypal/paypal-server-sdk` models: `OrdersController.createOrder({ body: OrderRequest })`, `CheckoutPaymentIntent.Capture`, and `OrdersController.captureOrder`.
  - SentinelPay also exposes its own full AP2 Gateway API in OpenAPI 3.1 format at `GET /api/openapi` for instant import into APIMatic ContextMatic, APIMatic Portal, and automated multi-language SDK generation.

### 6. Turso Cloud SQLite (`@libsql/client` + Drizzle ORM)
- **What it is**: Globally distributed edge SQLite database powered by LibSQL.
- **How it was used in SentinelPay**:
  - Stores all persistent financial records: active spending mandates, transaction history, audit telemetry events, and cryptographic Proof of Intent certificates.
  - Enables seamless hybrid operation: runs against a local SQLite file during unit tests, and connects over encrypted WebSockets (`libsql://...`) with JWT auth tokens when hosted in cloud and Vercel serverless functions.

### 7. Node.js Native Cryptography (`node:crypto` Ed25519)
- **What it is**: High-performance, constant-time asymmetric cryptography.
- **How it was used in SentinelPay**:
  - Implemented in `lib/crypto/sign.ts` and `lib/crypto/canonical.ts`.
  - Generates RFC 8785 canonical JSON representations to eliminate key-ordering discrepancies.
  - Signs spending mandates and Proof of Intent certificates using Ed25519 digital signatures.

---

## 🚀 3. How to Run Locally

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/MohidShah/SentinelPay.git
cd SentinelPay
npm install
```

### 2. Configure Environment Keys
```bash
cp .env.example .env.local
```
Fill in `.env.local`:
- `PAYPAL_CLIENT_ID` & `PAYPAL_CLIENT_SECRET` (PayPal Developer Sandbox)
- `AI_PROVIDER=google`, `AI_MODEL=gemini-3.1-flash-lite`, `AI_API_KEY` (Google AI Studio)
- `CHANNEL3_API_KEY` (Channel3)
- `DATABASE_URL` (SQLite file or Turso Cloud URL)

> *Note: If keys are omitted, SentinelPay runs in demo mode with reproducible test scenarios!*

### 3. Initialize Database & Start Dev Server
```bash
npm run db:push
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)**.
Run tests: `npm test` (53 tests passing).


