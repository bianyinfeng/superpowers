import { NextResponse } from "next/server";
import { generateInflationData } from "@/lib/data/generators";

export async function GET() {
  const data = generateInflationData();
  return NextResponse.json(data);
}
