import { users, shiftSchedules, patientTurns, fileUploadsHistory, auditLogs } from "./schema";
import { count } from "drizzle-orm";
import type { AppDb } from "./index";

export async function seedDatabase(db: AppDb) {
  try {
    const userCountRes = await db.select({ value: count() }).from(users);
    if (userCountRes[0]?.value > 0) {
      console.log("Database already seeded.");
      return;
    }

    console.log("Seeding initial data for Opti Turnos Keralty Vet...");

    // 1. Seed Users (Matching screenshot + veterinary staff)
    const insertedUsers = await db.insert(users).values([
      {
        usuario: "lprez@keralty.com",
        cedula: "1013686745",
        nombres: "Pedro Neira",
        cargo: "Líder",
        rol: "Administrador",
        especialidad: "Gestión Operativa",
        telefono: "+57 300 123 4567",
        estado: "Activo",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      },
      {
        usuario: "pneira@keralty.com",
        cedula: "1135678909",
        nombres: "Laura perez",
        cargo: "Director",
        rol: "Administrador",
        especialidad: "Administración Médica",
        telefono: "+57 310 987 6543",
        estado: "Inactivo",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      },
      {
        usuario: "lrodriguez@keralty.com",
        cedula: "1020304050",
        nombres: "Laura Carolina Rodríguez",
        cargo: "Directora General Vet",
        rol: "Administrador",
        especialidad: "Coordinación Médica",
        telefono: "+57 315 555 0192",
        estado: "Activo",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      },
      {
        usuario: "carango@keraltyvet.com",
        cedula: "1014589201",
        nombres: "Dr. Camilo Arango",
        cargo: "Médico Urgencista",
        rol: "Médico Veterinario",
        especialidad: "Urgencias 24h",
        telefono: "+57 301 222 3344",
        estado: "Activo",
        avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
      },
      {
        usuario: "mtorres@keraltyvet.com",
        cedula: "1018992033",
        nombres: "Dra. María Paula Torres",
        cargo: "Cirujana Principal",
        rol: "Médico Veterinario",
        especialidad: "Cirugía General",
        telefono: "+57 312 888 9911",
        estado: "Activo",
        avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80",
      },
      {
        usuario: "agomez@keraltyvet.com",
        cedula: "1023456789",
        nombres: "Andrés Felipe Gómez",
        cargo: "Auxiliar UCI Vet",
        rol: "Auxiliar / Enfermero",
        especialidad: "Hospitalización",
        telefono: "+57 318 444 5566",
        estado: "Activo",
        avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80",
      },
      {
        usuario: "sbenitez@keraltyvet.com",
        cedula: "1032112344",
        nombres: "Sofía Benítez",
        cargo: "Recepción y Admisión",
        rol: "Recepción",
        especialidad: "Atención al Cliente",
        telefono: "+57 305 777 8899",
        estado: "Activo",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      },
    ]).returning();

    const drCamilo = insertedUsers.find((u) => u.usuario === "carango@keraltyvet.com") || insertedUsers[0];
    const draMaria = insertedUsers.find((u) => u.usuario === "mtorres@keraltyvet.com") || insertedUsers[1];
    const auxAndres = insertedUsers.find((u) => u.usuario === "agomez@keraltyvet.com") || insertedUsers[2];

    // Helper for formatted dates YYYY-MM-DD
    const today = new Date();
    const getFormattedDate = (offsetDays: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() + offsetDays);
      return d.toISOString().split("T")[0];
    };

    // 2. Seed Shift Schedules (Mallas de turnos)
    await db.insert(shiftSchedules).values([
      {
        userId: drCamilo.id,
        fecha: getFormattedDate(0),
        tipoTurno: "Mañana (07:00 - 15:00)",
        departamento: "Urgencias 24h",
        consultorio: "Box Urgencias 1",
        estado: "En Curso",
        observaciones: "Turno prioritario de urgencias caninas y felinas",
      },
      {
        userId: draMaria.id,
        fecha: getFormattedDate(0),
        tipoTurno: "Mañana (07:00 - 15:00)",
        departamento: "Quirófano / Cirugía",
        consultorio: "Quirófano A",
        estado: "En Curso",
        observaciones: "Cirugías programadas en la mañana, emergencias en la tarde",
      },
      {
        userId: auxAndres.id,
        fecha: getFormattedDate(0),
        tipoTurno: "Mañana (07:00 - 15:00)",
        departamento: "UCI Vet / Hospitalización",
        consultorio: "UCI Caninos",
        estado: "En Curso",
        observaciones: "Monitoreo de pacientes posoperatorios",
      },
      {
        userId: drCamilo.id,
        fecha: getFormattedDate(1),
        tipoTurno: "Tarde (15:00 - 23:00)",
        departamento: "Consultorios Generales",
        consultorio: "Consultorio 2",
        estado: "Programado",
        observaciones: "Consultas externas y vacunas",
      },
      {
        userId: draMaria.id,
        fecha: getFormattedDate(1),
        tipoTurno: "Noche / Guardia (23:00 - 07:00)",
        departamento: "Urgencias 24h",
        consultorio: "Urgencias 24h",
        estado: "Programado",
        observaciones: "Guardia nocturna especial",
      },
      {
        userId: auxAndres.id,
        fecha: getFormattedDate(1),
        tipoTurno: "Tarde (15:00 - 23:00)",
        departamento: "Quirófano / Cirugía",
        consultorio: "Quirófano B",
        estado: "Programado",
        observaciones: "Asistencia quirúrgica",
      },
      {
        userId: drCamilo.id,
        fecha: getFormattedDate(2),
        tipoTurno: "Descanso",
        departamento: "Urgencias 24h",
        consultorio: "N/A",
        estado: "Programado",
        observaciones: "Descanso obligatorio tras turno de guardia",
      },
    ]);

    // 3. Seed Patient Turns (Cola de Atención a Pacientes)
    await db.insert(patientTurns).values([
      {
        codigoTurno: "URG-101",
        nombreMascota: "Max",
        especie: "Perro",
        raza: "Golden Retriever",
        nombrePropietario: "Carlos Gómez",
        cedulaPropietario: "80123456",
        telefonoPropietario: "3001112233",
        tipoAtencion: "Urgencia Vet",
        prioridad: "Alta / Crítica (Triaje 1)",
        estado: "En Atención",
        consultorioAsignado: "Box Urgencias 1",
        veterinarioAsignadoId: drCamilo.id,
        horaLlegada: new Date(Date.now() - 45 * 60000),
        horaLlamado: new Date(Date.now() - 15 * 60000),
        notasAtencion: "Paciente ingresa por politraumatismo leve en patita trasera.",
      },
      {
        codigoTurno: "CON-042",
        nombreMascota: "Luna",
        especie: "Gato",
        raza: "Siamés",
        nombrePropietario: "Ana María Duque",
        cedulaPropietario: "52441990",
        telefonoPropietario: "3114445566",
        tipoAtencion: "Consulta General",
        prioridad: "Normal (Triaje 3)",
        estado: "Llamado",
        consultorioAsignado: "Consultorio 1",
        veterinarioAsignadoId: draMaria.id,
        horaLlegada: new Date(Date.now() - 30 * 60000),
        horaLlamado: new Date(Date.now() - 2 * 60000),
        notasAtencion: "Control de peso y desparasitación anual.",
      },
      {
        codigoTurno: "VAC-015",
        nombreMascota: "Tobias",
        especie: "Perro",
        raza: "Beagle",
        nombrePropietario: "Jorge Eliécer",
        cedulaPropietario: "10293847",
        telefonoPropietario: "3158889900",
        tipoAtencion: "Vacunación / Control",
        prioridad: "Normal (Triaje 3)",
        estado: "En Espera",
        consultorioAsignado: "Consultorio 2",
        horaLlegada: new Date(Date.now() - 20 * 60000),
      },
      {
        codigoTurno: "CIR-008",
        nombreMascota: "Pelusa",
        especie: "Gato",
        raza: "Persa",
        nombrePropietario: "Valentina Ríos",
        cedulaPropietario: "10172839",
        telefonoPropietario: "3019998877",
        tipoAtencion: "Cirugía / Procedimiento",
        prioridad: "Media (Triaje 2)",
        estado: "En Espera",
        consultorioAsignado: "Quirófano A",
        veterinarioAsignadoId: draMaria.id,
        horaLlegada: new Date(Date.now() - 10 * 60000),
      },
      {
        codigoTurno: "EXA-003",
        nombreMascota: "Kira",
        especie: "Perro",
        raza: "Pastor Alemán",
        nombrePropietario: "Esteban Morales",
        cedulaPropietario: "79881234",
        telefonoPropietario: "3103332211",
        tipoAtencion: "Exámenes / Lab",
        prioridad: "Normal (Triaje 3)",
        estado: "Atendido",
        consultorioAsignado: "Laboratorio",
        horaLlegada: new Date(Date.now() - 120 * 60000),
        horaLlamado: new Date(Date.now() - 90 * 60000),
        horaFin: new Date(Date.now() - 30 * 60000),
        notasAtencion: "Muestra de sangre tomada correctamente para perfil hepático.",
      },
    ]);

    // 4. Seed File Uploads History
    await db.insert(fileUploadsHistory).values([
      {
        nombreArchivo: "malla_turnos_noviembre_2026.xlsx",
        tipoContent: "Malla de Turnos Excel/CSV",
        registrosProcesados: 48,
        subidoPor: "Laura Carolina Rodríguez",
        estado: "Exitoso",
        detalles: "Se cargaron 48 turnos de personal médico para las sedes Norte y Centro.",
      },
      {
        nombreArchivo: "listado_veterinarios_actualizado.csv",
        tipoContent: "Listado Personal",
        registrosProcesados: 12,
        subidoPor: "Pedro Neira",
        estado: "Exitoso",
        detalles: "Nuevas altas de auxiliares e incorporación de especialista en ecografía.",
      },
    ]);

    // 5. Seed Audit Logs
    await db.insert(auditLogs).values([
      {
        usuario: "Laura Carolina Rodríguez",
        accion: "Carga de Malla de Turnos",
        modulo: "Cargar Archivos",
        detalles: "Archivo malla_turnos_noviembre_2026.xlsx subido exitosamente.",
      },
      {
        usuario: "Pedro Neira",
        accion: "Modificación de Rol Usuario",
        modulo: "Administrar Usuarios",
        detalles: "Cambio de estado del usuario pneira@keralty.com a Inactivo.",
      },
      {
        usuario: "Dr. Camilo Arango",
        accion: "Inicio de Atención de Turno",
        modulo: "Turnos Pacientes",
        detalles: "Atención iniciada para paciente Max (Turno URG-101) en Box Urgencias 1.",
      },
    ]);

    console.log("Database seeded successfully!");
  } catch (err) {
    console.error("Error seeding database:", err);
  }
}
