import React, { useState } from 'react';
import {
  Zap,
  Sun,
  Moon,
  Search,
  Bell,
  UserCheck,
  ShieldCheck,
  ChevronDown,
  User,
} from 'lucide-react';
import { UserRole, SystemUserItem } from '../types';

interface HeaderProps {
  role?: UserRole;
  currentRole?: UserRole;
  onRoleChange: (role: UserRole) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenOCR?: () => void;
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
  pendingAlertsCount?: number;
  registeredUsers?: SystemUserItem[];
  activeUser?: SystemUserItem | null;
  onSelectUser?: (user: SystemUserItem | null) => void;
}

export const Header: React.FC<HeaderProps> = ({
  role,
  currentRole,
  onRoleChange,
  darkMode,
  onToggleDarkMode,
  onOpenOCR,
  searchTerm = '',
  onSearchChange,
  pendingAlertsCount = 0,
  registeredUsers = [],
  activeUser,
  onSelectUser,
}) => {
  const [showNotificationsPopover, setShowNotificationsPopover] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const activeRole = activeUser ? activeUser.role : role || currentRole || 'Diretor';
  const activeName = activeUser ? activeUser.name : 'Administrador Master';

  return (
    <header
      className={`sticky top-0 z-30 h-16 border-b transition-colors print:hidden ${
        darkMode
          ? 'border-zinc-800/80 bg-zinc-950/90 text-zinc-50'
          : 'border-zinc-200 bg-white/95 text-zinc-900 shadow-sm'
      } backdrop-blur-md px-4 sm:px-6 flex items-center justify-between`}
    >
      {/* Brand Logo & Title */}
      <div className="flex items-center space-x-3">
        <div
          className={`w-9 h-9 rounded-lg border flex items-center justify-center shadow-sm ${
            darkMode
              ? 'bg-blue-600/10 border-blue-500/30 text-blue-500'
              : 'bg-blue-50 border-blue-200 text-blue-600'
          }`}
        >
          <Zap className="w-5 h-5 fill-blue-500/20 stroke-[2.2]" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span
              className={`font-extrabold text-lg tracking-tight font-sans ${
                darkMode ? 'text-zinc-50' : 'text-zinc-900'
              }`}
            >
              Pro<span className="text-blue-500">Obras</span>
            </span>
            <span
              className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full border font-mono ${
                darkMode
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}
            >
              RDU • RDR
            </span>
          </div>
          <p className={`text-[11px] font-medium hidden sm:block ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Gestão e Organização de Obras de Energia
          </p>
        </div>
      </div>

      {/* Quick Search */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar por código de obra, cliente, ART, placa ou material..."
            value={searchTerm}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 text-xs rounded-lg border focus:outline-none transition-all font-sans ${
              darkMode
                ? 'bg-zinc-900 text-zinc-200 border-zinc-800 focus:border-blue-500/50 placeholder:text-zinc-500'
                : 'bg-zinc-100 text-zinc-800 border-zinc-200 focus:border-blue-500 placeholder:text-zinc-400'
            }`}
          />
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Status Chip */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[11px] text-blue-400 font-semibold font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
          Sincronizado
        </div>

        {/* OCR Reader Shortcut */}
        {onOpenOCR && (
          <button
            onClick={onOpenOCR}
            title="Leitor OCR Inteligente de Notas e ARTs"
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center space-x-1.5 transition-all cursor-pointer ${
              darkMode
                ? 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                : 'border-zinc-200 bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden xl:inline">Leitor OCR</span>
          </button>
        )}

        {/* Notifications Button & Popover */}
        <div className="relative">
          <button
            title="Central de Pendências e Vencimentos"
            onClick={() => setShowNotificationsPopover(!showNotificationsPopover)}
            className={`p-2 rounded-lg border relative transition-all cursor-pointer ${
              darkMode
                ? 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                : 'border-zinc-200 bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            <Bell className="w-4 h-4" />
            {pendingAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white font-bold text-[9px] font-mono rounded-full flex items-center justify-center animate-pulse">
                {pendingAlertsCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotificationsPopover && (
            <div
              className={`absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border shadow-2xl p-4 z-50 space-y-3 font-sans ${
                darkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
              }`}
            >
              <div className="flex items-center justify-between border-b pb-2.5 border-zinc-800/80">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-amber-500" />
                  <span className="font-bold text-xs font-mono uppercase tracking-wider">
                    Central de Alertas & Vencimentos
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400">
                  {pendingAlertsCount} Alertas
                </span>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1 text-xs">
                {/* Category 1: Documentação & ARTs */}
                <div className={`p-3 rounded-xl border space-y-1 ${darkMode ? 'bg-zinc-950 border-amber-500/30' : 'bg-amber-50/60 border-amber-200'}`}>
                  <div className="flex items-center justify-between font-bold text-[11px] text-amber-500 font-mono">
                    <span>📄 DOCUMENTAÇÃO & ARTS A VENCER</span>
                    <span className="text-[10px]">Atenção</span>
                  </div>
                  <p className={`text-[11px] leading-relaxed ${darkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
                    Existem laudos técnicos de transformador, ARTs de subestação e documentos da empresa prestes a vencer nos próximos 30 dias.
                  </p>
                </div>

                {/* Category 2: Contas a Pagar / Financeiro */}
                <div className={`p-3 rounded-xl border space-y-1 ${darkMode ? 'bg-zinc-950 border-rose-500/30' : 'bg-rose-50/60 border-rose-200'}`}>
                  <div className="flex items-center justify-between font-bold text-[11px] text-rose-500 font-mono">
                    <span>💰 CONTAS A PAGAR VENCENDO HOJE</span>
                    <span className="text-[10px]">Financeiro</span>
                  </div>
                  <p className={`text-[11px] leading-relaxed ${darkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
                    {pendingAlertsCount} títulos de fornecedores e faturas pendentes de liquidação na carteira do Financeiro.
                  </p>
                </div>

                {/* Category 3: Frota e Manutenção */}
                <div className={`p-3 rounded-xl border space-y-1 ${darkMode ? 'bg-zinc-950 border-blue-500/30' : 'bg-blue-50/60 border-blue-200'}`}>
                  <div className="flex items-center justify-between font-bold text-[11px] text-blue-500 font-mono">
                    <span>⛽ FROTA & MANUTENÇÃO PREVENTIVA</span>
                    <span className="text-[10px]">Operacional</span>
                  </div>
                  <p className={`text-[11px] leading-relaxed ${darkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
                    Veículos Munck e Caminhonetes com revisão agendada e lançamentos de combustível para validação.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800 text-center">
                <button
                  onClick={() => setShowNotificationsPopover(false)}
                  className="text-[11px] font-bold text-blue-500 hover:underline cursor-pointer"
                >
                  Fechar Central de Alertas
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Dark/Light Mode Toggle */}
        <button
          onClick={onToggleDarkMode}
          title={darkMode ? 'Mudar para Modo Claro ☀️' : 'Mudar para Modo Escuro 🌙'}
          className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
            darkMode
              ? 'border-zinc-800 bg-zinc-900 text-amber-400 hover:bg-zinc-800'
              : 'border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100 shadow-sm'
          }`}
        >
          {darkMode ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Modo Escuro 🌙</span>
            </>
          ) : (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden md:inline">Modo Claro ☀️</span>
            </>
          )}
        </button>

        {/* Registered User Profile Selector Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
            className={`flex items-center space-x-2 pl-2 border-l cursor-pointer ${darkMode ? 'border-zinc-800' : 'border-zinc-200'}`}
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xs">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="hidden xl:block text-left">
              <p className={`text-xs font-bold leading-tight ${darkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>
                {activeName}
              </p>
              <p className="text-[10px] text-indigo-500 font-mono font-semibold">{activeRole}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500 hidden xl:block" />
          </button>

          {/* Role / Registered Users Dropdown */}
          {showRoleSwitcher && (
          <div
            className={`absolute right-0 top-full mt-2 w-64 rounded-xl border shadow-2xl transition-all duration-200 p-2 z-50 ${
              darkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
            }`}
          >
            <div className="px-3 py-1.5 border-b border-zinc-800/80 mb-1 flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">
                Perfis Cadastrados
              </span>
              <span className="text-[10px] font-mono text-indigo-500 font-bold">
                {registeredUsers.length} perfil(is)
              </span>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1">
              {registeredUsers.length === 0 ? (
                <div className="p-3 text-center space-y-1">
                  <p className="text-xs text-zinc-400 font-medium">Nenhum perfil cadastrado.</p>
                  <p className="text-[10px] text-zinc-500 font-mono">
                    Cadastre usuários em <span className="text-amber-500 font-bold">CADASTRO</span> para liberar acessos personalizados.
                  </p>
                </div>
              ) : (
                registeredUsers.map((u) => {
                  const isSelected = activeUser?.id === u.id || (!activeUser && u.role === activeRole);
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        onRoleChange(u.role);
                        if (onSelectUser) onSelectUser(u);
                        setShowRoleSwitcher(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-center justify-between border cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30 font-bold'
                          : 'bg-zinc-950/50 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-zinc-100 text-xs flex items-center space-x-1.5">
                          <User className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{u.name}</span>
                        </div>
                        <div className="text-[10px] font-mono text-zinc-400 flex items-center space-x-2 mt-0.5">
                          <span className="text-indigo-400">{u.role}</span>
                          <span>•</span>
                          <span>{u.allowedModules ? u.allowedModules.length : 0} módulo(s)</span>
                        </div>
                      </div>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-indigo-500"></span>}
                    </button>
                  );
                })
              )}
            </div>
          </div>
          )}
        </div>
      </div>
    </header>
  );
};
