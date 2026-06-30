import { NextResponse } from "next/server";
import { generateUSDData } from "@/lib/data/generators";

export async function GET() {
  const data = generateUSDData();
  return NextResponse.json(data);
}
