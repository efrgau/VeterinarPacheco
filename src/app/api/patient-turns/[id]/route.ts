import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { patientTurns, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getDb();
    const { id } = await params;
    const turnId = parseInt(id, 10);
    if (isNaN(turnId)) {
      return NextResponse.json({ success: false, error: "ID de turno inválido" }, { status: 400 });
    }

    const body = await req.json();

    const updateFields: Record<string, any> = {};

    if (body.estado !== undefined) {
      updateFields.estado = body.estado;
      if (body.estado === "Llamado") {
        updateFields.horaLlamado = new Date();
      } else if (body.estado === "Atendido") {
        updateFields.horaFin = new Date();
      }
    }

    if (body.consultorioAsignado !== undefined) {
      updateFields.consultorioAsignado = body.consultorioAsignado;
    }

    if (body.veterinarioAsignadoId !== undefined) {
      updateFields.veterinarioAsignadoId = body.veterinarioAsignadoId ? parseInt(body.veterinarioAsignadoId, 10) : null;
    }

    if (body.notasAtencion !== undefined) {
      updateFields.notasAtencion = body.notasAtencion;
    }

    if (body.prioridad !== undefined) {
      updateFields.prioridad = body.prioridad;
    }

    const updated = await db
      .update(patientTurns)
      .set(updateFields)
      .where(eq(patientTurns.id, turnId))
      .returning();

    if (!updated.length) {
      return NextResponse.json({ success: false, error: "Turno no encontrado" }, { status: 404 });
    }

    await db.insert(auditLogs).values({
      usuario: "Sistema Keralty Vet",
      accion: "Actualizar Estado Turno Paciente",
      modulo: "Turnos Pacientes",
      detalles: `Turno ${updated[0].codigoTurno} (${updated[0].nombreMascota}) actualizado a estado: ${updated[0].estado} - Consultorio: ${updated[0].consultorioAsignado || "N/A"}`,
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
    const turnId = parseInt(id, 10);
    if (isNaN(turnId)) {
      return NextResponse.json({ success: false, error: "ID de turno inválido" }, { status: 400 });
    }

    const deleted = await db.delete(patientTurns).where(eq(patientTurns.id, turnId)).returning();

    return NextResponse.json({ success: true, data: deleted[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
