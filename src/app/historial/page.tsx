"use client";

import React, { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { History, Shield, Clock, Search, RefreshCw } from "lucide-react";

interface AuditLog {
  id: number;
  usuario: string;
  accion: string;
  modulo: string;
  detalles?: string;
  fecha: string;
}

export default function HistorialPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/audit-logs");
      const data = await res.json();
      if (data.success) {
        setLogs(data.data);
      }
    } catch (err) {
      console.error("Error fetching logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      log.usuario.toLowerCase().includes(q) ||
      log.accion.toLowerCase().includes(q) ||
      log.modulo.toLowerCase().includes(q) ||
      (log.detalles && log.detalles.toLowerCase().includes(q))
    );
  });

  return (
    <Navigation>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0073A5] tracking-tight">
            Historial y Auditoría
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Registro cronológico de cambios de turnos, llamado de pacientes y modificaciones de usuarios
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por usuario, acción o módulo..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0073A5]"
              />
            </div>
            <button
              onClick={fetchLogs}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4 text-[#0073A5]" />
              <span>Actualizar Registros</span>
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400">Cargando historial de auditoría...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No se encontraron registros</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-600 font-bold uppercase bg-slate-50">
                    <th className="p-3">Fecha y Hora</th>
                    <th className="p-3">Usuario</th>
                    <th className="p-3">Módulo</th>
                    <th className="p-3">Acción</th>
                    <th className="p-3">Detalles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-3 font-mono text-slate-500 whitespace-nowrap">
                        {new Date(log.fecha).toLocaleString("es-ES")}
                      </td>
                      <td className="p-3 font-bold text-slate-900">{log.usuario}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0073A5]/10 text-[#0073A5]">
                          {log.modulo}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-slate-800">{log.accion}</td>
                      <td className="p-3 text-slate-600 max-w-md">{log.detalles || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Navigation>
  );
}
