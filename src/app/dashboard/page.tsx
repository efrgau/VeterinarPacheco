"use client";

import React, { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Link from "next/link";
import {
  Users,
  Calendar,
  Clock,
  Upload,
  BarChart3,
  Smartphone,
  CheckCircle,
  AlertTriangle,
  Stethoscope,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports")
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setData(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Navigation>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Banner matching Keralty Vet Branding */}
        <div className="bg-gradient-to-r from-[#005C8A] via-[#0073A5] to-[#00A896] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Keralty Salud Veterinaria • OptiTurnos
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Bienvenida, Laura Carolina
            </h1>
            <p className="text-xs sm:text-sm text-cyan-100 leading-relaxed">
              Sistema integral de gestión de turnos del personal médico veterinario, programación de cuadrantes y atención a pacientes en sala de espera.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/usuarios"
                className="bg-white text-[#0073A5] hover:bg-cyan-50 font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-md transition"
              >
                <span>Consultar Usuarios</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/turnos-pacientes"
                className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-md transition"
              >
                <span>Sala de Turnos Pacientes</span>
                <Clock className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Quick KPI Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/usuarios" className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:border-[#0073A5] transition group">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-bold uppercase">Personal Registrado</span>
                <span className="text-3xl font-black text-slate-900 block mt-1">
                  {data?.staff?.total || 7}
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                  ● {data?.staff?.active || 6} Activos
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#0073A5]/10 text-[#0073A5] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </Link>

          <Link href="/mallas" className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:border-[#0073A5] transition group">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-bold uppercase">Mallas de Turnos</span>
                <span className="text-3xl font-black text-[#0073A5] block mt-1">
                  {data?.shifts?.total || 7}
                </span>
                <span className="text-[11px] text-teal-700 font-semibold mt-1 block">
                  Cobertura 24h Activa
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </Link>

          <Link href="/turnos-pacientes" className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:border-[#0073A5] transition group">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-bold uppercase">Pacientes en Cola</span>
                <span className="text-3xl font-black text-amber-600 block mt-1">
                  {data?.patients?.waiting || 2}
                </span>
                <span className="text-[11px] text-slate-500 font-medium mt-1 block">
                  {data?.patients?.inAttention || 2} en atención
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </Link>

          <Link href="/movil" className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:border-emerald-500 transition group">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-bold uppercase">App Móvil Vet</span>
                <span className="text-3xl font-black text-emerald-600 block mt-1">
                  Activa
                </span>
                <span className="text-[11px] text-slate-500 font-medium mt-1 block">
                  Consulta de turno QR
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Smartphone className="w-6 h-6" />
              </div>
            </div>
          </Link>
        </div>

        {/* Feature Grid Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0073A5]/10 text-[#0073A5] flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Gestión de Usuarios</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Consulta, filtro y asignación de roles para médicos veterinarios, auxiliares, cirujanos y recepcionistas.
            </p>
            <Link
              href="/usuarios"
              className="inline-flex items-center text-xs font-bold text-[#0073A5] hover:underline"
            >
              Ir a Usuarios →
            </Link>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Mallas de Turnos Inteligentes</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Generador automático de turnos semanales considerando disponibilidades, especialidades y guardias de urgencias.
            </p>
            <Link
              href="/mallas"
              className="inline-flex items-center text-xs font-bold text-teal-700 hover:underline"
            >
              Ir a Mallas →
            </Link>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Llamador de Pacientes</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Pantalla pública de turnos con síntesis de voz, llamados en sala de espera y consulta móvil con código QR.
            </p>
            <Link
              href="/turnos-pacientes"
              className="inline-flex items-center text-xs font-bold text-amber-600 hover:underline"
            >
              Ir a Turnos →
            </Link>
          </div>
        </div>
      </div>
    </Navigation>
  );
}
