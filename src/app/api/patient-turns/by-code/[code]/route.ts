import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { patientTurns, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const db = getDb();
    const { code } = await params;
    if (!code) {
      return NextResponse.json({ success: false, error: "Código de turno no proporcionado" }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    const turnResult = await db
      .select({
        id: patientTurns.id,
        codigoTurno: patientTurns.codigoTurno,
        nombreMascota: patientTurns.nombreMascota,
        especie: patientTurns.especie,
        raza: patientTurns.raza,
        nombrePropietario: patientTurns.nombrePropietario,
        tipoAtencion: patientTurns.tipoAtencion,
        prioridad: patientTurns.prioridad,
        estado: patientTurns.estado,
        consultorioAsignado: patientTurns.consultorioAsignado,
        horaLlegada: patientTurns.horaLlegada,
        horaLlamado: patientTurns.horaLlamado,
        veterinario: {
          nombres: users.nombres,
          cargo: users.cargo,
        },
      })
      .from(patientTurns)
      .leftJoin(users, eq(patientTurns.veterinarioAsignadoId, users.id))
      .where(eq(patientTurns.codigoTurno, cleanCode))
      .limit(1);

    if (!turnResult.length) {
      return NextResponse.json({ success: false, error: "No se encontró ningún turno con ese código" }, { status: 404 });
    }

    // Count turns ahead in waiting state
    const currentTurn = turnResult[0];
    let turnsAhead = 0;

    if (currentTurn.estado === "En Espera") {
      const waitingTurns = await db
        .select()
        .from(patientTurns)
        .where(eq(patientTurns.estado, "En Espera"));

      turnsAhead = waitingTurns.filter(
        (t) => new Date(t.horaLlegada).getTime() < new Date(currentTurn.horaLlegada).getTime()
      ).length;
    }

    return NextResponse.json({
      success: true,
      data: {
        ...currentTurn,
        turnsAhead,
        estimatedMinutes: turnsAhead * 12,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
