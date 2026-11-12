# SentinelPay

<p align="center">
  <img src="public/brand-icon.svg" width="96" height="96" alt="SentinelPay Logo" />
</p>

<h3 align="center">Trust Every Transaction. Control Every Agent.</h3>

<p align="center">
  <b>Enterprise financial guardrails for autonomous AI shopping agents on PayPal.</b><br />
  Turns natural-language requests into cryptographically signed spending mandates, lets AI agents shop with zero access to payment credentials, and screens every checkout through an 11-rule deterministic policy gate and dual-layer prompt injection firewall before PayPal capture.
</p>

<p align="center">
  <a href="https://github.com/MohidShah/SentinelPay">GitHub Repository</a> •
  <a href="SUBMISSION.md">Hackathon Submission &amp; Architecture</a>
</p>

---

## 🚀 Key Features & Functionality

1. **AP2-Inspired Intent Mandates**: Natural language requests are converted into structured, tamper-proof spending policies (spending caps, allowed merchant categories, max quantities, expiration, and strict single-purchase enforcement).
2. **Ed25519 Cryptographic Signatures**: Mandates are signed with Ed25519 digital signatures. The agent cannot modify policy parameters without invalidating the mathematical signature.
3. **Zero-Credential Shopping Agent**: The autonomous AI agent searches real retail catalogs via the **Channel3 API**, compares prices, and selects products with **zero access to credit cards, PayPal tokens, or user secrets**.
4. **Deterministic Sentinel Policy Gate (11 Rules)**: A strict, non-LLM policy engine verifies catalog resolution, price integrity, category whitelists, and fee audits before payment creation.
5. **Dual-Layer Prompt Injection & Steganography Firewall**:
   - *Layer 1*: Strips invisible zero-width Unicode steganography (`\u200B`, `\uFEFF`, etc.).
   - *Layer 2*: Detects instruction overrides (`"IGNORE ALL PREVIOUS INSTRUCTIONS"`), hidden CSS (`display:none`), and gift-card exfiltration attempts.
6. **Cryptographic Proof of Intent (PoI)**: Canonical JSON SHA-256 hashing + Ed25519 signature linking mandate, cart, and PayPal order into a tamper-proof certificate verifiable at `/api/proofs/:id/verify`.
7. **Human-in-the-Loop Sign-Off Queue**: Soft policy exceptions or high-value items route to an interactive sign-off queue before funds move.
8. **Cloud-Native Database (Turso LibSQL)**: Multi-device telemetry, mandate persistence, and transaction audit trails powered by Turso Cloud SQLite.
9. **Next.js 15 Fullstack Architecture**: React 19, Tailwind CSS v4, and Lucide icons packaged into a unified fullstack app ready for Vercel.

---

## 🛠️ Tools & AI Services Used

| Tool / Service | Purpose & Implementation |
|---|---|
| **Google Gemini 3.1 Flash Lite** (`gemini-3.1-flash-lite`) | **Intent Parsing & Agent Reasoning**: Extracts structured Zod mandates from natural language prompts; powers the autonomous shopping agent's catalog evaluation and search query formulation. |
| **Vercel AI SDK** (`ai` v7 + `@ai-sdk/google`) | **Model Abstraction**: Provides provider-agnostic streaming and structured JSON output. Enables switching between Google Gemini and Anthropic Claude via 3 environment variables. |
| **PayPal Server SDK** (`@paypal/paypal-server-sdk` v2.5.0) | **Isolated Payment Execution**: The *only* module with PayPal credentials. Creates and captures v2 Sandbox orders strictly after receiving cryptographic `GATE_PASS` clearance. |
| **Channel3 API** (`api.trychannel3.com`) | **Live Merchant Search**: Real-time multi-merchant inventory lookup, live retail pricing, and catalog resolution for physical goods. |
| **Turso Cloud LibSQL** (`@libsql/client` + Drizzle ORM) | **Persistent Database**: Edge SQLite database storing mandates, approvals, audit telemetry, and cryptographic proofs across sessions. |
| **Node.js Native Crypto** (`node:crypto` Ed25519) | **Tamper-Proof Verification**: Fast, constant-time RFC 8785 canonical hashing and Ed25519 digital signatures. |
| **APIMatic ContextMatic** | **API Specification Intelligence**: Verified PayPal v2 Orders endpoints, payload structures, and SDK typing. |

---

## 🚀 How to Run Locally (Step-by-Step)

