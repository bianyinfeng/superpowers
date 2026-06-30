import { NextResponse } from "next/server";
import { generateGoldData } from "@/lib/data/generators";

export async function GET() {
  const data = generateGoldData();
  return NextResponse.json(data);
}
