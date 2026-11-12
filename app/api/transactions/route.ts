import { NextResponse } from "next/server";
import { getTransactions } from "@/lib/transactions/service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getTransactions();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

