import React from 'react';
import {
  Building2,
  DollarSign,
  Truck,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  Plus,
  ArrowUpRight,
  ShieldAlert,
  HardHat,
  ArrowDownRight,
} from 'lucide-react';
import { Obra, FinancialAccount, InventoryItem, Vehicle, Employee, ObraExpense } from '../types';

interface DashboardProps {
  obras: Obra[];
  financials: FinancialAccount[];
  inventory: InventoryItem[];
  vehicles: Vehicle[];
  employees?: Employee[];
  expenses?: ObraExpense[];
  onNavigateToObra: (obraId: string) => void;
  onOpenNewObra: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  obras,
  financials,
  inventory,
  vehicles,
  employees = [],
  expenses = [],
  onNavigateToObra,
  onOpenNewObra,
  onNavigateToTab,
}) => {
  // Real Dynamic Calculations
  const activeObras = obras.filter((o) => o.status !== 'Finalizada' && o.status !== 'Cancelada');
  const totalContractValue = obras.reduce((acc, o) => acc + o.totalValue, 0);

  // 1. Real Receivables (Contas a Receber Pendentes)
  const totalObraValues = obras.reduce((acc, o) => acc + o.totalValue, 0);
  const totalReceberManualPendente = financials
    .filter((f) => f.type === 'Receber' && f.status === 'Pendente')
    .reduce((acc, f) => acc + f.totalValue, 0);
  const totalReceberPendente = totalObraValues + totalReceberManualPendente;

  // 2. Real Payables (Despesas de Obras + Fornecedores Pendentes)
  const totalObraExpenses = expenses.reduce((acc, e) => acc + e.value, 0);
  const totalPagarManualPendente = financials
    .filter((f) => f.type === 'Pagar' && f.status === 'Pendente')
    .reduce((acc, f) => acc + f.totalValue, 0);
  const totalPagarTotal = totalObraExpenses + totalPagarManualPendente;

  // 3. Real Efetivado (Baixado com Pagamento Confirmado)
  const totalRecebidoBaixado = financials
    .filter((f) => f.type === 'Receber' && f.status === 'Pago')
    .reduce((acc, f) => acc + f.totalValue, 0);

  // Obras com pendência no checklist/protocolo
  const obrasComPendencia = obras.filter((o) => o.protocolBlocked || o.missingProtocolItemsCount > 0);

  // Veículos ativos vs manutenção
  const activeVehicles = vehicles.filter((v) => v.status === 'Em Operação').length;
  const maintenanceVehicles = vehicles.filter((v) => v.status === 'Em Manutenção').length;

  // Colaboradores ativos
  const activeEmployeesCount = employees.filter((e) => e.status === 'Ativo').length;

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-base font-semibold text-zinc-100 flex items-center space-x-2 font-mono">
            <Building2 className="w-5 h-5 text-blue-500" />
            <span>Painel de Controle Operacional & Financeiro VoltGrid</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Resumo em tempo real de contratos ativas, medições pendentes, custos de obras e frotas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenNewObra}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Nova Obra</span>
          </button>

          {onNavigateToTab && (
            <button
              onClick={() => onNavigateToTab('financeiro')}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Ver Financeiro</span>
            </button>
          )}
        </div>
      </div>

      {/* Real Useful KPIs Grid (4 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Obras Ativas */}
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
              Obras em Andamento
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
              {activeObras.length} Ativas
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-zinc-100">
            R$ {totalContractValue.toLocaleString('pt-BR')}
          </div>
          <p className="text-[11px] text-zinc-400">
            Valor acumulado em {obras.length} obra(s) cadastrada(s)
          </p>
        </div>

        {/* KPI 2: Contas a Receber (Pendente) */}
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
              Contas a Receber (Pendente)
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
              Medições
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-amber-400">
            R$ {totalReceberPendente.toLocaleString('pt-BR')}
          </div>
          <p className="text-[11px] text-zinc-400">
            Aguardando quitação / baixa pelo cliente
          </p>
        </div>

        {/* KPI 3: Contas a Pagar (Custos Obras) */}
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
              Contas a Pagar (Despesas)
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono">
              A Pagar
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-rose-400">
            R$ {totalPagarTotal.toLocaleString('pt-BR')}
          </div>
          <p className="text-[11px] text-zinc-400">
            Soma de {expenses.length} despesa(s) de obras + faturas
          </p>
        </div>

        {/* KPI 4: Faturamento Recebido */}
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
              Faturamento Recebido
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              Baixado
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400">
            R$ {totalRecebidoBaixado.toLocaleString('pt-BR')}
          </div>
          <p className="text-[11px] text-zinc-400">
            Títulos baixados com pagamento efetuado
          </p>
        </div>
      </div>

      {/* Main Operational Dashboard Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Real Active Obras Operational Status */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Obras Table */}
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider font-mono">
                  Obras em Andamento & Progresso de Campo
                </h2>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Acompanhe a execução física, valor do contrato e despesas por obra.
                </p>
              </div>

              <button
                onClick={() => onNavigateToObra('')}
                className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center space-x-1 transition-colors"
              >
                <span>Ver Todas</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider font-mono text-[11px]">
                    <th className="py-2.5 px-2">Código</th>
                    <th className="py-2.5 px-2">Projeto / Cliente</th>
                    <th className="py-2.5 px-2">Estágio</th>
                    <th className="py-2.5 px-2">Execução</th>
                    <th className="py-2.5 px-2 text-right">Valor Contrato</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-medium">
                  {obras.map((obra) => {
                    const obraExpSum = expenses
                      .filter((e) => e.obraId === obra.id)
                      .reduce((acc, e) => acc + e.value, 0);

                    return (
                      <tr
                        key={obra.id}
                        onClick={() => onNavigateToObra(obra.id)}
                        className="hover:bg-zinc-950/60 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-2 font-mono font-bold text-blue-400">
                          {obra.projectNumber || obra.code}
                        </td>

                        <td className="py-3 px-2">
                          <div className="font-bold text-zinc-100">{obra.projectName}</div>
                          <div className="text-[10px] text-zinc-400">{obra.clientName} ({obra.concessionaria})</div>
                        </td>

                        <td className="py-3 px-2 font-mono">
                          <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 font-bold text-[10px]">
                            {obra.status}
                          </span>
                        </td>

                        <td className="py-3 px-2 font-mono">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-800">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${obra.percentageExecuted}%` }}
                              ></div>
                            </div>
                            <span className="text-[10px] font-bold text-zinc-300">
                              {obra.percentageExecuted}%
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-2 text-right font-mono">
                          <div className="font-bold text-zinc-100">
                            R$ {obra.totalValue.toLocaleString('pt-BR')}
                          </div>
                          <div className="text-[10px] text-rose-400">
                            Despesa: R$ {obraExpSum.toLocaleString('pt-BR')}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Useful Section: Protocol Checklists Alerts */}
          {obrasComPendencia.length > 0 && (
            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Atenção: Obras com Etapas / Checklist Pendentes</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {obrasComPendencia.length} Obra(s)
                </span>
              </div>

              <div className="space-y-2">
                {obrasComPendencia.map((o) => (
                  <div
                    key={o.id}
                    onClick={() => onNavigateToObra(o.id)}
                    className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs cursor-pointer hover:border-amber-500/40 transition-all font-mono"
                  >
                    <div>
                      <span className="font-bold text-zinc-100">{o.projectNumber || o.code} - {o.projectName}</span>
                      <p className="text-[10px] text-zinc-400 font-sans mt-0.5">
                        Concessionária: {o.concessionaria} • {o.missingProtocolItemsCount} item(ns) pendente(s) no checklist
                      </p>
                    </div>

                    <button className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold text-[10px] hover:bg-amber-500 hover:text-zinc-950 transition-all">
                      Acessar Obra
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (1 Col): Operational Summaries */}
        <div className="space-y-6">
          {/* Fleet Status Summary */}
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm space-y-3 font-sans">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-xs font-bold text-zinc-100 uppercase tracking-wider font-mono flex items-center space-x-2">
                <Truck className="w-4 h-4 text-amber-500" />
                <span>Resumo da Frota</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-400">Total: {vehicles.length}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-[10px] text-zinc-400 block">Em Operação</span>
                <span className="font-bold text-emerald-400 text-sm">{activeVehicles} veículos</span>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-[10px] text-zinc-400 block">Em Manutenção</span>
                <span className="font-bold text-rose-400 text-sm">{maintenanceVehicles} veículos</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              {vehicles.slice(0, 3).map((v) => (
                <div key={v.id} className="flex items-center justify-between text-xs font-mono p-2 rounded bg-zinc-950 border border-zinc-800/60">
                  <div>
                    <span className="font-bold text-zinc-200 block truncate max-w-[140px]">{v.model}</span>
                    <span className="text-[10px] text-zinc-500">{v.plate}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${v.status === 'Em Operação' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    {v.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Team / HR Summary */}
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm space-y-3 font-sans">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-xs font-bold text-zinc-100 uppercase tracking-wider font-mono flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span>Equipe & Recursos Humanos</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400">{activeEmployeesCount} Ativos</span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              {employees.slice(0, 3).map((emp) => (
                <div key={emp.id} className="flex items-center justify-between p-2 rounded bg-zinc-950 border border-zinc-800/60">
                  <div>
                    <span className="font-bold text-zinc-200 block">{emp.name}</span>
                    <span className="text-[10px] text-zinc-500 font-sans">{emp.role}</span>
                  </div>
                  <span className="text-[10px] text-amber-400 font-bold">
                    R$ {emp.dailyRate}/dia
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
