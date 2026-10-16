import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { shiftSchedules, users, auditLogs } from "@/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { seedDatabase } from "@/db/seed";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    await seedDatabase(db);
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const departamento = searchParams.get("departamento");

    const conditions = [];

    if (userId) {
      conditions.push(eq(shiftSchedules.userId, parseInt(userId, 10)));
    }
    if (startDate) {
      conditions.push(gte(shiftSchedules.fecha, startDate));
    }
    if (endDate) {
      conditions.push(lte(shiftSchedules.fecha, endDate));
    }
    if (departamento && departamento !== "todos") {
      conditions.push(eq(shiftSchedules.departamento, departamento));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const results = await db
      .select({
        id: shiftSchedules.id,
        userId: shiftSchedules.userId,
        fecha: shiftSchedules.fecha,
        tipoTurno: shiftSchedules.tipoTurno,
        departamento: shiftSchedules.departamento,
        consultorio: shiftSchedules.consultorio,
        estado: shiftSchedules.estado,
        observaciones: shiftSchedules.observaciones,
        createdAt: shiftSchedules.createdAt,
        user: {
          id: users.id,
          usuario: users.usuario,
          nombres: users.nombres,
          cargo: users.cargo,
          rol: users.rol,
          especialidad: users.especialidad,
          avatar: users.avatar,
        },
      })
      .from(shiftSchedules)
      .innerJoin(users, eq(shiftSchedules.userId, users.id))
      .where(whereClause)
      .orderBy(shiftSchedules.fecha, shiftSchedules.tipoTurno);

    return NextResponse.json({ success: true, data: results });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const body = await req.json();
    const { userId, fecha, tipoTurno, departamento, consultorio, observaciones } = body;

    if (!userId || !fecha || !tipoTurno || !departamento) {
      return NextResponse.json(
        { success: false, error: "Faltan datos requeridos: userId, fecha, tipoTurno, departamento" },
        { status: 400 }
      );
    }

    const newShift = await db
      .insert(shiftSchedules)
      .values({
        userId: parseInt(userId, 10),
        fecha,
        tipoTurno,
        departamento,
        consultorio: consultorio || "Sin asignar",
        estado: "Programado",
        observaciones: observaciones || "",
      })
      .returning();

    await db.insert(auditLogs).values({
      usuario: "Administrador (Laura Carolina)",
      accion: "Crear Turno de Personal",
      modulo: "Generar Mallas Turnos",
      detalles: `Asignado turno ${tipoTurno} en ${departamento} para el usuario ID ${userId} el día ${fecha}`,
    });

    return NextResponse.json({ success: true, data: newShift[0] }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
