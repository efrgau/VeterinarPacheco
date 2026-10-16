"use client";

import React, { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import UserModal from "@/components/UserModal";
import {
  Search,
  Plus,
  Edit2,
  Filter,
  CheckCircle2,
  XCircle,
  Users,
  ShieldCheck,
  Stethoscope,
  RefreshCw,
  Sparkles,
} from "lucide-react";

interface User {
  id: number;
  usuario: string;
  cedula: string;
  nombres: string;
  cargo: string;
  rol: string;
  especialidad?: string;
  estado: string;
  avatar?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEstado, setSelectedEstado] = useState("todos");
  const [selectedRol, setSelectedRol] = useState("todos");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("query", searchQuery);
      if (selectedEstado !== "todos") params.append("estado", selectedEstado);
      if (selectedRol !== "todos") params.append("rol", selectedRol);

      const res = await fetch(`/api/users?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleStatus = async (user: User) => {
    const newStatus = user.estado === "Activo" ? "Inactivo" : "Activo";
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, estado: newStatus } : u))
        );
      }
    } catch (err) {
      console.error("Error toggling status:", err);
    }
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  return (
    <Navigation>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Title Header & Breadcrumbs matching screenshot */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#0073A5] tracking-tight">
              Consultar usuarios
            </h1>
            <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1 font-medium">
              <span>Inicio</span>
              <span>/</span>
              <span className="text-slate-800 font-semibold">Usuarios</span>
            </div>
          </div>

          {/* Right Action Button matching screenshot */}
          <button
            onClick={handleOpenCreate}
            className="self-start md:self-auto bg-[#0073A5] hover:bg-[#005C8A] text-white font-bold px-6 py-3 rounded-full flex items-center space-x-2 shadow-md hover:shadow-lg transition group text-sm"
          >
            <span>Asociar usuario</span>
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        {/* Filter & Search Bar matching exact screenshot controls */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80">
          <form onSubmit={handleFilter} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0073A5] focus:bg-white transition"
              />
            </div>

            {/* Estado Select */}
            <div className="md:col-span-3">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Estado
              </label>
              <select
                value={selectedEstado}
                onChange={(e) => setSelectedEstado(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0073A5] focus:bg-white transition"
              >
                <option value="todos">Selecciona...</option>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>

            {/* Rol Select */}
            <div className="md:col-span-3">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Rol
              </label>
              <select
                value={selectedRol}
                onChange={(e) => setSelectedRol(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0073A5] focus:bg-white transition"
              >
                <option value="todos">Selecciona...</option>
                <option value="Administrador">Administrador</option>
                <option value="Médico Veterinario">Médico Veterinario</option>
                <option value="Auxiliar / Enfermero">Auxiliar / Enfermero</option>
                <option value="Recepción">Recepción</option>
              </select>
            </div>

            {/* Filter Submit Button */}
            <div className="md:col-span-1">
              <button
                type="submit"
                className="w-full bg-[#0073A5] hover:bg-[#005C8A] text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center text-xs sm:text-sm transition shadow-sm"
              >
                Filtrar
              </button>
            </div>
          </form>
        </div>

        {/* Users Table (Desktop View) & Cards (Mobile View) */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-[#0073A5]" />
              <span className="text-sm font-medium">Cargando lista de usuarios...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center space-y-2">
              <Users className="w-12 h-12 text-slate-300" />
              <p className="font-bold text-slate-700">No se encontraron usuarios</p>
              <p className="text-xs text-slate-400">Intenta cambiar los filtros de búsqueda</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[#003E5C] text-xs font-bold uppercase tracking-wider bg-slate-50/50">
                      <th className="py-4 px-6">Usuario</th>
                      <th className="py-4 px-6">Cédula</th>
                      <th className="py-4 px-6">Nombres y apellidos</th>
                      <th className="py-4 px-6">Cargo</th>
                      <th className="py-4 px-6">Rol</th>
                      <th className="py-4 px-6">Estado</th>
                      <th className="py-4 px-6 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                    {users.map((user) => {
                      const isActive = user.estado === "Activo";
                      return (
                        <tr
                          key={user.id}
                          className="hover:bg-slate-50/80 transition-colors group"
                        >
                          <td className="py-4 px-6 font-medium text-slate-800">
                            {user.usuario}
                          </td>
                          <td className="py-4 px-6 text-slate-600 font-mono">
                            {user.cedula}
                          </td>
                          <td className="py-4 px-6 font-bold text-slate-900">
                            {user.nombres}
                          </td>
                          <td className="py-4 px-6 text-slate-600">
                            {user.cargo}
                          </td>
                          <td className="py-4 px-6 font-medium text-slate-700">
                            {user.rol}
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                                isActive
                                  ? "text-emerald-700 bg-emerald-50"
                                  : "text-red-700 bg-red-50"
                              }`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  isActive ? "bg-emerald-500" : "bg-red-500"
                                }`}
                              ></span>
                              <span>{user.estado}</span>
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-center space-x-3">
                              {/* Edit Icon Button */}
                              <button
                                onClick={() => handleOpenEdit(user)}
                                className="p-2 rounded-xl text-[#0073A5] bg-[#0073A5]/10 hover:bg-[#0073A5]/20 transition"
                                title="Editar usuario"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              {/* Toggle Switch */}
                              <button
                                onClick={() => handleToggleStatus(user)}
                                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                                  isActive ? "bg-[#0073A5]" : "bg-slate-300"
                                }`}
                                title={isActive ? "Desactivar usuario" : "Activar usuario"}
                              >
                                <div
                                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                                    isActive ? "translate-x-6" : "translate-x-0"
                                  }`}
                                />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="md:hidden divide-y divide-slate-100 p-2">
                {users.map((user) => {
                  const isActive = user.estado === "Activo";
                  return (
                    <div key={user.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-xs text-slate-400 font-mono">{user.cedula}</span>
                          <h3 className="font-bold text-slate-900 text-sm">{user.nombres}</h3>
                          <p className="text-xs text-slate-600">{user.usuario}</p>
                        </div>
                        <span
                          className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isActive ? "text-emerald-700 bg-emerald-50" : "text-red-700 bg-red-50"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${isActive ? "bg-emerald-500" : "bg-red-500"}`}
                          ></span>
                          <span>{user.estado}</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div>
                          <span className="text-slate-400 block text-[10px]">CARGO / ROL</span>
                          <span className="font-semibold text-slate-700">
                            {user.cargo} • {user.rol}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleOpenEdit(user)}
                            className="p-2 rounded-lg text-[#0073A5] bg-[#0073A5]/10"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors ${
                              isActive ? "bg-[#0073A5]" : "bg-slate-300"
                            }`}
                          >
                            <div
                              className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform ${
                                isActive ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* User Modal for Add / Edit */}
      <UserModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={fetchUsers}
        initialData={editingUser}
      />
    </Navigation>
  );
}
