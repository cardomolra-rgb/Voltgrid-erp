import React from 'react';
import {
  HardHat,
  Truck,
  UserCheck,
  FileCheck,
  Users,
  DollarSign,
  FileText,
  SlidersHorizontal,
  ShieldCheck,
  Building2,
  FolderCheck,
} from 'lucide-react';

export type ActiveTab =
  | 'obras'
  | 'frota'
  | 'rh'
  | 'documentacao'
  | 'crm'
  | 'financeiro'
  | 'relatorios'
  | 'cadastros'
  | 'cadastros_usuarios'
  | 'cadastros_fornecedores'
  | 'cadastros_documentos_empresa';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  allowedModules?: string[];
  counts?: {
    obrasCount?: number;
    clientsCount?: number;
    expiredCompanyDocsCount?: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, allowedModules, counts }) => {
  const isModuleAllowed = (itemId: string) => {
    if (!allowedModules || allowedModules.length === 0) return true;
    if (allowedModules.includes('*')) return true;

    if (itemId === 'obras') return allowedModules.includes('obras');
    if (itemId === 'frota') return allowedModules.includes('frota');
    if (itemId === 'rh') return allowedModules.includes('rh');
    if (itemId === 'documentacao') return allowedModules.includes('documentacao');
    if (itemId === 'crm' || itemId === 'clientes') return allowedModules.includes('crm');
    if (itemId === 'financeiro') return allowedModules.includes('financeiro');
    if (itemId === 'relatorios') return allowedModules.includes('relatorios');
    if (itemId.startsWith('cadastros')) return allowedModules.includes('cadastros');

    return true;
  };

  const GROUPS: Array<{ title: string; items: Array<{ id: string; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }> }> = [
    {
      title: 'OPERACIONAL',
      items: [
        {
          id: 'obras',
          label: 'Obras Ativas',
          icon: <HardHat className="w-4 h-4 text-blue-400" />,
          badge: counts?.obrasCount,
          badgeColor: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
        },
        {
          id: 'frota',
          label: 'Gestão de Frota',
          icon: <Truck className="w-4 h-4 text-zinc-400" />,
        },
        {
          id: 'rh',
          label: 'Gestão de Equipes',
          icon: <UserCheck className="w-4 h-4 text-emerald-400" />,
        },
      ],
    },
    {
      title: 'COMERCIAL',
      items: [
        {
          id: 'documentacao',
          label: 'Contratos',
          icon: <FileCheck className="w-4 h-4 text-blue-400" />,
        },
        {
          id: 'crm',
          label: 'Proposta Comercial',
          icon: <FileText className="w-4 h-4 text-amber-400" />,
        },
        {
          id: 'clientes',
          label: 'Gestão de Clientes',
          icon: <Users className="w-4 h-4 text-blue-400" />,
          badge: counts?.clientsCount,
        },
      ],
    },
    {
      title: 'FINANCEIRO',
      items: [
        {
          id: 'financeiro',
          label: 'DRE',
          icon: <DollarSign className="w-4 h-4 text-emerald-400" />,
        },
        {
          id: 'relatorios',
          label: 'Relatório Financeiro',
          icon: <FileText className="w-4 h-4 text-cyan-400" />,
        },
      ],
    },
    {
      title: 'CADASTRO',
      items: [
        {
          id: 'cadastros',
          label: 'Cadastro do Sistema',
          icon: <SlidersHorizontal className="w-4 h-4 text-amber-400" />,
        },
      ],
    },
  ];

  return (
    <aside className="w-60 shrink-0 hidden md:flex flex-col border-r border-zinc-800/80 bg-zinc-950 min-h-[calc(100vh-4rem)] p-4 transition-colors font-sans print:hidden">
      <div className="space-y-6 flex-1">
        {GROUPS.map((group) => {
          const visibleItems = group.items.filter((item) => isModuleAllowed(item.id));
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.title} className="space-y-1.5">
              <div className="px-3 text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest font-mono">
                {group.title}
              </div>
              {visibleItems.map((item) => {
                const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md font-bold'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge !== null && item.badge > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                        item.badgeColor || 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        );
      })}
      </div>
    </aside>
  );
};
