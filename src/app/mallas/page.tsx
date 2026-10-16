"use client";

import React, { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import {
  Calendar as CalendarIcon,
  Sparkles,
  Plus,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UserCheck,
  Building2,
  RefreshCw,
  Download,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
} from "lucide-react";

interface Shift {
  id: number;
  userId: number;
  fecha: string;
  tipoTurno: string;
  departamento: string;
  consultorio?: string;
  estado: string;
  user: {
    id: number;
    nombres: string;
    cargo: string;
    rol: string;
    especialidad: string;
  };
}

interface User {
  id: number;
  nombres: string;
  cargo: string;
  rol: string;
  especialidad: string;
  estado: string;
}

export default function MallasPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [deptFilter, setDeptFilter] = useState("todos");

  // Date range for current week
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const monday = new Date(today.setDate(diff));
    return monday.toISOString().split("T")[0];
  });

  const [modalShiftOpen, setModalShiftOpen] = useState(false);
  const [newShiftForm, setNewShiftForm] = useState({
    userId: "",
    fecha: startDate,
    tipoTurno: "Mañana (07:00 - 15:00)",
    departamento: "Urgencias 24h",
    consultorio: "Box Urgencias 1",
  });

  const fetchShifts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/shift-schedules?startDate=${startDate}`);
      const data = await res.json();
      if (data.success) {
        setShifts(data.data);
      }
    } catch (err) {
      console.error("Error loading shifts:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users?estado=Activo");
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (err) {
      console.error("Error loading users:", err);
    }
  };

  useEffect(() => {
    fetchShifts();
    fetchUsers();
  }, [startDate]);

  const handleGenerateMalla = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/shift-schedules/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate }),
      });
      const data = await res.json();
      if (data.success) {
        fetchShifts();
      }
    } catch (err) {
      console.error("Error generating shift matrix:", err);
    } finally {
      setGenerating(false);
    }
  };

  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/shift-schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newShiftForm),
      });
      const data = await res.json();
      if (data.success) {
        setModalShiftOpen(false);
        fetchShifts();
      }
    } catch (err) {
      console.error("Error creating shift:", err);
    }
  };

  const handleDeleteShift = async (shiftId: number) => {
    if (!confirm("¿Deseas eliminar este turno?")) return;
    try {
      await fetch(`/api/shift-schedules/${shiftId}`, { method: "DELETE" });
      fetchShifts();
    } catch (err) {
      console.error("Error deleting shift:", err);
    }
  };

  // Helper days of week
  const weekDays = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + idx);
    const dateStr = d.toISOString().split("T")[0];
    const dayName = d.toLocaleDateString("es-ES", { weekday: "short" });
    const dayNum = d.getDate();
    return { dateStr, dayName, dayNum, fullDate: d };
  });

  const filteredShifts = deptFilter === "todos"
    ? shifts
    : shifts.filter((s) => s.departamento === deptFilter);

  const getShiftBadgeStyle = (tipo: string) => {
    if (tipo.includes("Mañana")) return "bg-sky-100 text-sky-800 border-sky-200";
    if (tipo.includes("Tarde")) return "bg-amber-100 text-amber-800 border-amber-200";
    if (tipo.includes("Noche") || tipo.includes("Guardia")) return "bg-indigo-100 text-indigo-800 border-indigo-200";
    if (tipo.includes("Descanso")) return "bg-slate-100 text-slate-500 border-slate-200";
    return "bg-teal-100 text-teal-800 border-teal-200";
  };

  return (
    <Navigation>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#0073A5] tracking-tight">
              Generar mallas de turnos
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Programación de turnos médicos veterinarios y cuadrantes de cobertura
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setModalShiftOpen(true)}
              className="bg-white hover:bg-slate-50 text-[#0073A5] border border-[#0073A5] font-bold px-4 py-2.5 rounded-2xl flex items-center space-x-2 text-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Turno Individual</span>
            </button>

            <button
              onClick={handleGenerateMalla}
              disabled={generating}
              className="bg-[#0073A5] hover:bg-[#005C8A] text-white font-bold px-5 py-2.5 rounded-2xl flex items-center space-x-2 text-xs shadow-md transition disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>{generating ? "Generando Malla..." : "Generar Malla Inteligente"}</span>
            </button>
          </div>
        </div>

        {/* Date Selector & Dept Filter Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Week Selector */}
          <div className="flex items-center space-x-3 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold">
            <CalendarIcon className="w-4 h-4 text-[#0073A5]" />
            <span>Semana del:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-800 font-medium focus:outline-none"
            />
          </div>

          {/* Department Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto max-w-full pb-1">
            {[
              { id: "todos", label: "Todos los deptos" },
              { id: "Urgencias 24h", label: "Urgencias 24h" },
              { id: "Consultorios Generales", label: "Consultorios" },
              { id: "Quirófano / Cirugía", label: "Quirófano" },
              { id: "UCI Vet / Hospitalización", label: "UCI Vet" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setDeptFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  deptFilter === tab.id
                    ? "bg-[#0073A5] text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Shift Roster Matrix Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-[#0073A5]" />
              <span className="text-sm font-medium">Cargando malla de turnos...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No hay personal activo registrado.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs font-bold uppercase">
                    <th className="py-4 px-4 min-w-[180px]">Personal / Rol</th>
                    {weekDays.map((day) => (
                      <th key={day.dateStr} className="py-4 px-3 text-center min-w-[140px] border-l border-slate-200/60">
                        <span className="block text-slate-500 text-[10px]">{day.dayName}</span>
                        <span className="text-sm font-extrabold text-[#0073A5]">{day.dayNum}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition">
                      {/* User Info Column */}
                      <td className="py-3 px-4 font-medium text-slate-800 bg-slate-50/30">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{user.nombres}</span>
                          <span className="text-[10px] text-slate-500">{user.cargo}</span>
                          <span className="text-[10px] text-teal-700 font-semibold mt-0.5">
                            {user.especialidad}
                          </span>
                        </div>
                      </td>

                      {/* Days Matrix Cells */}
                      {weekDays.map((day) => {
                        const dayShifts = filteredShifts.filter(
                          (s) => s.userId === user.id && s.fecha === day.dateStr
                        );

                        return (
                          <td
                            key={day.dateStr}
                            className="py-2 px-2 border-l border-slate-100 align-top hover:bg-[#0073A5]/5 transition"
                          >
                            {dayShifts.length === 0 ? (
                              <button
                                onClick={() => {
                                  setNewShiftForm({
                                    userId: user.id.toString(),
                                    fecha: day.dateStr,
                                    tipoTurno: "Mañana (07:00 - 15:00)",
                                    departamento: user.especialidad.includes("Urgencia") ? "Urgencias 24h" : "Consultorios Generales",
                                    consultorio: "Consultorio 1",
                                  });
                                  setModalShiftOpen(true);
                                }}
                                className="w-full h-12 border border-dashed border-slate-200 hover:border-[#0073A5] rounded-xl flex items-center justify-center text-slate-300 hover:text-[#0073A5] transition group"
                                title="Asignar turno"
                              >
                                <Plus className="w-4 h-4 group-hover:scale-125 transition-transform" />
                              </button>
                            ) : (
                              <div className="space-y-1.5">
                                {dayShifts.map((shift) => (
                                  <div
                                    key={shift.id}
                                    className={`p-2 rounded-xl border text-[11px] relative group shadow-2xs ${getShiftBadgeStyle(
                                      shift.tipoTurno
                                    )}`}
                                  >
                                    <div className="flex items-start justify-between">
                                      <span className="font-bold leading-tight truncate block pr-2">
                                        {shift.tipoTurno.split(" ")[0]}
                                      </span>
                                      <button
                                        onClick={() => handleDeleteShift(shift.id)}
                                        className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-800 transition"
                                        title="Eliminar turno"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                    <span className="block text-[9px] opacity-85 truncate mt-0.5">
                                      {shift.departamento}
                                    </span>
                                    {shift.consultorio && shift.consultorio !== "N/A" && (
                                      <span className="block text-[9px] font-mono opacity-70">
                                        📍 {shift.consultorio}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal for creating new shift */}
      {modalShiftOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Programar Nuevo Turno</h2>
            <form onSubmit={handleCreateShift} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Personal Veterinario</label>
                <select
                  required
                  value={newShiftForm.userId}
                  onChange={(e) => setNewShiftForm({ ...newShiftForm, userId: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50"
                >
                  <option value="">Seleccione personal...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombres} - {u.cargo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fecha</label>
                <input
                  type="date"
                  required
                  value={newShiftForm.fecha}
                  onChange={(e) => setNewShiftForm({ ...newShiftForm, fecha: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tipo de Turno</label>
                <select
                  value={newShiftForm.tipoTurno}
                  onChange={(e) => setNewShiftForm({ ...newShiftForm, tipoTurno: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50"
                >
                  <option value="Mañana (07:00 - 15:00)">Mañana (07:00 - 15:00)</option>
                  <option value="Tarde (15:00 - 23:00)">Tarde (15:00 - 23:00)</option>
                  <option value="Noche / Guardia (23:00 - 07:00)">Noche / Guardia (23:00 - 07:00)</option>
                  <option value="Guardia 24h Completa">Guardia 24h Completa</option>
                  <option value="Descanso">Descanso</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Departamento / Área</label>
                <select
                  value={newShiftForm.departamento}
                  onChange={(e) => setNewShiftForm({ ...newShiftForm, departamento: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50"
                >
                  <option value="Urgencias 24h">Urgencias 24h</option>
                  <option value="Consultorios Generales">Consultorios Generales</option>
                  <option value="Quirófano / Cirugía">Quirófano / Cirugía</option>
                  <option value="UCI Vet / Hospitalización">UCI Vet / Hospitalización</option>
                  <option value="Recepción / Admisiones">Recepción / Admisiones</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Consultorio / Box</label>
                <input
                  type="text"
                  value={newShiftForm.consultorio}
                  onChange={(e) => setNewShiftForm({ ...newShiftForm, consultorio: e.target.value })}
                  placeholder="ej. Box Urgencias 1"
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalShiftOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0073A5] text-white font-bold"
                >
                  Asignar Turno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Navigation>
  );
}
