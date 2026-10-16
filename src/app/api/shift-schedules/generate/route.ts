import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { users, shiftSchedules, auditLogs, NewShiftSchedule } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const body = await req.json();
    const { startDate } = body;

    if (!startDate) {
      return NextResponse.json({ success: false, error: "Se requiere la fecha de inicio (startDate)" }, { status: 400 });
    }

    const start = new Date(startDate);
    const activeStaff = await db.select().from(users).where(eq(users.estado, "Activo"));

    if (activeStaff.length === 0) {
      return NextResponse.json({ success: false, error: "No hay personal activo para generar la malla de turnos." }, { status: 400 });
    }

    const shiftTypes = [
      "Mañana (07:00 - 15:00)",
      "Tarde (15:00 - 23:00)",
      "Noche / Guardia (23:00 - 07:00)",
    ];

    const departments = [
      { name: "Urgencias 24h", room: "Box Urgencias 1" },
      { name: "Consultorios Generales", room: "Consultorio 1" },
      { name: "Quirófano / Cirugía", room: "Quirófano A" },
      { name: "UCI Vet / Hospitalización", room: "UCI Box" },
      { name: "Recepción / Admisiones", room: "Módulo Principal" },
    ];

    const generatedShifts: NewShiftSchedule[] = [];

    // For 7 days starting from startDate
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const currentDay = new Date(start);
      currentDay.setDate(start.getDate() + dayOffset);
      const dateStr = currentDay.toISOString().split("T")[0];

      activeStaff.forEach((staffMember, index) => {
        const rotationKey = (index + dayOffset) % 5;
        const esp = staffMember.especialidad || "General";

        if (rotationKey === 4) {
          generatedShifts.push({
            userId: staffMember.id,
            fecha: dateStr,
            tipoTurno: "Descanso",
            departamento: esp.includes("Urgencia") ? "Urgencias 24h" : "Consultorios Generales",
            consultorio: "N/A",
            estado: "Programado",
            observaciones: "Día de descanso programado por malla inteligente",
          });
        } else {
          let dept = departments[index % departments.length];
          let shiftType = shiftTypes[(index + dayOffset) % shiftTypes.length];

          if (esp.includes("Urgencia")) {
            dept = departments[0];
          } else if (esp.includes("Cirug")) {
            dept = departments[2];
          } else if (staffMember.rol.includes("Recep")) {
            dept = departments[4];
            shiftType = dayOffset % 2 === 0 ? shiftTypes[0] : shiftTypes[1];
          }

          generatedShifts.push({
            userId: staffMember.id,
            fecha: dateStr,
            tipoTurno: shiftType,
            departamento: dept.name,
            consultorio: dept.room,
            estado: "Programado",
            observaciones: `Asignación automática Malla Vet - Turno ${shiftType}`,
          });
        }
      });
    }

    const inserted = await db.insert(shiftSchedules).values(generatedShifts).returning();

    await db.insert(auditLogs).values({
      usuario: "Administrador (Laura Carolina)",
      accion: "Generación Automática Malla Turnos",
      modulo: "Generar Mallas Turnos",
      detalles: `Se generó automáticamente la malla para 7 días a partir del ${startDate}. Se crearon ${inserted.length} turnos.`,
    });

    return NextResponse.json({
      success: true,
      message: `Malla generada con éxito: ${inserted.length} turnos programados.`,
      count: inserted.length,
      data: inserted,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
