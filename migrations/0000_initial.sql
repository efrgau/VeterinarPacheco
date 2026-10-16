-- Migración inicial D1 (SQLite) — generada para `veterinary-appointment-booking-app`
-- Aplicar con:
--   Local:  npm run db:migrate:local
--   Remote: npm run db:migrate:remote

CREATE TABLE IF NOT EXISTS `users` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `usuario` text NOT NULL,
  `cedula` text NOT NULL,
  `nombres` text NOT NULL,
  `cargo` text NOT NULL,
  `rol` text NOT NULL,
  `especialidad` text DEFAULT 'General',
  `telefono` text,
  `estado` text DEFAULT 'Activo' NOT NULL,
  `avatar` text,
  `created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `users_usuario_unique` ON `users` (`usuario`);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `users_cedula_unique` ON `users` (`cedula`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `shift_schedules` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `user_id` integer NOT NULL REFERENCES `users`(`id`) ON DELETE cascade,
  `fecha` text NOT NULL,
  `tipo_turno` text NOT NULL,
  `departamento` text NOT NULL,
  `consultorio` text,
  `estado` text DEFAULT 'Programado' NOT NULL,
  `observaciones` text,
  `created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `patient_turns` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `codigo_turno` text NOT NULL,
  `nombre_mascota` text NOT NULL,
  `especie` text NOT NULL,
  `raza` text,
  `nombre_propietario` text NOT NULL,
  `cedula_propietario` text,
  `telefono_propietario` text,
  `tipo_atencion` text NOT NULL,
  `prioridad` text DEFAULT 'Normal' NOT NULL,
  `estado` text DEFAULT 'En Espera' NOT NULL,
  `consultorio_asignado` text,
  `veterinario_asignado_id` integer REFERENCES `users`(`id`) ON DELETE set null,
  `hora_llegada` integer NOT NULL,
  `hora_llamado` integer,
  `hora_fin` integer,
  `notas_atencion` text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `shift_swap_requests` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `solicitante_id` integer NOT NULL REFERENCES `users`(`id`) ON DELETE cascade,
  `reemplazo_id` integer NOT NULL REFERENCES `users`(`id`) ON DELETE cascade,
  `shift_id` integer NOT NULL REFERENCES `shift_schedules`(`id`) ON DELETE cascade,
  `fecha` text NOT NULL,
  `motivo` text,
  `estado` text DEFAULT 'Pendiente' NOT NULL,
  `created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `file_uploads_history` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `nombre_archivo` text NOT NULL,
  `tipo_content` text NOT NULL,
  `registros_procesados` integer DEFAULT 0 NOT NULL,
  `subido_por` text NOT NULL,
  `fecha_upload` integer NOT NULL,
  `estado` text DEFAULT 'Exitoso' NOT NULL,
  `detalles` text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `usuario` text NOT NULL,
  `accion` text NOT NULL,
  `modulo` text NOT NULL,
  `detalles` text,
  `fecha` integer NOT NULL
);
