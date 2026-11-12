import {
  CheckoutPaymentIntent,
  Client,
  Environment,
  OrdersController,
} from "@paypal/paypal-server-sdk";
import { env } from "@/lib/env";

/**
 * Payment Executor — the ONLY module allowed to hold PayPal credentials.
 * Imported only by the trusted pipeline after a Gate PASS; never by lib/agent.
 *
 * Uses the official PayPal Server SDK (@paypal/paypal-server-sdk), generated
 * via APIMatic ContextMatic. All methods and models adhere to OpenAPI 3.1 specifications.
 */

export function isPayPalConfigured(): boolean {
  const e = env();
  return !!(e.PAYPAL_CLIENT_ID && e.PAYPAL_CLIENT_SECRET);
}

export type PaymentHandoff =
  | { status: "NOT_CONFIGURED"; message: string }
  | { status: "CREATED"; orderId: string; amount: string; currency: string; proofId?: string }
  | { status: "FAILED"; error: string; amount: string; currency: string };

function getClient(): Client {
  const e = env();
  return new Client({
    clientCredentialsAuthCredentials: {
      oAuthClientId: e.PAYPAL_CLIENT_ID,
      oAuthClientSecret: e.PAYPAL_CLIENT_SECRET,
    },
    environment: Environment.Sandbox,
  });
}

/**
 * Creates an order in the PayPal Sandbox environment via OrdersController.
 * Called only by the trusted pipeline after the Policy Gate returns PASS.
 * Amount is the gate's computed total, strictly re-verified against catalog data.
 */
export async function createPayPalOrder(
  computedTotal: string,
  currency: string,
  description = "SentinelPay Authorized Purchase",
): Promise<PaymentHandoff> {
  if (!isPayPalConfigured()) {
    return {
      status: "NOT_CONFIGURED",
      message: "Gate passed. PayPal sandbox credentials are not configured yet, so no order was created.",
    };
  }

  try {
    const client = getClient();
    const ordersController = new OrdersController(client);

    const response = await ordersController.createOrder({
      body: {
        intent: CheckoutPaymentIntent.Capture,
        purchaseUnits: [
          {
            amount: {
              currencyCode: currency,
              value: computedTotal,
            },
            description,
          },
        ],
      },
    });

    const orderId = response.result?.id;
    if (!orderId) {
      return {
        status: "FAILED",
        error: "PayPal API did not return an order ID",
        amount: computedTotal,
        currency,
      };
    }

    return {
      status: "CREATED",
      orderId,
      amount: computedTotal,
      currency,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      status: "FAILED",
      error: errorMsg,
      amount: computedTotal,
      currency,
    };
  }
}

/** Legacy alias called by pipeline. Amount is the gate's computed total, never agent text. */
export async function preparePayment(
  computedTotal: string,
  currency: string,
  description?: string,
): Promise<PaymentHandoff> {
  return createPayPalOrder(computedTotal, currency, description);
}
