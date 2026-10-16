"use client";

import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import {
  Smartphone,
  Search,
  Clock,
  CheckCircle,
  AlertTriangle,
  Stethoscope,
  Volume2,
  Calendar,
  User,
  QrCode,
  MapPin,
  RefreshCw,
  Sparkles,
  ChevronRight,
} from "lucide-react";

export default function MovilPage() {
  const [activeMode, setActiveMode] = useState<"owner" | "vet">("owner");
  const [turnCode, setTurnCode] = useState("URG-101");
  const [turnResult, setTurnResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearchTurn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!turnCode.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/patient-turns/by-code/${turnCode.trim()}`);
      const data = await res.json();
      if (data.success) {
        setTurnResult(data.data);
      } else {
        setTurnResult(null);
      }
    } catch (err) {
      setTurnResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Navigation>
      <div className="max-w-md mx-auto space-y-6">
        {/* Mobile Experience Frame Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold">
            <Smartphone className="w-4 h-4" />
            <span>Vista App Móvil Keralty Vet</span>
          </div>
          <h1 className="text-2xl font-black text-[#003E5C]">OptiTurnos Pocket</h1>
          <p className="text-xs text-slate-500">
            Experiencia optimizada para smartphones y consulta en tiempo real
          </p>
        </div>

        {/* Mode Selector Pill */}
        <div className="bg-slate-200/80 p-1 rounded-2xl flex items-center text-xs font-bold">
          <button
            onClick={() => setActiveMode("owner")}
            className={`flex-1 py-2.5 rounded-xl transition ${
              activeMode === "owner" ? "bg-[#0073A5] text-white shadow-md" : "text-slate-700"
            }`}
          >
            🐾 Propietario de Mascota
          </button>
          <button
            onClick={() => setActiveMode("vet")}
            className={`flex-1 py-2.5 rounded-xl transition ${
              activeMode === "vet" ? "bg-[#0073A5] text-white shadow-md" : "text-slate-700"
            }`}
          >
            🩺 Médico Veterinario
          </button>
        </div>

        {/* 1. Pet Owner Live Ticket Tracker */}
        {activeMode === "owner" && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200 space-y-4">
              <h2 className="font-bold text-slate-900 text-sm">Consultar Estado de Mi Turno</h2>
              <form onSubmit={handleSearchTurn} className="flex space-x-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="ej. URG-101 o CON-042"
                    value={turnCode}
                    onChange={(e) => setTurnCode(e.target.value.toUpperCase())}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#0073A5]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#0073A5] text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-[#005C8A] transition flex items-center space-x-1"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Buscar</span>}
                </button>
              </form>

              {/* Quick sample codes */}
              <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                <span>Turnos de prueba:</span>
                {["URG-101", "CON-042", "CIR-008"].map((code) => (
                  <button
                    key={code}
                    onClick={() => {
                      setTurnCode(code);
                      handleSearchTurn();
                    }}
                    className="underline text-[#0073A5] font-mono font-bold"
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>

            {/* Turn Digital Pass Result Card */}
            {turnResult ? (
              <div className="bg-gradient-to-br from-[#005C8A] to-[#0073A5] rounded-3xl p-6 text-white shadow-2xl space-y-5 border border-cyan-400/30 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-white/20 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-[#00A896]">Keralty</span>
                    <span className="text-xs text-white/80">Turno Digital</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20">
                    {turnResult.prioridad.split(" ")[0]}
                  </span>
                </div>

                <div className="text-center space-y-1">
                  <span className="text-[11px] text-teal-200 uppercase tracking-widest font-bold">
                    Código de Turno
                  </span>
                  <div className="text-5xl font-black text-amber-300 tracking-tight font-mono">
                    {turnResult.codigoTurno}
                  </div>
                </div>

                <div className="bg-white/10 rounded-2xl p-4 space-y-2 border border-white/10 text-xs">
                  <div className="flex justify-between">
                    <span className="text-teal-200">Mascota:</span>
                    <span className="font-bold text-white">🐾 {turnResult.nombreMascota} ({turnResult.especie})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-teal-200">Propietario:</span>
                    <span className="font-bold text-white">{turnResult.nombrePropietario}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-teal-200">Servicio:</span>
                    <span className="font-bold text-white">{turnResult.tipoAtencion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-teal-200">Ubicación:</span>
                    <span className="font-bold text-teal-300">📍 {turnResult.consultorioAsignado || "Sala de Espera"}</span>
                  </div>
                </div>

                {/* Queue status badge */}
                <div className="bg-black/30 rounded-2xl p-4 text-center space-y-1">
                  <div className="text-xs font-bold text-emerald-400 flex items-center justify-center space-x-1">
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>ESTADO EN TIEMPO REAL: {turnResult.estado.toUpperCase()}</span>
                  </div>
                  {turnResult.estado === "En Espera" && (
                    <p className="text-[11px] text-teal-200">
                      Hay <strong className="text-white">{turnResult.turnsAhead}</strong> pacientes por delante.
                      Tiempo aprox: <strong className="text-white">~{turnResult.estimatedMinutes} min</strong>.
                    </p>
                  )}
                  {turnResult.estado === "Llamado" && (
                    <p className="text-xs text-amber-300 font-bold animate-bounce">
                      ¡Atención! Tu turno ha sido llamado. Dirígete a {turnResult.consultorioAsignado}.
                    </p>
                  )}
                </div>
              </div>
            ) : searched ? (
              <div className="bg-white rounded-3xl p-6 text-center text-slate-500 text-xs">
                No se encontró el turno digitado. Verifica el código.
              </div>
            ) : null}
          </div>
        )}

        {/* 2. Vet Doctor Mobile View */}
        {activeMode === "vet" && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-3">
              <div className="flex items-center space-x-3">
                <img
                  src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80"
                  alt="Dr. Camilo Arango"
                  className="w-12 h-12 rounded-full border-2 border-[#0073A5] object-cover"
                />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Dr. Camilo Arango</h3>
                  <span className="text-xs text-[#0073A5] font-semibold">Médico Urgencista • Turno Mañana</span>
                </div>
              </div>

              <div className="bg-teal-50 p-3 rounded-2xl text-xs text-teal-800 border border-teal-200 flex items-center justify-between">
                <div>
                  <span className="font-bold block">Box Urgencias 1</span>
                  <span className="text-[11px] text-teal-600">Sede Principal</span>
                </div>
                <span className="px-2.5 py-1 bg-teal-600 text-white font-bold rounded-xl text-[10px]">
                  En servicio
                </span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
                Próximos pacientes asignados
              </h4>

              <div className="space-y-2">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-[#0073A5] text-sm font-mono block">URG-101</span>
                    <span className="font-bold text-slate-800 text-xs">Max (Perro)</span>
                    <span className="text-[10px] text-slate-500 block">Politraumatismo leve</span>
                  </div>
                  <button className="bg-amber-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Llamar</span>
                  </button>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between opacity-80">
                  <div>
                    <span className="font-extrabold text-slate-700 text-sm font-mono block">CIR-008</span>
                    <span className="font-bold text-slate-800 text-xs">Pelusa (Gato)</span>
                    <span className="text-[10px] text-slate-500 block">Cirugía general</span>
                  </div>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-1 rounded-lg">
                    En espera
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Navigation>
  );
}
