import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { seedDatabase } from "@/db/seed";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const db = getDb();
    await seedDatabase(db);
    return NextResponse.json({ success: true, message: "Base de datos inicializada correctamente" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const db = getDb();
    await seedDatabase(db);
    return NextResponse.json({ success: true, message: "Verificación e inicialización de base de datos completada" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