### Prerequisites
- **Node.js**: v20 or higher ([nodejs.org](https://nodejs.org))
- **Package Manager**: `npm` (included with Node.js)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/MohidShah/SentinelPay.git
cd SentinelPay
npm install
```

### 2. Configure Environment Variables
Copy the example environment configuration:
```bash
cp .env.example .env.local
```
Fill in your credentials in `.env.local`:
- **PayPal Sandbox**: `PAYPAL_CLIENT_ID` & `PAYPAL_CLIENT_SECRET` (from [developer.paypal.com](https://developer.paypal.com)).
- **AI Model**: `AI_PROVIDER=google`, `AI_MODEL=gemini-3.1-flash-lite`, and `AI_API_KEY` (from [Google AI Studio](https://aistudio.google.com)).
- **Channel3 Search**: `CHANNEL3_API_KEY` (from [docs.trychannel3.com](https://docs.trychannel3.com), promo: `PAYPAL-HACKATHON-2026`).
- **Database**:
  - Local SQLite: `DATABASE_URL="file:./covenant.db"`
  - Or Turso Cloud SQLite: `DATABASE_URL="libsql://..."` and `DATABASE_AUTH_TOKEN="..."`

> 💡 **Zero-Setup Demo Mode**: If you don't have API keys yet, SentinelPay automatically falls back to deterministic parsing and reproducible agent scenarios (`honest`, `compromised`, `over_budget`, `hidden_fee`) so anyone can test the policy gate, prompt-injection defense, and audit trail right away!

### 3. Initialize Database Schema
Apply the Drizzle ORM schema to create your database tables:
```bash
npm run db:push
```

### 4. Start the Application
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser to access the full interactive SentinelPay fintech dashboard.

### 📋 Available NPM Scripts
| Command | Description |
|---|---|
| `npm run dev` | Start the local development server with Turbopack on port 3000 |
| `npm test` | Run the complete Vitest test suite (53 tests, 100% pass) |
| `npm run typecheck` | Run TypeScript type checking (`tsc --noEmit`) |
| `npm run lint` | Run ESLint static code analysis |
| `npm run db:push` | Push the Drizzle ORM schema to SQLite / Turso cloud |
| `npm run build` | Compile the optimized production build for Vercel |
| `npm start` | Run the production build locally |

---

## ⚡ Programmatic CLI Walkthrough (Try Without a UI)

You can exercise the full financial gate pipeline directly via curl:

```bash
# 1. Parse a natural-language mandate using Gemini 3.1 Flash Lite
curl -X POST localhost:3000/api/mandates/parse -H 'Content-Type: application/json' \
  -d '{"prompt":"Buy me noise-canceling headphones under $150, no subscriptions."}'

# 2. Cryptographically sign and approve the mandate
curl -X POST localhost:3000/api/mandates/<mandate_id>/approve

# 3. Run the autonomous agent through the Sentinel Policy Gate
# Scenarios: honest | compromised | over_budget | hidden_fee
curl -N -X POST localhost:3000/api/agent/run -H 'Content-Type: application/json' \
  -d '{"mandateId":"<mandate_id>","scenario":"honest"}'

# 4. Inspect the tamper-proof audit trail
curl localhost:3000/api/audit

# 5. Cryptographically verify a Proof of Intent certificate
curl -X POST localhost:3000/api/proofs/<proof_id>/verify
```

---

## 🧪 Automated Testing & Verification

SentinelPay includes an exhaustive automated test suite with **53 unit and integration tests** across 9 test suites:

```bash
npm test         # Run 53 Vitest unit tests (100% pass)
npm run typecheck # TypeScript strict type verification
npm run lint      # ESLint static analysis
npm run build     # Next.js 15 production build
```

Coverage areas:
- **Boundary & Cap Rules**: Enforces hard budget limits, quantity limits, and currency matching.
- **Prompt Injection Defense**: Validates detection of zero-width steganography and hostile CSS.
- **Cryptographic Signatures**: Tests Ed25519 signing, verification, and tamper detection.
- **Channel3 Integration**: Verifies live catalog query normalization and error handling.
- **Brand & Assets Integrity**: Ensures unified SVG icon rendering and favicon compliance.

---

## 📦 Deployment to Vercel

SentinelPay runs fullstack on Vercel (Edge CDN for React 19 frontend + Serverless Functions for all API routes):

1. Import your repository (`https://github.com/MohidShah/SentinelPay`) into [vercel.com/new](https://vercel.com/new).
2. Set Environment Variables in Project Settings:
   - `DATABASE_URL`: Your Turso LibSQL connection URL (`libsql://...`) or SQLite database
   - `DATABASE_AUTH_TOKEN`: Your Turso database token
   - `AI_PROVIDER`: `google`
   - `AI_MODEL`: `gemini-3.1-flash-lite`
   - `AI_API_KEY`: Your Google AI Studio API key
   - `CHANNEL3_API_KEY`: Your Channel3 API key
   - `PAYPAL_CLIENT_ID` & `PAYPAL_CLIENT_SECRET`: Your PayPal Sandbox credentials
3. Click **Deploy**. Vercel will build and launch the production application automatically.

---

## 📄 License

MIT © SentinelPay Contributors. Built for the PayPal AI Hackathon 2026.
