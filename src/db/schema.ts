import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

// 1. Usuarios / Personal Veterinario y Administrativo
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  usuario: text("usuario").notNull().unique(), // e.g. lprez@keralty.com
  cedula: text("cedula").notNull().unique(), // e.g. 1013686745
  nombres: text("nombres").notNull(), // e.g. Pedro Neira
  cargo: text("cargo").notNull(), // e.g. Líder, Director, Veterinario Urgencias
  rol: text("rol").notNull(), // e.g. Administrador, Médico Veterinario, Auxiliar, Recepción
  especialidad: text("especialidad").default("General"), // e.g. Urgencias, Cirugía, Consulta, ICU
  telefono: text("telefono"),
  estado: text("estado").notNull().default("Activo"), // Activo, Inactivo
  avatar: text("avatar"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// 2. Mallas de Turnos / Programación de Personal
export const shiftSchedules = sqliteTable("shift_schedules", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  fecha: text("fecha").notNull(), // YYYY-MM-DD
  tipoTurno: text("tipo_turno").notNull(), // Mañana (07:00-15:00), Tarde (15:00-23:00), Noche (23:00-07:00), Guardia 24h, Descanso
  departamento: text("departamento").notNull(), // Urgencias 24h, Consultorios, Quirófano, UCI Vet, Recepción
  consultorio: text("consultorio"), // Consultorio 1, Quirófano A, Box Triaje
  estado: text("estado").default("Programado").notNull(), // Programado, En Curso, Completado, Cancelado
  observaciones: text("observaciones"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// 3. Turnos de Atención a Pacientes / Cola Digital de Espera
export const patientTurns = sqliteTable("patient_turns", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  codigoTurno: text("codigo_turno").notNull(), // e.g. URG-101, CON-042, CIR-008
  nombreMascota: text("nombre_mascota").notNull(), // e.g. Max
  especie: text("especie").notNull(), // Perro, Gato, Ave, Exótico
  raza: text("raza"), // Golden Retriever, Siamés, etc.
  nombrePropietario: text("nombre_propietario").notNull(), // Carlos Gómez
  cedulaPropietario: text("cedula_propietario"),
  telefonoPropietario: text("telefono_propietario"),
  tipoAtencion: text("tipo_atencion").notNull(), // Urgencia Vet, Consulta General, Vacunación, Cirugía, Laboratorio
  prioridad: text("prioridad").notNull().default("Normal"), // Alta / Crítica (T1), Media (T2), Normal (T3)
  estado: text("estado").notNull().default("En Espera"), // En Espera, Llamado, En Atención, Atendido, Ausente
  consultorioAsignado: text("consultorio_asignado"),
  veterinarioAsignadoId: integer("veterinario_asignado_id").references(() => users.id, {
    onDelete: "set null",
  }),
  horaLlegada: integer("hora_llegada", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  horaLlamado: integer("hora_llamado", { mode: "timestamp_ms" }),
  horaFin: integer("hora_fin", { mode: "timestamp_ms" }),
  notasAtencion: text("notas_atencion"),
});

// 4. Solicitudes de Cambio de Turno
export const shiftSwapRequests = sqliteTable("shift_swap_requests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  solicitanteId: integer("solicitante_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  reemplazoId: integer("reemplazo_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  shiftId: integer("shift_id")
    .references(() => shiftSchedules.id, { onDelete: "cascade" })
    .notNull(),
  fecha: text("fecha").notNull(),
  motivo: text("motivo"),
  estado: text("estado").default("Pendiente").notNull(), // Pendiente, Aprobado, Rechazado
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// 5. Historial de Carga de Archivos
export const fileUploadsHistory = sqliteTable("file_uploads_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nombreArchivo: text("nombre_archivo").notNull(),
  tipoContent: text("tipo_content").notNull(), // Malla de Turnos, Listado Personal
  registrosProcesados: integer("registros_procesados").notNull().default(0),
  subidoPor: text("subido_por").notNull(),
  fechaUpload: integer("fecha_upload", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  estado: text("estado").notNull().default("Exitoso"), // Exitoso, Con Advertencias, Fallido
  detalles: text("detalles"),
});

// 6. Registro de Auditoría y Historial
export const auditLogs = sqliteTable("audit_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  usuario: text("usuario").notNull(),
  accion: text("accion").notNull(),
  modulo: text("modulo").notNull(),
  detalles: text("detalles"),
  fecha: integer("fecha", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Types for TypeScript export
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type ShiftSchedule = typeof shiftSchedules.$inferSelect;
export type NewShiftSchedule = typeof shiftSchedules.$inferInsert;
export type PatientTurn = typeof patientTurns.$inferSelect;
export type NewPatientTurn = typeof patientTurns.$inferInsert;
export type ShiftSwapRequest = typeof shiftSwapRequests.$inferSelect;
export type FileUploadHistory = typeof fileUploadsHistory.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
