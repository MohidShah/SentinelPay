import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const openapiSpec = {
    openapi: "3.1.0",
    info: {
      title: "SentinelPay — AI Agent Payment Security Gateway API",
      version: "1.0.0",
      description:
        "Official AP2-compliant Gateway API for SentinelPay. Deterministic Policy Gate, Prompt Injection Firewall, and Ed25519 Intent Proofs for PayPal Autonomous Agent Commerce. Generated for APIMatic ContextMatic interoperability.",
      contact: {
        name: "SentinelPay Security Team",
      },
      license: {
        name: "MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local development server",
      },
    ],
    paths: {
      "/api/mandates/parse": {
        post: {
          summary: "Parse natural language intent into an AP2 draft mandate",
          operationId: "parseMandate",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["prompt"],
                  properties: {
                    prompt: {
                      type: "string",
                      example: "Buy noise-cancelling headphones under $150, no subscriptions.",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Parsed draft mandate",
            },
          },
        },
      },
      "/api/mandates/{id}/approve": {
        post: {
          summary: "Sign and activate an AP2 Intent Mandate with Ed25519",
          operationId: "approveMandate",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "Activated mandate signed with Ed25519",
            },
          },
        },
      },
      "/api/mandates/{id}/revoke": {
        post: {
          summary: "Revoke an active mandate (Kill switch)",
          operationId: "revokeMandate",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "Mandate revoked",
            },
          },
        },
      },
      "/api/gate/evaluate": {
        post: {
          summary: "Deterministically evaluate a candidate cart against 11 rules and prompt injection firewall",
          operationId: "evaluateCart",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["mandateId", "cart"],
                  properties: {
                    mandateId: { type: "string" },
                    cart: { type: "object" },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Gate decision (PASS, BLOCK, or NEEDS_APPROVAL)",
            },
          },
        },
      },
      "/api/agent/run": {
        post: {
          summary: "Execute autonomous shopping run (streamed as NDJSON)",
          operationId: "runAgent",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["mandateId"],
                  properties: {
                    mandateId: { type: "string" },
                    scenario: {
                      type: "string",
                      enum: ["llm", "honest", "compromised", "over_budget", "hidden_fee"],
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Stream of execution steps, gate evaluation, and PayPal order capture",
            },
          },
        },
      },
      "/api/approvals": {
        get: {
          summary: "List all transactions held for human authorization",
          operationId: "listApprovals",
          responses: {
            "200": { description: "Pending approvals array" },
          },
        },
      },
      "/api/approvals/{id}": {
        post: {
          summary: "Human authorization: Approve (triggers PayPal capture + Ed25519 proof) or Reject",
          operationId: "resolveApproval",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["action"],
                  properties: {
                    action: { type: "string", enum: ["APPROVE", "REJECT"] },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Resolution status with PayPal order ID" },
          },
        },
      },
      "/api/proofs/{id}": {
        get: {
          summary: "Retrieve an immutable Ed25519 Intent Proof bundle",
          operationId: "getProof",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": { description: "Intent Proof JSON bundle" },
          },
        },
      },
      "/api/proofs/{id}/verify": {
        post: {
          summary: "Cryptographically verify Ed25519 signature of an Intent Proof",
          operationId: "verifyProof",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": { description: "Cryptographic validation result" },
          },
        },
      },
      "/api/crypto/public-key": {
        get: {
          summary: "Get SentinelPay Ed25519 public key in PEM format",
          operationId: "getPublicKey",
          responses: {
            "200": { description: "Ed25519 PEM public key" },
          },
        },
      },
      "/api/transactions": {
        get: {
          summary: "List all transactions and executive security KPIs",
          operationId: "listTransactions",
          responses: {
            "200": { description: "Transaction array and stats" },
          },
        },
      },
      "/api/status": {
        get: {
          summary: "System health check for PayPal, Channel3, and Ed25519 keys",
          operationId: "getStatus",
          responses: {
            "200": { description: "Diagnostics object" },
          },
        },
      },
    },
  };

  return NextResponse.json(openapiSpec);
}

