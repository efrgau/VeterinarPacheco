import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { users, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getDb();
    const { id } = await params;
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ success: false, error: "ID de usuario inválido" }, { status: 400 });
    }

    const body = await req.json();

    const existingUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!existingUser.length) {
      return NextResponse.json({ success: false, error: "Usuario no encontrado" }, { status: 404 });
    }

    const updated = await db
      .update(users)
      .set({
        ...(body.usuario && { usuario: body.usuario.trim().toLowerCase() }),
        ...(body.cedula && { cedula: body.cedula.trim() }),
        ...(body.nombres && { nombres: body.nombres.trim() }),
        ...(body.cargo && { cargo: body.cargo.trim() }),
        ...(body.rol && { rol: body.rol.trim() }),
        ...(body.especialidad && { especialidad: body.especialidad.trim() }),
        ...(body.telefono !== undefined && { telefono: body.telefono }),
        ...(body.estado && { estado: body.estado }),
        ...(body.avatar && { avatar: body.avatar }),
      })
      .where(eq(users.id, userId))
      .returning();

    // Log action
    await db.insert(auditLogs).values({
      usuario: "Administrador (Laura Carolina)",
      accion: body.estado !== undefined && Object.keys(body).length === 1 ? "Cambio Estado Usuario" : "Editar Usuario",
      modulo: "Administrar Usuarios",
      detalles: `Usuario ID ${userId} (${updated[0].nombres}) actualizado. Estado actual: ${updated[0].estado}`,
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
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ success: false, error: "ID de usuario inválido" }, { status: 400 });
    }

    const deleted = await db.delete(users).where(eq(users.id, userId)).returning();

    if (deleted.length > 0) {
      await db.insert(auditLogs).values({
        usuario: "Administrador (Laura Carolina)",
        accion: "Eliminar Usuario",
        modulo: "Administrar Usuarios",
        detalles: `Se eliminó el usuario ${deleted[0].nombres} (${deleted[0].usuario})`,
      });
    }

    return NextResponse.json({ success: true, data: deleted[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
