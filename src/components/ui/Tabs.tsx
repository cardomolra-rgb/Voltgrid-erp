import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number | string;
}

interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  /** 'bar' = barra de abas de topo de módulo. 'chip' = fileira de chips com overflow horizontal (filtros, sub-abas de modal). */
  variant?: 'bar' | 'chip';
  accentColor?: 'amber' | 'blue' | 'emerald';
  className?: string;
}

const ACCENT_ACTIVE: Record<NonNullable<TabsProps['accentColor']>, string> = {
  amber: 'bg-amber-500 text-zinc-950',
  blue: 'bg-blue-500 text-zinc-950',
  emerald: 'bg-emerald-500 text-zinc-950',
};

const ACCENT_BADGE: Record<NonNullable<TabsProps['accentColor']>, string> = {
  amber: 'text-amber-400',
  blue: 'text-blue-400',
  emerald: 'text-emerald-400',
};

export const Tabs: React.FC<TabsProps> = ({
  items,
  activeId,
  onChange,
  variant = 'bar',
  accentColor = 'amber',
  className = '',
}) => {
  const wrapperClass =
    variant === 'chip'
      ? 'flex items-center space-x-1 overflow-x-auto'
      : 'flex items-center space-x-1 border-b border-zinc-800 pb-2';

  return (
    <div className={`${wrapperClass} ${className}`}>
      {items.map((tab) => {
        const isActive = activeId === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`px-3 py-2 rounded-xl whitespace-nowrap text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              isActive
                ? `${ACCENT_ACTIVE[accentColor]} shadow-sm`
                : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge !== null && (
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-zinc-950/20 text-zinc-950' : `bg-zinc-950 ${ACCENT_BADGE[accentColor]}`
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
