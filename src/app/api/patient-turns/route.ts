import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { patientTurns, users, auditLogs } from "@/db/schema";
import { eq, and, or, like, desc, count } from "drizzle-orm";
import { seedDatabase } from "@/db/seed";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    await seedDatabase(db);
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";
    const estado = searchParams.get("estado") || "";
    const tipoAtencion = searchParams.get("tipoAtencion") || "";

    const conditions = [];

    if (query) {
      conditions.push(
        or(
          like(patientTurns.codigoTurno, `%${query}%`),
          like(patientTurns.nombreMascota, `%${query}%`),
          like(patientTurns.nombrePropietario, `%${query}%`),
          like(patientTurns.cedulaPropietario, `%${query}%`),
          like(patientTurns.raza, `%${query}%`)
        )
      );
    }

    if (estado && estado !== "todos") {
      conditions.push(eq(patientTurns.estado, estado));
    }

    if (tipoAtencion && tipoAtencion !== "todos") {
      conditions.push(eq(patientTurns.tipoAtencion, tipoAtencion));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const turnsList = await db
      .select({
        id: patientTurns.id,
        codigoTurno: patientTurns.codigoTurno,
        nombreMascota: patientTurns.nombreMascota,
        especie: patientTurns.especie,
        raza: patientTurns.raza,
        nombrePropietario: patientTurns.nombrePropietario,
        cedulaPropietario: patientTurns.cedulaPropietario,
        telefonoPropietario: patientTurns.telefonoPropietario,
        tipoAtencion: patientTurns.tipoAtencion,
        prioridad: patientTurns.prioridad,
        estado: patientTurns.estado,
        consultorioAsignado: patientTurns.consultorioAsignado,
        veterinarioAsignadoId: patientTurns.veterinarioAsignadoId,
        horaLlegada: patientTurns.horaLlegada,
        horaLlamado: patientTurns.horaLlamado,
        horaFin: patientTurns.horaFin,
        notasAtencion: patientTurns.notasAtencion,
        veterinario: {
          id: users.id,
          nombres: users.nombres,
          cargo: users.cargo,
        },
      })
      .from(patientTurns)
      .leftJoin(users, eq(patientTurns.veterinarioAsignadoId, users.id))
      .where(whereClause)
      .orderBy(desc(patientTurns.horaLlegada));

    return NextResponse.json({ success: true, data: turnsList });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const body = await req.json();
    const {
      nombreMascota,
      especie,
      raza,
      nombrePropietario,
      cedulaPropietario,
      telefonoPropietario,
      tipoAtencion,
      prioridad,
      consultorioAsignado,
      veterinarioAsignadoId,
    } = body;

    if (!nombreMascota || !especie || !nombrePropietario || !tipoAtencion) {
      return NextResponse.json(
        { success: false, error: "Faltan campos obligatorios: nombreMascota, especie, nombrePropietario, tipoAtencion" },
        { status: 400 }
      );
    }

    // Auto generate code prefix
    let prefix = "CON";
    if (tipoAtencion.toLowerCase().includes("urgenc")) prefix = "URG";
    else if (tipoAtencion.toLowerCase().includes("vacun")) prefix = "VAC";
    else if (tipoAtencion.toLowerCase().includes("cirug")) prefix = "CIR";
    else if (tipoAtencion.toLowerCase().includes("lab") || tipoAtencion.toLowerCase().includes("exa")) prefix = "EXA";

    // Count existing turns to generate code number
    const totalTurns = await db.select({ value: count() }).from(patientTurns);
    const numSeq = (totalTurns[0]?.value || 0) + 101;
    const codigoTurno = `${prefix}-${numSeq}`;

    const newTurn = await db
      .insert(patientTurns)
      .values({
        codigoTurno,
        nombreMascota: nombreMascota.trim(),
        especie: especie.trim(),
        raza: raza ? raza.trim() : "No especificada",
        nombrePropietario: nombrePropietario.trim(),
        cedulaPropietario: cedulaPropietario ? cedulaPropietario.trim() : "",
        telefonoPropietario: telefonoPropietario ? telefonoPropietario.trim() : "",
        tipoAtencion: tipoAtencion.trim(),
        prioridad: prioridad || "Normal (Triaje 3)",
        estado: "En Espera",
        consultorioAsignado: consultorioAsignado || "Por asignar",
        veterinarioAsignadoId: veterinarioAsignadoId ? parseInt(veterinarioAsignadoId, 10) : null,
      })
      .returning();

    await db.insert(auditLogs).values({
      usuario: "Recepción (Sofía Benítez)",
      accion: "Generar Turno Paciente",
      modulo: "Turnos Pacientes",
      detalles: `Asignado código de turno ${codigoTurno} para la mascota ${nombreMascota} (${especie}) - Propietario: ${nombrePropietario}`,
    });

    return NextResponse.json({ success: true, data: newTurn[0] }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
