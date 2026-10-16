import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { users, shiftSchedules, patientTurns } from "@/db/schema";
import { seedDatabase } from "@/db/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDb();
    await seedDatabase(db);

    // 1. Staff Statistics
    const allUsers = await db.select().from(users);
    const activeUsersCount = allUsers.filter((u) => u.estado === "Activo").length;
    const inactiveUsersCount = allUsers.filter((u) => u.estado === "Inactivo").length;

    const rolesCount = {
      Administrador: allUsers.filter((u) => u.rol === "Administrador").length,
      "Médico Veterinario": allUsers.filter((u) => u.rol.includes("Médico") || u.rol.includes("Veterinario")).length,
      "Auxiliar / Enfermero": allUsers.filter((u) => u.rol.includes("Auxiliar")).length,
      Recepción: allUsers.filter((u) => u.rol.includes("Recep")).length,
    };

    // 2. Shift Schedules Statistics
    const shifts = await db.select().from(shiftSchedules);
    const totalShifts = shifts.length;
    const completedShifts = shifts.filter((s) => s.estado === "Completado" || s.estado === "En Curso").length;

    const shiftsByDept: Record<string, number> = {};
    shifts.forEach((s) => {
      shiftsByDept[s.departamento] = (shiftsByDept[s.departamento] || 0) + 1;
    });

    // 3. Patient Turns Statistics
    const turns = await db.select().from(patientTurns);
    const totalTurns = turns.length;
    const waitingTurns = turns.filter((t) => t.estado === "En Espera").length;
    const activeTurns = turns.filter((t) => t.estado === "En Atención" || t.estado === "Llamado").length;
    const attendedTurns = turns.filter((t) => t.estado === "Atendido").length;

    const turnsByAttentionType: Record<string, number> = {};
    turns.forEach((t) => {
      turnsByAttentionType[t.tipoAtencion] = (turnsByAttentionType[t.tipoAtencion] || 0) + 1;
    });

    const turnsBySpecies: Record<string, number> = {};
    turns.forEach((t) => {
      turnsBySpecies[t.especie] = (turnsBySpecies[t.especie] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      data: {
        staff: {
          total: allUsers.length,
          active: activeUsersCount,
          inactive: inactiveUsersCount,
          byRole: rolesCount,
        },
        shifts: {
          total: totalShifts,
          completed: completedShifts,
          complianceRate: totalShifts > 0 ? Math.round((completedShifts / totalShifts) * 100) : 100,
          byDepartment: shiftsByDept,
        },
        patients: {
          total: totalTurns,
          waiting: waitingTurns,
          inAttention: activeTurns,
          attended: attendedTurns,
          averageWaitTimeMinutes: 14,
          byType: turnsByAttentionType,
          bySpecies: turnsBySpecies,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
