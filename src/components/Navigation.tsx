"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Users,
  Upload,
  Calendar,
  BarChart3,
  History,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Bell,
  LogOut,
  Smartphone,
  Stethoscope,
  Clock,
  Menu,
  X,
  Volume2,
  VolumeX,
  Sparkles,
  ShieldAlert,
} from "lucide-react";

interface NavigationProps {
  children: React.ReactNode;
}

export default function Navigation({ children }: NavigationProps) {
  const pathname = usePathname();
  const router = RouterHook();
  const [collapsed, setCollapsed] = useState(false);
  const [adminOpen, setAdminOpen] = useState(true);
  const [cargarOpen, setCargarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  function RouterHook() {
    try {
      return useRouter();
    } catch {
      return null;
    }
  }

  const notifications = [
    { id: 1, text: "Nuevo turno de Urgencias URG-101 registrado para 'Max'", time: "Hace 5 min", type: "urgency" },
    { id: 2, text: "Malla de turnos semanal generada con éxito", time: "Hace 20 min", type: "info" },
    { id: 3, text: "Solicitud de cambio de turno enviada por Dr. Camilo Arango", time: "Hace 1 hora", type: "warning" },
  ];

  const mainMenuItems = [
    { name: "Home", path: "/dashboard", icon: Home },
    {
      name: "Administrar",
      path: "/usuarios",
      icon: Users,
      hasSubmenu: true,
      isOpen: adminOpen,
      toggle: () => setAdminOpen(!adminOpen),
      subItems: [
        { name: "Consultar usuarios", path: "/usuarios" },
        { name: "Asociar usuario", path: "/usuarios?action=new" },
      ],
    },
    {
      name: "Cargar Archivos",
      path: "/cargar-archivos",
      icon: Upload,
      hasSubmenu: true,
      isOpen: cargarOpen,
      toggle: () => setCargarOpen(!cargarOpen),
      subItems: [
        { name: "Subir Malla / Excel", path: "/cargar-archivos" },
        { name: "Historial de cargas", path: "/cargar-archivos#historial" },
      ],
    },
    { name: "Generar mallas turnos", path: "/mallas", icon: Calendar },
    { name: "Turnos Pacientes", path: "/turnos-pacientes", icon: Clock },
    { name: "Reportes", path: "/reportes", icon: BarChart3 },
    { name: "Historial", path: "/historial", icon: History },
    { name: "App Móvil", path: "/movil", icon: Smartphone, highlight: true },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F5F8] text-slate-800 font-sans antialiased">
      {/* Top Header Bar matching Keralty Design */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 px-4 lg:px-6 py-3 flex items-center justify-between shadow-xs">
        {/* Left Logo Section */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-[#005C8A] via-[#0073A5] to-[#00A896] text-white shadow-md shadow-cyan-900/20 group-hover:scale-105 transition-transform">
              <span className="font-extrabold text-xl tracking-tighter">K</span>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
              </span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-black tracking-tight text-[#003E5C]">Keralty</span>
                <span className="text-sm font-light text-slate-400 border-l border-slate-300 pl-2">
                  Opti Turnos
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold text-teal-700 tracking-wider">
                Salud Veterinaria
              </span>
            </div>
          </Link>
        </div>

        {/* Right Header User Controls & Status */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Sound caller toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-full transition-all flex items-center space-x-1.5 text-xs font-medium ${
              soundEnabled
                ? "bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100"
                : "bg-slate-100 text-slate-500 border border-slate-200"
            }`}
            title={soundEnabled ? "Llamado por audio activado" : "Llamado por audio desactivado"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-teal-600" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden md:inline">{soundEnabled ? "Audio On" : "Mute"}</span>
          </button>

          {/* User Profile Pill matching uploaded image */}
          <div className="flex items-center space-x-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-full px-3 py-1.5 transition">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
              alt="Laura Carolina Rodríguez"
              className="w-8 h-8 rounded-full object-cover border-2 border-[#0073A5]"
            />
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 leading-tight">
                Laura Carolina Rodríguez
              </span>
              <span className="text-[11px] font-medium text-slate-500 leading-none">
                Administrador
              </span>
            </div>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-full bg-[#0073A5] hover:bg-[#005C8A] text-white transition shadow-sm"
              title="Notificaciones"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 p-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                  <span className="font-bold text-sm text-slate-800 flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-[#0073A5]" />
                    <span>Notificaciones OptiTurnos</span>
                  </span>
                  <span className="text-xs bg-teal-100 text-teal-800 font-semibold px-2 py-0.5 rounded-full">
                    3 nuevas
                  </span>
                </div>
                <div className="space-y-2.5 max-h-64 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-2.5 bg-slate-50 hover:bg-teal-50/50 rounded-xl border border-slate-100 text-xs transition flex flex-col space-y-1"
                    >
                      <span className="font-medium text-slate-700">{n.text}</span>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Logout / Switch Role Button */}
          <Link
            href="/movil"
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
            title="Vista Móvil Paciente / Personal"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Curved Blue Sidebar Matching exact uploaded screenshot style */}
        <aside
          className={`hidden lg:flex flex-col transition-all duration-300 ease-in-out z-30 p-3 ${
            collapsed ? "w-20" : "w-64"
          }`}
        >
          <div className="flex-1 bg-[#0073A5] rounded-3xl p-3 flex flex-col justify-between shadow-xl text-white relative">
            {/* Collapse button inside upper circle */}
            <div className="flex justify-start mb-2">
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition"
                title={collapsed ? "Expandir menú" : "Colapsar menú"}
              >
                {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
              </button>
            </div>

            {/* Main Nav Items */}
            <div className="space-y-1 overflow-y-auto py-2 pr-1 custom-scrollbar flex-1">
              {mainMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path || (item.path !== "/" && pathname.startsWith(item.path));

                if (item.hasSubmenu) {
                  return (
                    <div key={item.name} className="flex flex-col">
                      <button
                        onClick={item.toggle}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl transition font-medium text-xs sm:text-sm ${
                          isActive
                            ? "bg-white text-[#0073A5] shadow-md font-bold"
                            : "text-white/90 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isActive ? "bg-[#0073A5] text-white" : "bg-white/15 text-white"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          {!collapsed && <span>{item.name}</span>}
                        </div>
                        {!collapsed && (
                          <ChevronDown
                            className={`w-4 h-4 transition-transform ${item.isOpen ? "rotate-180" : ""}`}
                          />
                        )}
                      </button>

                      {!collapsed && item.isOpen && item.subItems && (
                        <div className="ml-10 my-1 space-y-1 border-l-2 border-white/20 pl-2">
                          {item.subItems.map((sub) => {
                            const isSubActive = pathname === sub.path;
                            return (
                              <Link
                                key={sub.name}
                                href={sub.path}
                                className={`block px-3 py-1.5 rounded-xl text-xs transition ${
                                  isSubActive
                                    ? "bg-white/20 text-white font-bold"
                                    : "text-white/80 hover:text-white hover:bg-white/10"
                                }`}
                              >
                                {sub.name}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.name}
                    href={item.path}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-2xl transition font-medium text-xs sm:text-sm ${
                      item.highlight
                        ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg"
                        : isActive
                        ? "bg-white text-[#0073A5] shadow-md font-bold"
                        : "text-white/90 hover:bg-white/10"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        item.highlight
                          ? "bg-white/20 text-white"
                          : isActive
                          ? "bg-[#0073A5] text-white"
                          : "bg-white/15 text-white"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    {!collapsed && (
                      <div className="flex items-center justify-between flex-1">
                        <span>{item.name}</span>
                        {item.highlight && (
                          <span className="text-[10px] bg-white text-emerald-800 px-1.5 py-0.5 rounded-full font-bold">
                            Móvil
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Bottom Vet Badge */}
            {!collapsed && (
              <div className="mt-4 p-3 bg-white/10 rounded-2xl border border-white/10 flex items-center space-x-3 text-xs">
                <Stethoscope className="w-6 h-6 text-teal-300 flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="font-bold text-white">Sede Principal Vet</span>
                  <span className="text-[10px] text-teal-200">Urgencias 24h Activo</span>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Mobile Slide-over Drawer Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            ></div>
            <div className="relative flex-1 max-w-xs w-full bg-[#0073A5] text-white p-4 flex flex-col justify-between shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-white/20">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-500 flex items-center justify-center font-black">
                    K
                  </div>
                  <span className="font-bold text-lg">OptiTurnos Vet</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg bg-white/10">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="my-4 space-y-2 overflow-y-auto flex-1">
                {mainMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      href={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-3 rounded-2xl font-medium text-sm transition ${
                        isActive ? "bg-white text-[#0073A5] font-bold" : "text-white hover:bg-white/10"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="p-3 bg-white/10 rounded-2xl border border-white/10 text-xs">
                <span className="font-bold">Atención Veterinaria Keralty</span>
                <p className="text-[11px] text-teal-200 mt-1">Sedes Norte, Centro y Sur</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Workspace Area */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 pb-20 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar for Smartphone Experience */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-2 flex items-center justify-around shadow-2xl">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center text-[10px] font-medium p-1 rounded-xl transition ${
            pathname === "/" ? "text-[#0073A5] font-bold" : "text-slate-500"
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </Link>
        <Link
          href="/usuarios"
          className={`flex flex-col items-center justify-center text-[10px] font-medium p-1 rounded-xl transition ${
            pathname === "/usuarios" ? "text-[#0073A5] font-bold" : "text-slate-500"
          }`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span>Usuarios</span>
        </Link>
        <Link
          href="/mallas"
          className={`flex flex-col items-center justify-center text-[10px] font-medium p-1 rounded-xl transition ${
            pathname === "/mallas" ? "text-[#0073A5] font-bold" : "text-slate-500"
          }`}
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          <span>Mallas</span>
        </Link>
        <Link
          href="/turnos-pacientes"
          className={`flex flex-col items-center justify-center text-[10px] font-medium p-1 rounded-xl transition ${
            pathname === "/turnos-pacientes" ? "text-[#0073A5] font-bold" : "text-slate-500"
          }`}
        >
          <Clock className="w-5 h-5 mb-0.5" />
          <span>Turnos</span>
        </Link>
        <Link
          href="/movil"
          className={`flex flex-col items-center justify-center text-[10px] font-medium p-1 rounded-xl transition ${
            pathname === "/movil" ? "text-emerald-600 font-bold" : "text-slate-500"
          }`}
        >
          <Smartphone className="w-5 h-5 mb-0.5 text-emerald-600" />
          <span>App Móvil</span>
        </Link>
      </nav>
    </div>
  );
}
