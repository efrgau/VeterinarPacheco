import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { users, auditLogs } from "@/db/schema";
import { eq, like, or, and, desc } from "drizzle-orm";
import { seedDatabase } from "@/db/seed";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    await seedDatabase(db);
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";
    const estado = searchParams.get("estado") || "";
    const rol = searchParams.get("rol") || "";

    const conditions = [];

    if (query) {
      conditions.push(
        or(
          like(users.usuario, `%${query}%`),
          like(users.cedula, `%${query}%`),
          like(users.nombres, `%${query}%`),
          like(users.cargo, `%${query}%`)
        )
      );
    }

    if (estado && estado !== "todos") {
      conditions.push(eq(users.estado, estado));
    }

    if (rol && rol !== "todos") {
      conditions.push(eq(users.rol, rol));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const userList = await db
      .select()
      .from(users)
      .where(whereClause)
      .orderBy(desc(users.id));

    return NextResponse.json({ success: true, data: userList });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const body = await req.json();
    const { usuario, cedula, nombres, cargo, rol, especialidad, telefono, estado, avatar } = body;

    if (!usuario || !cedula || !nombres || !cargo || !rol) {
      return NextResponse.json(
        { success: false, error: "Faltan campos obligatorios: usuario, cedula, nombres, cargo, rol" },
        { status: 400 }
      );
    }

    const newUser = await db
      .insert(users)
      .values({
        usuario: usuario.trim().toLowerCase(),
        cedula: cedula.trim(),
        nombres: nombres.trim(),
        cargo: cargo.trim(),
        rol: rol.trim(),
        especialidad: especialidad ? especialidad.trim() : "General",
        telefono: telefono ? telefono.trim() : "",
        estado: estado || "Activo",
        avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(nombres)}`,
      })
      .returning();

    // Log to audit history
    await db.insert(auditLogs).values({
      usuario: "Administrador (Laura Carolina)",
      accion: "Crear Usuario",
      modulo: "Administrar Usuarios",
      detalles: `Se asoció el usuario ${nombres} (${usuario}) con rol ${rol} y cargo ${cargo}`,
    });

    return NextResponse.json({ success: true, data: newUser[0] }, { status: 201 });
  } catch (error: any) {
    const msg = error?.message ?? "";
    if (error?.code === "23505" || msg.includes("UNIQUE constraint failed")) {
      return NextResponse.json(
        { success: false, error: "El usuario o la cédula ya se encuentra registrado en el sistema." },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
