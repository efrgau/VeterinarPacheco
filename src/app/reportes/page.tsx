"use client";

import React, { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import {
  BarChart3,
  Users,
  Clock,
  CheckCircle2,
  Calendar,
  Stethoscope,
  TrendingUp,
  Award,
  RefreshCw,
} from "lucide-react";

export default function ReportesPage() {
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
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0073A5] tracking-tight">
            Reportes y Analítica
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Indicadores de cumplimiento de turnos, cobertura médica veterinaria y tiempos de atención
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-[#0073A5]" />
            <span>Cargando reporte analítico...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                    Personal Total
                  </span>
                  <span className="text-3xl font-black text-slate-900 block mt-1">
                    {data?.staff?.total || 0}
                  </span>
                  <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                    ● {data?.staff?.active || 0} Activos
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#0073A5]/10 text-[#0073A5] flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                    Cumplimiento Turnos
                  </span>
                  <span className="text-3xl font-black text-[#0073A5] block mt-1">
                    {data?.shifts?.complianceRate || 100}%
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium mt-1 block">
                    {data?.shifts?.completed || 0} de {data?.shifts?.total || 0} turnos
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                    Tiempo Espera Prom.
                  </span>
                  <span className="text-3xl font-black text-amber-600 block mt-1">
                    {data?.patients?.averageWaitTimeMinutes || 14} min
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium mt-1 block">
                    Meta de atención &lt; 20 min
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                    Pacientes Atendidos
                  </span>
                  <span className="text-3xl font-black text-teal-700 block mt-1">
                    {data?.patients?.attended || 0}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium mt-1 block">
                    En cola hoy: {data?.patients?.waiting || 0}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Stethoscope className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Department Breakdown & Species Chart Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cobertura por Departamento */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-[#0073A5]" />
                  <span>Distribución de Turnos por Departamento</span>
                </h3>
                <div className="space-y-3">
                  {Object.entries(data?.shifts?.byDepartment || {}).map(([dept, count]: any) => (
                    <div key={dept} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>{dept}</span>
                        <span>{count} turnos</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-[#0073A5] h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, (count / (data?.shifts?.total || 1)) * 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pacientes por Especie */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                  <Stethoscope className="w-5 h-5 text-[#0073A5]" />
                  <span>Distribución de Pacientes por Especie</span>
                </h3>
                <div className="space-y-3">
                  {Object.entries(data?.patients?.bySpecies || {}).map(([species, count]: any) => (
                    <div key={species} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>🐾 {species}</span>
                        <span>{count} pacientes</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-teal-600 h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, (count / (data?.patients?.total || 1)) * 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Navigation>
  );
}
