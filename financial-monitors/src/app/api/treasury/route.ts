import { NextResponse } from "next/server";
import { generateTreasuryData } from "@/lib/data/generators";

export async function GET() {
  const data = generateTreasuryData();
  return NextResponse.json(data);
}
