"use client";

import React, { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import {
  Clock,
  Plus,
  Volume2,
  CheckCircle,
  AlertTriangle,
  Dog,
  Cat,
  Stethoscope,
  Tv,
  PhoneCall,
  UserCheck,
  Search,
  Filter,
  RefreshCw,
  QrCode,
  Share2,
} from "lucide-react";

interface PatientTurn {
  id: number;
  codigoTurno: string;
  nombreMascota: string;
  especie: string;
  raza?: string;
  nombrePropietario: string;
  cedulaPropietario?: string;
  telefonoPropietario?: string;
  tipoAtencion: string;
  prioridad: string;
  estado: string;
  consultorioAsignado?: string;
  veterinarioAsignadoId?: number;
  horaLlegada: string;
  horaLlamado?: string;
  veterinario?: {
    id: number;
    nombres: string;
    cargo: string;
  };
}

export default function TurnosPacientesPage() {
  const [turns, setTurns] = useState<PatientTurn[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"espera" | "atencion" | "completados">("espera");
  const [searchQuery, setSearchQuery] = useState("");

  const [modalNewTurnOpen, setModalNewTurnOpen] = useState(false);
  const [tvModeOpen, setTvModeOpen] = useState(false);
  const [lastCalledTurn, setLastCalledTurn] = useState<PatientTurn | null>(null);

  const [formData, setFormData] = useState({
    nombreMascota: "",
    especie: "Perro",
    raza: "",
    nombrePropietario: "",
    cedulaPropietario: "",
    telefonoPropietario: "",
    tipoAtencion: "Consulta General",
    prioridad: "Normal (Triaje 3)",
    consultorioAsignado: "Consultorio 1",
  });

  const fetchTurns = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/patient-turns");
      const data = await res.json();
      if (data.success) {
        setTurns(data.data);
      }
    } catch (err) {
      console.error("Error loading turns:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTurns();
    // Auto refresh queue every 10s
    const interval = setInterval(fetchTurns, 10000);
    return () => clearInterval(interval);
  }, []);

  const speakTurnAnnouncement = (turn: PatientTurn) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const text = `Atención. Turno ${turn.codigoTurno}, para la mascota ${turn.nombreMascota}, pasar a ${
        turn.consultorioAsignado || "Consultorio 1"
      }`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "es-ES";
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCreateTurn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/patient-turns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setModalNewTurnOpen(false);
        setFormData({
          nombreMascota: "",
          especie: "Perro",
          raza: "",
          nombrePropietario: "",
          cedulaPropietario: "",
          telefonoPropietario: "",
          tipoAtencion: "Consulta General",
          prioridad: "Normal (Triaje 3)",
          consultorioAsignado: "Consultorio 1",
        });
        fetchTurns();
      }
    } catch (err) {
      console.error("Error creating patient turn:", err);
    }
  };

  const handleCallTurn = async (turn: PatientTurn) => {
    try {
      const res = await fetch(`/api/patient-turns/${turn.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "Llamado" }),
      });
      const data = await res.json();
      if (data.success) {
        setLastCalledTurn({ ...turn, estado: "Llamado" });
        speakTurnAnnouncement(turn);
        fetchTurns();
      }
    } catch (err) {
      console.error("Error calling turn:", err);
    }
  };

  const handleSetInAttention = async (turnId: number) => {
    try {
      await fetch(`/api/patient-turns/${turnId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "En Atención" }),
      });
      fetchTurns();
    } catch (err) {
      console.error("Error updating turn:", err);
    }
  };

  const handleSetAttended = async (turnId: number) => {
    try {
      await fetch(`/api/patient-turns/${turnId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "Atendido" }),
      });
      fetchTurns();
    } catch (err) {
      console.error("Error completing turn:", err);
    }
  };

  const filteredTurns = turns.filter((t) => {
    if (activeTab === "espera") return t.estado === "En Espera";
    if (activeTab === "atencion") return t.estado === "Llamado" || t.estado === "En Atención";
    return t.estado === "Atendido";
  }).filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.codigoTurno.toLowerCase().includes(q) ||
      t.nombreMascota.toLowerCase().includes(q) ||
      t.nombrePropietario.toLowerCase().includes(q)
    );
  });

  return (
    <Navigation>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#0073A5] tracking-tight">
              Turnos de Atención a Pacientes
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Gestión de sala de espera, llamado en pantalla y cola de turnos en tiempo real
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setTvModeOpen(!tvModeOpen)}
              className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-2.5 rounded-2xl flex items-center space-x-2 text-xs shadow-md transition"
            >
              <Tv className="w-4 h-4 text-emerald-400" />
              <span>{tvModeOpen ? "Cerrar Pantalla TV" : "Modo TV Sala de Espera"}</span>
            </button>

            <button
              onClick={() => setModalNewTurnOpen(true)}
              className="bg-[#0073A5] hover:bg-[#005C8A] text-white font-bold px-5 py-2.5 rounded-2xl flex items-center space-x-2 text-xs shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Turno Paciente</span>
            </button>
          </div>
        </div>

        {/* TV Mode Public Display Banner / Overlay if enabled */}
        {tvModeOpen && (
          <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-800 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-500 flex items-center justify-center font-black text-xl">
                  K
                </div>
                <div>
                  <h2 className="text-2xl font-black text-teal-400">PANTALLA DE TURNOS EN SALA DE ESPERA</h2>
                  <p className="text-xs text-slate-400">Keralty Salud Veterinaria • Llamado en Vivo</p>
                </div>
              </div>
              <span className="text-xs font-mono bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/40 animate-pulse">
                ● EN VIVO
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Currently Called Turn */}
              <div className="bg-gradient-to-br from-[#005C8A] to-[#0073A5] rounded-3xl p-8 text-center text-white flex flex-col items-center justify-center space-y-4 shadow-xl border border-cyan-500/30">
                <span className="text-xs font-bold uppercase tracking-widest bg-white/20 px-4 py-1 rounded-full">
                  Último Turno Llamado
                </span>
                {lastCalledTurn ? (
                  <>
                    <span className="text-6xl sm:text-7xl font-black tracking-tighter text-amber-300 animate-pulse">
                      {lastCalledTurn.codigoTurno}
                    </span>
                    <div className="text-xl sm:text-2xl font-bold">
                      🐾 {lastCalledTurn.nombreMascota} ({lastCalledTurn.especie})
                    </div>
                    <div className="text-lg bg-black/30 px-6 py-2 rounded-2xl border border-white/20 font-bold text-teal-200">
                      📍 {lastCalledTurn.consultorioAsignado || "Consultorio 1"}
                    </div>
                  </>
                ) : (
                  <span className="text-sm text-cyan-200">Sin turnos llamados recientemente</span>
                )}
              </div>

              {/* Waiting Queue List on TV */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Próximos en Espera
                </h3>
                <div className="space-y-2">
                  {turns
                    .filter((t) => t.estado === "En Espera")
                    .slice(0, 4)
                    .map((turn, i) => (
                      <div
                        key={turn.id}
                        className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 font-bold flex items-center justify-center text-xs">
                            #{i + 1}
                          </span>
                          <div>
                            <span className="text-lg font-black text-white">{turn.codigoTurno}</span>
                            <span className="block text-xs text-slate-400">
                              {turn.nombreMascota} • {turn.especie}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs bg-slate-800 text-teal-400 px-3 py-1 rounded-xl font-medium">
                          {turn.tipoAtencion}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Filters */}
        <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            {[
              { id: "espera", label: "En Espera", count: turns.filter((t) => t.estado === "En Espera").length },
              { id: "atencion", label: "En Atención / Llamados", count: turns.filter((t) => t.estado === "Llamado" || t.estado === "En Atención").length },
              { id: "completados", label: "Completados", count: turns.filter((t) => t.estado === "Atendido").length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? "bg-[#0073A5] text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] ${
                    activeTab === tab.id ? "bg-white text-[#0073A5]" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar paciente o código..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0073A5]"
            />
          </div>
        </div>

        {/* Patient Turns Grid / List */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          {loading ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-[#0073A5]" />
              <span className="text-sm font-medium">Cargando cola de turnos...</span>
            </div>
          ) : filteredTurns.length === 0 ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-2">
              <Clock className="w-12 h-12 text-slate-300" />
              <p className="font-bold text-slate-600">No hay turnos en esta sección</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTurns.map((turn) => {
                const isCritical = turn.prioridad.includes("Alta") || turn.tipoAtencion.includes("Urgenc");
                return (
                  <div
                    key={turn.id}
                    className={`rounded-2xl p-5 border transition-all shadow-xs flex flex-col justify-between space-y-4 ${
                      turn.estado === "Llamado"
                        ? "bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/50"
                        : turn.estado === "En Atención"
                        ? "bg-emerald-50/70 border-emerald-300"
                        : "bg-slate-50/60 border-slate-200 hover:border-[#0073A5]"
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Code & Priority Badge */}
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-black text-[#0073A5] tracking-tight">
                          {turn.codigoTurno}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                            isCritical
                              ? "bg-red-100 text-red-700 border border-red-200"
                              : "bg-teal-100 text-teal-800 border border-teal-200"
                          }`}
                        >
                          {turn.prioridad.split(" ")[0]}
                        </span>
                      </div>

                      {/* Pet Details */}
                      <div>
                        <div className="flex items-center space-x-2 text-base font-bold text-slate-900">
                          <span>🐾 {turn.nombreMascota}</span>
                          <span className="text-xs text-slate-500 font-normal">
                            ({turn.especie} {turn.raza ? `• ${turn.raza}` : ""})
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Propietario: <span className="font-medium text-slate-800">{turn.nombrePropietario}</span>
                        </p>
                      </div>

                      {/* Attention Details */}
                      <div className="text-xs bg-white p-2.5 rounded-xl border border-slate-200/80 space-y-1">
                        <div className="flex justify-between text-slate-600">
                          <span>Servicio:</span>
                          <span className="font-semibold text-slate-800">{turn.tipoAtencion}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Ubicación:</span>
                          <span className="font-bold text-[#0073A5]">
                            {turn.consultorioAsignado || "Por asignar"}
                          </span>
                        </div>
                        {turn.veterinario && (
                          <div className="flex justify-between text-slate-600">
                            <span>Atendido por:</span>
                            <span className="font-medium text-slate-800">{turn.veterinario.nombres}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between gap-2">
                      {turn.estado === "En Espera" && (
                        <button
                          onClick={() => handleCallTurn(turn)}
                          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-sm transition"
                        >
                          <Volume2 className="w-4 h-4" />
                          <span>Llamar por Altavoz</span>
                        </button>
                      )}

                      {turn.estado === "Llamado" && (
                        <button
                          onClick={() => handleSetInAttention(turn.id)}
                          className="w-full bg-[#0073A5] hover:bg-[#005C8A] text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition"
                        >
                          <Stethoscope className="w-4 h-4" />
                          <span>Iniciar Atención</span>
                        </button>
                      )}

                      {turn.estado === "En Atención" && (
                        <button
                          onClick={() => handleSetAttended(turn.id)}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Finalizar Consulta</span>
                        </button>
                      )}

                      {turn.estado === "Atendido" && (
                        <span className="text-xs text-emerald-700 font-bold flex items-center space-x-1">
                          <CheckCircle className="w-4 h-4" />
                          <span>Consulta Completada</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* New Patient Turn Modal */}
      {modalNewTurnOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Registrar Nuevo Turno Paciente</h2>
            <form onSubmit={handleCreateTurn} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nombre Mascota *</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Bruno"
                    value={formData.nombreMascota}
                    onChange={(e) => setFormData({ ...formData, nombreMascota: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Especie *</label>
                  <select
                    value={formData.especie}
                    onChange={(e) => setFormData({ ...formData, especie: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50"
                  >
                    <option value="Perro">Perro</option>
                    <option value="Gato">Gato</option>
                    <option value="Ave">Ave</option>
                    <option value="Exótico">Exótico / Otro</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Propietario *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nombre del dueño"
                    value={formData.nombrePropietario}
                    onChange={(e) => setFormData({ ...formData, nombrePropietario: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    placeholder="3000000000"
                    value={formData.telefonoPropietario}
                    onChange={(e) => setFormData({ ...formData, telefonoPropietario: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo de Atención *</label>
                  <select
                    value={formData.tipoAtencion}
                    onChange={(e) => setFormData({ ...formData, tipoAtencion: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50"
                  >
                    <option value="Consulta General">Consulta General</option>
                    <option value="Urgencia Vet">Urgencia Vet</option>
                    <option value="Vacunación / Control">Vacunación / Control</option>
                    <option value="Cirugía / Procedimiento">Cirugía / Procedimiento</option>
                    <option value="Exámenes / Lab">Exámenes / Lab</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Prioridad / Triaje</label>
                  <select
                    value={formData.prioridad}
                    onChange={(e) => setFormData({ ...formData, prioridad: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50"
                  >
                    <option value="Normal (Triaje 3)">Normal (Triaje 3)</option>
                    <option value="Media (Triaje 2)">Media (Triaje 2)</option>
                    <option value="Alta / Crítica (Triaje 1)">Alta / Crítica (Triaje 1)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Consultorio Asignado</label>
                <select
                  value={formData.consultorioAsignado}
                  onChange={(e) => setFormData({ ...formData, consultorioAsignado: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50"
                >
                  <option value="Consultorio 1">Consultorio 1</option>
                  <option value="Consultorio 2">Consultorio 2</option>
                  <option value="Box Urgencias 1">Box Urgencias 1</option>
                  <option value="Quirófano A">Quirófano A</option>
                  <option value="Laboratorio">Laboratorio</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalNewTurnOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0073A5] text-white font-bold"
                >
                  Emitir Turno Paciente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Navigation>
  );
}
