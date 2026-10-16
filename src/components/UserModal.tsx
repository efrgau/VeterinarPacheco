"use client";

import React, { useState, useEffect } from "react";
import { X, UserPlus, Save, AlertCircle } from "lucide-react";

interface UserData {
  id?: number;
  usuario: string;
  cedula: string;
  nombres: string;
  cargo: string;
  rol: string;
  especialidad?: string;
  telefono?: string;
  estado?: string;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  initialData?: UserData | null;
}

export default function UserModal({ isOpen, onClose, onSave, initialData }: UserModalProps) {
  const [formData, setFormData] = useState<UserData>({
    usuario: "",
    cedula: "",
    nombres: "",
    cargo: "Líder",
    rol: "Administrador",
    especialidad: "General",
    telefono: "",
    estado: "Activo",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        usuario: initialData.usuario || "",
        cedula: initialData.cedula || "",
        nombres: initialData.nombres || "",
        cargo: initialData.cargo || "Líder",
        rol: initialData.rol || "Administrador",
        especialidad: initialData.especialidad || "General",
        telefono: initialData.telefono || "",
        estado: initialData.estado || "Activo",
      });
    } else {
      setFormData({
        usuario: "",
        cedula: "",
        nombres: "",
        cargo: "Médico Veterinario",
        rol: "Médico Veterinario",
        especialidad: "Urgencias 24h",
        telefono: "",
        estado: "Activo",
      });
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = initialData?.id ? `/api/users/${initialData.id}` : "/api/users";
      const method = initialData?.id ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Ocurrió un error al guardar el usuario");
      }

      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0073A5]/10 text-[#0073A5] flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {initialData ? "Editar Usuario" : "Asociar Usuario"}
              </h2>
              <p className="text-xs text-slate-500">
                {initialData ? "Modificar datos del personal" : "Registrar nuevo personal en Keralty OptiTurnos"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Usuario (Correo institucional) *
              </label>
              <input
                type="email"
                required
                placeholder="ejemplo@keralty.com"
                value={formData.usuario}
                onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0073A5] bg-slate-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Cédula / Documento *
              </label>
              <input
                type="text"
                required
                placeholder="1013686745"
                value={formData.cedula}
                onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0073A5] bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nombres y apellidos completos *
            </label>
            <input
              type="text"
              required
              placeholder="Pedro Neira"
              value={formData.nombres}
              onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0073A5] bg-slate-50 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Cargo *</label>
              <select
                value={formData.cargo}
                onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0073A5] bg-slate-50 focus:bg-white"
              >
                <option value="Líder">Líder</option>
                <option value="Director">Director</option>
                <option value="Directora General Vet">Directora General Vet</option>
                <option value="Médico Urgencista">Médico Urgencista</option>
                <option value="Cirujana Principal">Cirujana Principal</option>
                <option value="Auxiliar UCI Vet">Auxiliar UCI Vet</option>
                <option value="Recepción y Admisión">Recepción y Admisión</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Rol *</label>
              <select
                value={formData.rol}
                onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0073A5] bg-slate-50 focus:bg-white"
              >
                <option value="Administrador">Administrador</option>
                <option value="Médico Veterinario">Médico Veterinario</option>
                <option value="Auxiliar / Enfermero">Auxiliar / Enfermero</option>
                <option value="Recepción">Recepción</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Especialidad Veterinaria
              </label>
              <select
                value={formData.especialidad}
                onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0073A5] bg-slate-50 focus:bg-white"
              >
                <option value="Urgencias 24h">Urgencias 24h</option>
                <option value="Cirugía General">Cirugía General</option>
                <option value="Consulta General">Consulta General</option>
                <option value="Hospitalización">Hospitalización</option>
                <option value="Imagenología / Ecografía">Imagenología / Ecografía</option>
                <option value="Atención al Cliente">Atención al Cliente</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Teléfono</label>
              <input
                type="text"
                placeholder="+57 300 000 0000"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0073A5] bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Estado</label>
            <div className="flex items-center space-x-6 mt-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="estado"
                  value="Activo"
                  checked={formData.estado === "Activo"}
                  onChange={() => setFormData({ ...formData, estado: "Activo" })}
                  className="text-[#0073A5] focus:ring-[#0073A5]"
                />
                <span className="flex items-center text-emerald-700 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5"></span>
                  Activo
                </span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="estado"
                  value="Inactivo"
                  checked={formData.estado === "Inactivo"}
                  onChange={() => setFormData({ ...formData, estado: "Inactivo" })}
                  className="text-[#0073A5] focus:ring-[#0073A5]"
                />
                <span className="flex items-center text-red-700 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 mr-1.5"></span>
                  Inactivo
                </span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl border border-slate-300 text-slate-600 hover:bg-slate-100 font-medium transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-2xl bg-[#0073A5] hover:bg-[#005C8A] text-white font-bold flex items-center space-x-2 shadow-md hover:shadow-lg transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? "Guardando..." : "Guardar Usuario"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
