export type TransactionRecord = {
  id: string;
  mandateId: string;
  agent: string;
  prompt: string;
  merchant: string;
  amount: string;
  currency: string;
  riskScore: number;
  status: "APPROVED" | "CAPTURED" | "BLOCKED" | "NEEDS_APPROVAL" | "FAILED";
  timestamp: string;
  paypalOrderId?: string;
  proofId?: string;
  proofHash?: string;
  signature?: string;
  items: {
    productId: string;
    title: string;
    merchant: string;
    price: string;
    category?: string;
  }[];
  rulesEvaluated: {
    rule: string;
    passed: boolean;
    detail: string;
    severity: "hard" | "soft";
  }[];
  injection: {
    detected: boolean;
    confidence: number;
    evidence: string[];
    quotedPayload?: string;
  };
  approvalId?: string;
};

export type TransactionStats = {
  totalCount: number;
  approvedCount: number;
  blockedCount: number;
  pendingApprovalsCount: number;
  totalVolume: number;
  riskAlertRate: number;
};

