"use client";

import React, { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  FileText,
  Download,
  History,
  RefreshCw,
  Sparkles,
} from "lucide-react";

interface UploadHistoryItem {
  id: number;
  nombreArchivo: string;
  tipoContent: string;
  registrosProcesados: number;
  subidoPor: string;
  fechaUpload: string;
  estado: string;
  detalles?: string;
}

export default function CargarArchivosPage() {
  const [history, setHistory] = useState<UploadHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState("Malla de Turnos Excel/CSV");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/file-uploads");
      const data = await res.json();
      if (data.success) {
        setHistory(data.data);
      }
    } catch (err) {
      console.error("Error loading file history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage({ type: "error", text: "Por favor selecciona un archivo Excel (.xlsx) o CSV" });
      return;
    }

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("tipoContent", uploadType);
    formData.append("subidoPor", "Laura Carolina Rodríguez");

    try {
      const res = await fetch("/api/file-uploads", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: data.message || "Archivo cargado y procesado exitosamente." });
        setFile(null);
        fetchHistory();
      } else {
        setMessage({ type: "error", text: data.error || "Error al procesar el archivo" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: "Ocurrió un error en la carga del archivo" });
    } finally {
      setUploading(false);
    }
  };

  const downloadSampleTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,usuario,cedula,nombres,cargo,rol,especialidad\njperez@keralty.com,1020304050,Juan Pérez,Médico Veterinario,Médico Veterinario,Urgencias 24h\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "plantilla_malla_turnos_vet.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Navigation>
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0073A5] tracking-tight">
            Cargar Archivos
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Importación masiva de mallas de turnos y listados de personal veterinario
          </p>
        </div>

        {/* File Upload Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-[#0073A5]/10 text-[#0073A5] flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg">Carga de Mallas / Personal</h2>
                <p className="text-xs text-slate-500">Formatos soportados: CSV, XLSX, XLS</p>
              </div>
            </div>

            <button
              onClick={downloadSampleTemplate}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-2 transition"
            >
              <Download className="w-4 h-4 text-[#0073A5]" />
              <span>Descargar Plantilla CSV</span>
            </button>
          </div>

          {message && (
            <div
              className={`p-4 rounded-2xl text-xs flex items-center space-x-2 ${
                message.type === "success"
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                  : "bg-red-50 border border-red-200 text-red-800"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleUpload} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Tipo de Archivo *</label>
                <select
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0073A5]"
                >
                  <option value="Malla de Turnos Excel/CSV">Malla de Turnos Mensual/Semanal</option>
                  <option value="Listado Personal">Listado Personal Veterinario</option>
                  <option value="Programación Guardias 24h">Programación Guardias 24h</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Usuario responsable</label>
                <input
                  type="text"
                  disabled
                  value="Laura Carolina Rodríguez (Administrador)"
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-600"
                />
              </div>
            </div>

            {/* Drag and Drop Zone */}
            <div className="border-2 border-dashed border-slate-300 hover:border-[#0073A5] bg-slate-50/50 hover:bg-[#0073A5]/5 rounded-3xl p-8 text-center transition cursor-pointer relative group">
              <input
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-[#0073A5]/10 text-[#0073A5] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                {file ? (
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{file.name}</span>
                    <span className="block text-xs text-slate-500 mt-1">
                      {(file.size / 1024).toFixed(1)} KB • Listo para procesar
                    </span>
                  </div>
                ) : (
                  <div>
                    <p className="font-bold text-slate-800 text-sm">
                      Arrastra tu archivo aquí o haz clic para explorar
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Formatos compatibles: .csv, .xlsx (Máx 10 MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={uploading || !file}
                className="bg-[#0073A5] hover:bg-[#005C8A] text-white font-bold px-8 py-3 rounded-2xl text-xs sm:text-sm flex items-center space-x-2 shadow-md transition disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{uploading ? "Procesando archivo..." : "Iniciar Importación"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Upload History Table */}
        <div id="historial" className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <History className="w-5 h-5 text-[#0073A5]" />
            <h3 className="font-bold text-slate-900 text-base">Historial de Archivos Cargados</h3>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400">Cargando historial...</div>
          ) : history.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No hay cargas recientes</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-600 font-bold uppercase bg-slate-50">
                    <th className="p-3">Nombre del Archivo</th>
                    <th className="p-3">Tipo de Contenido</th>
                    <th className="p-3">Registros</th>
                    <th className="p-3">Subido por</th>
                    <th className="p-3">Fecha</th>
                    <th className="p-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{item.nombreArchivo}</td>
                      <td className="p-3 text-slate-600">{item.tipoContent}</td>
                      <td className="p-3 font-mono font-bold text-[#0073A5]">{item.registrosProcesados}</td>
                      <td className="p-3 text-slate-700">{item.subidoPor}</td>
                      <td className="p-3 text-slate-500">
                        {new Date(item.fechaUpload).toLocaleString("es-ES")}
                      </td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {item.estado}
                        </span>
                      </td>
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
