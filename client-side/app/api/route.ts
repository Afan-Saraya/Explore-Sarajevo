import { NextResponse } from "next/server";
import collectionData from "./data.json";

export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return NextResponse.json(collectionData);
}
