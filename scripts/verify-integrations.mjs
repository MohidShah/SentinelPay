import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Load .env.local
dotenv.config({ path: path.join(rootDir, ".env.local") });

console.log("=================================================");
console.log("    SENTINELPAY LIVE CREDENTIALS VERIFICATION    ");
console.log("=================================================\n");

const results = {
  envVars: {},
  ai: { status: "PENDING", details: "" },
  channel3: { status: "PENDING", details: "" },
  paypal: { status: "PENDING", details: "" },
};

// 1. Check Env Vars presence (Never print full keys!)
const provider = process.env.AI_PROVIDER || "";
const model = process.env.AI_MODEL || "";
const apiKey = process.env.AI_API_KEY || "";
const paypalClientId = process.env.PAYPAL_CLIENT_ID || "";
const paypalSecret = process.env.PAYPAL_CLIENT_SECRET || "";
const channel3Key = process.env.CHANNEL3_API_KEY || "";

results.envVars = {
  AI_PROVIDER: provider ? `[CONFIGURED: ${provider}]` : "[MISSING]",
  AI_MODEL: model ? `[CONFIGURED: ${model}]` : "[MISSING]",
  AI_API_KEY: apiKey ? `[CONFIGURED: ${apiKey.slice(0, 4)}...${apiKey.slice(-4)} (${apiKey.length} chars)]` : "[MISSING]",
  PAYPAL_CLIENT_ID: paypalClientId ? `[CONFIGURED: ${paypalClientId.slice(0, 4)}...${paypalClientId.slice(-4)} (${paypalClientId.length} chars)]` : "[MISSING]",
  PAYPAL_CLIENT_SECRET: paypalSecret ? `[CONFIGURED: ${paypalSecret.slice(0, 4)}...${paypalSecret.slice(-4)} (${paypalSecret.length} chars)]` : "[MISSING]",
  CHANNEL3_API_KEY: channel3Key ? `[CONFIGURED: ${channel3Key.slice(0, 4)}...${channel3Key.slice(-4)} (${channel3Key.length} chars)]` : "[MISSING]",
};

console.log("1. Environment Variables Check:");
for (const [k, v] of Object.entries(results.envVars)) {
  console.log(`   ${k.padEnd(22)}: ${v}`);
}
console.log();

// 2. Test AI Model & Key
console.log("2. Testing AI Provider & Model Connectivity...");
try {
  if (provider === "google") {
    const { createGoogle } = await import("@ai-sdk/google");
    const { generateText } = await import("ai");

    const google = createGoogle({ apiKey });
    const aiModel = google(model);

    const startTime = Date.now();
    const { text, usage } = await generateText({
      model: aiModel,
      prompt: "Respond with exactly the single word: VERIFIED",
      maxTokens: 10,
    });
    const elapsed = Date.now() - startTime;

    results.ai = {
      status: "SUCCESS",
      provider: "google",
      model,
      response: text.trim(),
      latencyMs: elapsed,
      usage,
    };
    console.log(`   [PASS] Google Gemini AI Model '${model}' verified in ${elapsed}ms! Response: "${text.trim()}"`);
  } else if (provider === "anthropic") {
    const { createAnthropic } = await import("@ai-sdk/anthropic");
    const { generateText } = await import("ai");

    const anthropic = createAnthropic({ apiKey });
    const aiModel = anthropic(model);

    const startTime = Date.now();
    const { text, usage } = await generateText({
      model: aiModel,
      prompt: "Respond with exactly the single word: VERIFIED",
      maxTokens: 10,
    });
    const elapsed = Date.now() - startTime;

    results.ai = {
      status: "SUCCESS",
      provider: "anthropic",
      model,
      response: text.trim(),
      latencyMs: elapsed,
      usage,
    };
    console.log(`   [PASS] Anthropic Model '${model}' verified in ${elapsed}ms! Response: "${text.trim()}"`);
  } else {
    results.ai = { status: "SKIPPED", details: `Unknown or unconfigured provider: '${provider}'` };
    console.log(`   [SKIP] AI Provider '${provider}' not configured.`);
  }
} catch (err) {
  results.ai = { status: "ERROR", error: err.message };
  console.error(`   [FAIL] AI Provider verification failed:`, err.message);
}
console.log();

// 3. Test PayPal Sandbox Credentials via Direct OAuth
console.log("3. Testing PayPal Sandbox Client Credentials...");
try {
  if (paypalClientId && paypalSecret) {
    const authHeader = Buffer.from(`${paypalClientId}:${paypalSecret}`).toString("base64");
    const startTime = Date.now();

    const response = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${authHeader}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const elapsed = Date.now() - startTime;
    if (response.ok) {
      const data = await response.json();
      results.paypal = {
        status: "SUCCESS",
        appId: data.app_id,
        tokenType: data.token_type,
        expiresIn: data.expires_in,
        latencyMs: elapsed,
      };
      console.log(`   [PASS] PayPal Sandbox OAuth 2.0 Authenticated successfully in ${elapsed}ms!`);
      console.log(`          App ID: ${data.app_id}, Expires In: ${data.expires_in}s, Scope Count: ${data.scope ? data.scope.split(' ').length : 0}`);
    } else {
      const errText = await response.text();
      results.paypal = { status: "FAILED", statusCode: response.status, error: errText };
      console.error(`   [FAIL] PayPal Sandbox authentication failed (${response.status}):`, errText);
    }
  } else {
    results.paypal = { status: "SKIPPED", details: "PayPal credentials missing" };
    console.log("   [SKIP] PayPal credentials missing.");
  }
} catch (err) {
  results.paypal = { status: "ERROR", error: err.message };
  console.error("   [FAIL] PayPal verification error:", err.message);
}
console.log();

// 4. Test Channel3 API Key
console.log("4. Testing Channel3 Product Search API...");
try {
  if (channel3Key) {
    const startTime = Date.now();
    const response = await fetch("https://api.trychannel3.com/v1/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": channel3Key,
      },
      body: JSON.stringify({ query: "headphones", limit: 2 }),
    });

    const elapsed = Date.now() - startTime;
    if (response.ok) {
      const data = await response.json();
      const productCount = data.products ? data.products.length : 0;
      results.channel3 = {
        status: "SUCCESS",
        productsReturned: productCount,
        latencyMs: elapsed,
      };
      console.log(`   [PASS] Channel3 Search API authenticated in ${elapsed}ms! Products returned: ${productCount}`);
    } else {
      const errText = await response.text();
      results.channel3 = { status: "FAILED", statusCode: response.status, error: errText };
      console.error(`   [FAIL] Channel3 Search API returned (${response.status}):`, errText.slice(0, 200));
    }
  } else {
    results.channel3 = { status: "SKIPPED", details: "Channel3 key missing" };
    console.log("   [SKIP] Channel3 key missing.");
  }
} catch (err) {
  results.channel3 = { status: "ERROR", error: err.message };
  console.error("   [FAIL] Channel3 verification error:", err.message);
}
console.log();

console.log("=================================================");
console.log("                SUMMARY STATUS                   ");
console.log("=================================================");
console.log(`AI Provider & Model  : ${results.ai.status}`);
console.log(`PayPal Sandbox Auth  : ${results.paypal.status}`);
console.log(`Channel3 Catalog API : ${results.channel3.status}`);
console.log("=================================================");

