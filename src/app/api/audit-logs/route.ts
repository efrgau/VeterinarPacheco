import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { auditLogs } from "@/db/schema";
import { desc } from "drizzle-orm";
import { seedDatabase } from "@/db/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDb();
    await seedDatabase(db);
    const logs = await db.select().from(auditLogs).orderBy(desc(auditLogs.fecha)).limit(100);
    return NextResponse.json({ success: true, data: logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
