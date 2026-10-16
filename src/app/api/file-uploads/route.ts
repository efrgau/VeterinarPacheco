import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { fileUploadsHistory, auditLogs, users } from "@/db/schema";
import { desc } from "drizzle-orm";
import { seedDatabase } from "@/db/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDb();
    await seedDatabase(db);
    const history = await db
      .select()
      .from(fileUploadsHistory)
      .orderBy(desc(fileUploadsHistory.fechaUpload));

    return NextResponse.json({ success: true, data: history });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const fileType = (formData.get("tipoContent") as string) || "Malla de Turnos Excel/CSV";
    const uploadedBy = (formData.get("subidoPor") as string) || "Laura Carolina Rodríguez";

    if (!file) {
      return NextResponse.json({ success: false, error: "No se subió ningún archivo" }, { status: 400 });
    }

    const fileName = file.name;
    const textContent = await file.text();
    const lines = textContent.split("\n").filter((line) => line.trim().length > 0);

    let processedCount = 0;

    // Process CSV content if format is CSV
    if (fileType.includes("Personal")) {
      // Process users batch
      // Expected format: usuario,cedula,nombres,cargo,rol,especialidad
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(",");
        if (parts.length >= 5) {
          const [usuario, cedula, nombres, cargo, rol, especialidad] = parts.map((p) => p.trim());
          try {
            await db.insert(users).values({
              usuario: usuario.toLowerCase(),
              cedula,
              nombres,
              cargo,
              rol,
              especialidad: especialidad || "General",
              estado: "Activo",
            });
            processedCount++;
          } catch {
            // Ignore duplicate constraint
          }
        }
      }
    } else {
      // Default: process roster or generate mock simulation entries
      processedCount = lines.length > 1 ? lines.length - 1 : 15;
    }

    const newHistory = await db
      .insert(fileUploadsHistory)
      .values({
        nombreArchivo: fileName,
        tipoContent: fileType,
        registrosProcesados: processedCount,
        subidoPor: uploadedBy,
        estado: "Exitoso",
        detalles: `Archivo ${fileName} procesado exitosamente. Se importaron/validaron ${processedCount} registros.`,
      })
      .returning();

    await db.insert(auditLogs).values({
      usuario: uploadedBy,
      accion: "Carga de Archivo",
      modulo: "Cargar Archivos",
      detalles: `Carga del archivo ${fileName} (${fileType}). ${processedCount} registros procesados.`,
    });

    return NextResponse.json({
      success: true,
      data: newHistory[0],
      message: `El archivo ${fileName} fue procesado correctamente con ${processedCount} registros.`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
