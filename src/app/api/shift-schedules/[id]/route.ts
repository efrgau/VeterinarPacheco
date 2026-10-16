import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { shiftSchedules, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getDb();
    const { id } = await params;
    const shiftId = parseInt(id, 10);
    if (isNaN(shiftId)) {
      return NextResponse.json({ success: false, error: "ID de turno inválido" }, { status: 400 });
    }

    const body = await req.json();

    const updated = await db
      .update(shiftSchedules)
      .set({
        ...(body.fecha && { fecha: body.fecha }),
        ...(body.tipoTurno && { tipoTurno: body.tipoTurno }),
        ...(body.departamento && { departamento: body.departamento }),
        ...(body.consultorio !== undefined && { consultorio: body.consultorio }),
        ...(body.estado && { estado: body.estado }),
        ...(body.observaciones !== undefined && { observaciones: body.observaciones }),
      })
      .where(eq(shiftSchedules.id, shiftId))
      .returning();

    await db.insert(auditLogs).values({
      usuario: "Administrador (Laura Carolina)",
      accion: "Actualizar Turno Personal",
      modulo: "Generar Mallas Turnos",
      detalles: `Modificado turno ID ${shiftId}. Nuevo estado: ${updated[0]?.estado}`,
    });

    return NextResponse.json({ success: true, data: updated[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getDb();
    const { id } = await params;
    const shiftId = parseInt(id, 10);
    if (isNaN(shiftId)) {
      return NextResponse.json({ success: false, error: "ID de turno inválido" }, { status: 400 });
    }

    const deleted = await db.delete(shiftSchedules).where(eq(shiftSchedules.id, shiftId)).returning();

    await db.insert(auditLogs).values({
      usuario: "Administrador (Laura Carolina)",
      accion: "Eliminar Turno Personal",
      modulo: "Generar Mallas Turnos",
      detalles: `Eliminado turno ID ${shiftId}`,
    });

    return NextResponse.json({ success: true, data: deleted[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
