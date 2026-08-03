import React, { useState } from 'react';
import {
  FileText,
  FileSpreadsheet,
  Printer,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Truck,
  UserCheck,
} from 'lucide-react';
import { Obra, Client, FinancialAccount, FuelLog, ObraExpense, Employee, EmployeePaymentLog, SystemCompanyConfig } from '../types';

interface ReportsModuleProps {
  obras: Obra[];
  clients: Client[];
  financials: FinancialAccount[];
  fuelLogs: FuelLog[];
  expenses?: ObraExpense[];
  employees?: Employee[];
  paymentLogs?: EmployeePaymentLog[];
  companyConfig?: SystemCompanyConfig;
}

export const ReportsModule: React.FC<ReportsModuleProps> = ({
  obras,
  clients,
  financials,
  fuelLogs,
  expenses = [],
  employees = [],
  paymentLogs = [],
  companyConfig,
}) => {
  const [selectedReportType, setSelectedReportType] = useState<
    'dre_executivo' | 'lucro_obra' | 'balanco_funcionario' | 'custo_frota'
  >('dre_executivo');

  // Month & Year Filter state ('TODOS' or 'YYYY-MM')
  const [selectedMonth, setSelectedMonth] = useState<string>('TODOS');

  // Helper to extract YYYY-MM
  const getMonthYear = (dateStr?: string) => {
    if (!dateStr) return '';
    return dateStr.substring(0, 7);
  };

  // Filtered dataset according to selected Month
  const filteredFinancials = financials.filter((f) => {
    if (selectedMonth === 'TODOS') return true;
    const fMonth = getMonthYear(f.dueDate) || getMonthYear(f.paymentDate);
    return fMonth === selectedMonth;
  });

  const filteredFuelLogs = fuelLogs.filter((fl) => {
    if (selectedMonth === 'TODOS') return true;
    return getMonthYear(fl.date) === selectedMonth;
  });

  const filteredObras = obras.filter((o) => {
    if (selectedMonth === 'TODOS') return true;
    const oMonth = getMonthYear(o.startDate) || getMonthYear(o.createdAt);
    return oMonth === selectedMonth;
  });

  const filteredExpenses = expenses.filter((exp) => {
    if (selectedMonth === 'TODOS') return true;
    return getMonthYear(exp.date) === selectedMonth;
  });

  const filteredPaymentLogs = paymentLogs.filter((p) => {
    if (selectedMonth === 'TODOS') return true;
    return getMonthYear(p.paymentDate) === selectedMonth;
  });

  // Dynamic precise calculations for selected month/period
  const totalReceitaBruta =
    filteredFinancials.filter((f) => f.type === 'Receber').reduce((acc, f) => acc + (f.totalValue || 0), 0) ||
    filteredObras.reduce((acc, o) => acc + (o.totalValue || 0), 0);

  const taxRatePercent = companyConfig?.aliquotaImpostoPercent ?? 9;
  const taxRate = taxRatePercent / 100;
  const totalImpostosTaxas = totalReceitaBruta * taxRate;
  const receitaLiquida = totalReceitaBruta - totalImpostosTaxas;

  // Financial Accounts Pagar + Standalone Obra Expenses
  const totalDespesasPagarFinancials = filteredFinancials
    .filter((f) => f.type === 'Pagar')
    .reduce((acc, f) => acc + (f.totalValue || 0), 0);

  // Standalone Obra Expenses that may not be in financials directly
  const totalObraExpensesStandalone = filteredExpenses
    .filter((exp) => !filteredFinancials.some((f) => f.id === `FIN-EXP-${exp.id}`))
    .reduce((acc, exp) => acc + (exp.value || 0), 0);

  const totalDespesasPagar = totalDespesasPagarFinancials + totalObraExpensesStandalone;

  const totalCombustivel =
    filteredFuelLogs.reduce((acc, fl) => acc + (fl.totalValue || 0), 0) ||
    filteredFinancials
      .filter((f) => f.category === 'Frota/Combustível')
      .reduce((acc, f) => acc + (f.totalValue || 0), 0);

  const totalObraExpenses = filteredExpenses.reduce((acc, exp) => acc + (exp.value || 0), 0);

  const lucroLiquidoOperacional = receitaLiquida - totalDespesasPagar;
  const margemPercentual =
    totalReceitaBruta > 0 ? ((lucroLiquidoOperacional / totalReceitaBruta) * 100).toFixed(1) : '0.0';

  // Available Months selector options
  const monthsOptions = [
    { value: 'TODOS', label: '🗓️ Todo o Período (Acumulado Geral)' },
    { value: '2026-01', label: 'Janeiro / 2026' },
    { value: '2026-02', label: 'Fevereiro / 2026' },
    { value: '2026-03', label: 'Março / 2026' },
    { value: '2026-04', label: 'Abril / 2026' },
    { value: '2026-05', label: 'Maio / 2026' },
    { value: '2026-06', label: 'Junho / 2026' },
    { value: '2026-07', label: 'Julho / 2026' },
    { value: '2026-08', label: 'Agosto / 2026' },
    { value: '2026-09', label: 'Setembro / 2026' },
    { value: '2026-10', label: 'Outubro / 2026' },
    { value: '2026-11', label: 'Novembro / 2026' },
    { value: '2026-12', label: 'Dezembro / 2026' },
  ];

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (selectedReportType === 'lucro_obra') {
      csvContent += 'Codigo,Projeto,Cliente,ValorContrato,GastosLancados,LucroRealizado,MargemPercentual\n';
      filteredObras.forEach((o) => {
        const obraExpensesSum = filteredExpenses
          .filter((exp) => exp.obraId === o.id)
          .reduce((acc, exp) => acc + (exp.value || 0), 0);
        const obraFuelSum = filteredFuelLogs
          .filter((fl) => fl.obraId === o.id)
          .reduce((acc, fl) => acc + (fl.totalValue || 0), 0);
        const totalGastos = (o.spentMaterials || 0) + (o.spentLabor || 0) + (o.otherExpenses || 0) + obraExpensesSum + obraFuelSum;
        const lucroRealizado = o.totalValue - totalGastos;
        const margin = o.totalValue > 0 ? ((lucroRealizado / o.totalValue) * 100).toFixed(1) : '0.0';
        csvContent += `"${o.projectNumber || o.code}","${o.projectName}","${o.clientName}",${o.totalValue},${totalGastos},${lucroRealizado},${margin}%\n`;
      });
    } else if (selectedReportType === 'dre_executivo') {
      csvContent += 'Indicador,Valor (R$),Detalhamento\n';
      csvContent += `"Receita Bruta Total",${totalReceitaBruta},"Faturamento do Mês"\n`;
      csvContent += `"(-) Impostos e Taxas Regulatórias",-${totalImpostosTaxas},"Alíquota ${taxRatePercent}%"\n`;
      csvContent += `"(=) Receita Líquida",${receitaLiquida},"Receita Pós-Impostos"\n`;
      csvContent += `"(-) Contas a Pagar / Despesas Totais",-${totalDespesasPagar},"Despesas Operacionais e Obras"\n`;
      csvContent += `"(=) LUCRO LÍQUIDO OPERACIONAL",${lucroLiquidoOperacional},"${margemPercentual}% de Margem"\n`;
    } else if (selectedReportType === 'custo_frota') {
      csvContent += 'Data,Veiculo,Placa,Obra,Posto,Motorista,Litros,ValorTotal,ConsumoKml\n';
      filteredFuelLogs.forEach((fl) => {
        csvContent += `"${fl.date}","${fl.vehicleModel}","${fl.vehiclePlate}","${fl.obraCode}","${fl.stationName}","${fl.driverName}",${fl.liters},${fl.totalValue},${fl.avgConsumptionKml}\n`;
      });
    } else if (selectedReportType === 'balanco_funcionario') {
      csvContent += 'Nome,CPF,Cargo,SalarioBase,Diaria,DiasTrabalhados,ValesDescontados,SaldoLiquidoPago\n';
      employees.forEach((emp) => {
        const empPayments = filteredPaymentLogs.filter((p) => p.employeeId === emp.id);
        const daysTotal = empPayments.reduce((acc, p) => acc + (p.daysWorked || 0), 0);
        const valesTotal = empPayments.reduce((acc, p) => acc + (p.advancesValue || 0), 0);
        const netPaidTotal = empPayments.reduce((acc, p) => acc + (p.netAmount || 0), 0);
        csvContent += `"${emp.name}","${emp.cpf || 'N/A'}","${emp.role}",${emp.salary},${emp.dailyRate},${daysTotal},${valesTotal},${netPaidTotal}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Relatorio_ProObras_${selectedReportType}_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-base font-semibold text-zinc-100 flex items-center space-x-2 font-mono">
            <FileText className="w-5 h-5 text-blue-500" />
            <span>Central de Relatórios Executivos, DRE & Filtro Mensal</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Análise financeira detalhada por mês, relatórios de faturamento, DRE operacional e balanço de colaboradores.
          </p>
        </div>

        {/* Controls: Month Selector & Buttons */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          {/* Month Selector */}
          <div className="flex items-center space-x-1.5 bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-800">
            <Calendar className="w-4 h-4 text-amber-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-zinc-100 font-mono text-xs font-bold focus:outline-none cursor-pointer"
            >
              {monthsOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-zinc-900 text-zinc-100">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center space-x-1.5 border border-zinc-700 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-blue-400" />
            <span>Imprimir PDF</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Summary for Selected Month */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 font-mono">
        {/* Receita Bruta */}
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Receita Bruta Total</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-lg font-black text-emerald-400">
            R$ {totalReceitaBruta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-zinc-500 block">
            {selectedMonth === 'TODOS' ? 'Acumulado Geral' : `Mês: ${selectedMonth}`}
          </span>
        </div>

        {/* Despesas Totais */}
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Contas a Pagar / Despesas</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-lg font-black text-rose-400">
            R$ {totalDespesasPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-zinc-500 block">Saídas no Período</span>
        </div>

        {/* Custo de Frota / Combustível */}
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Custos de Frota</span>
            <Truck className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-lg font-black text-amber-400">
            R$ {totalCombustivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-zinc-500 block">{filteredFuelLogs.length} Abastecimento(s)</span>
        </div>

        {/* Lucro Líquido */}
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Lucro Líquido Operacional</span>
            <DollarSign className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-lg font-black text-blue-400">
            R$ {lucroLiquidoOperacional.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-emerald-400 font-bold block">Margem: {margemPercentual}%</span>
        </div>
      </div>

      {/* Report Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
        {[
          { id: 'dre_executivo', label: '📊 DRE Executivo Mensal' },
          { id: 'lucro_obra', label: '🏗️ Lucratividade por Obra' },
          { id: 'balanco_funcionario', label: '👷 Balanço por Funcionário' },
          { id: 'custo_frota', label: '⛽ Consumo de Frota & KM' },
        ].map((rep) => (
          <button
            key={rep.id}
            onClick={() => setSelectedReportType(rep.id as any)}
            className={`p-3.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
              selectedReportType === rep.id
                ? 'bg-amber-500 text-zinc-950 border-amber-500 shadow-md font-extrabold'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            {rep.label}
          </button>
        ))}
      </div>

      {/* Report Details View */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm space-y-4 font-sans">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider font-mono">
            {selectedReportType === 'dre_executivo' && 'Demonstração do Resultado do Exercício (DRE Operacional)'}
            {selectedReportType === 'lucro_obra' && 'Relatório de Lucratividade Individual por Obra (Gastos Lançados)'}
            {selectedReportType === 'balanco_funcionario' && 'Balanço de Pagamentos, Diárias & Vales por Funcionário'}
            {selectedReportType === 'custo_frota' && 'Relatório de Eficiência da Frota & Abastecimentos'}
          </h2>
          <span className="text-xs text-amber-400 font-mono font-bold">
            Filtro Ativo: {selectedMonth === 'TODOS' ? 'Período Completo' : selectedMonth}
          </span>
        </div>

        {/* TAB 1: DRE EXECUTIVO */}
        {selectedReportType === 'dre_executivo' && (
          <div className="space-y-3 text-xs font-medium">
            <div className="flex justify-between py-2 border-b border-zinc-800">
              <span className="font-semibold text-zinc-200">1. Receita Bruta Total (Faturamento do Período)</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                R$ {totalReceitaBruta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-zinc-800 pl-4 text-zinc-400 font-mono">
              <span>(-) Impostos e Taxas Regulatórias Estimadas ({taxRatePercent}%)</span>
              <span className="text-rose-400">- R$ {totalImpostosTaxas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between py-2.5 border-b border-zinc-800 font-semibold bg-zinc-950 p-3 rounded-xl border border-zinc-800 font-mono">
              <span className="text-zinc-200">2. (=) Receita Líquida Pós-Tributos</span>
              <span className="text-zinc-100 font-bold">
                R$ {receitaLiquida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-zinc-800 pl-4 text-zinc-400 font-mono">
              <span>(-) Contas a Pagar Total & Despesas de Obras Lançadas</span>
              <span className="text-rose-400">- R$ {totalDespesasPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-zinc-800 pl-6 text-zinc-500 font-mono text-[11px]">
              <span>└ Custos Diretos Lançados de Obras (Materiais, Ferramentas, Hospedagem)</span>
              <span>R$ {totalObraExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-zinc-800 pl-6 text-zinc-500 font-mono text-[11px]">
              <span>└ Custos de Frota & Combustível</span>
              <span>R$ {totalCombustivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between py-2.5 border border-emerald-500/30 font-bold text-emerald-400 text-xs bg-emerald-500/10 p-3.5 rounded-xl font-mono">
              <span className="uppercase">3. (=) LUCRO LÍQUIDO OPERACIONAL DA EMPRESA</span>
              <span className="text-sm">
                R$ {lucroLiquidoOperacional.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({margemPercentual}% de Margem)
              </span>
            </div>
          </div>
        )}

        {/* TAB 2: LUCRATIVIDADE POR OBRA (ATUALIZADO COM GASTOS LANÇADOS) */}
        {selectedReportType === 'lucro_obra' && (
          <div className="overflow-x-auto">
            {filteredObras.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 font-mono text-xs">
                Nenhuma obra cadastrada para o mês selecionado ({selectedMonth}).
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 font-mono text-[10px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Código</th>
                    <th className="py-2.5 px-3">Projeto / Obra</th>
                    <th className="py-2.5 px-3">Cliente</th>
                    <th className="py-2.5 px-3 font-mono text-right">Valor Contrato (R$)</th>
                    <th className="py-2.5 px-3 font-mono text-right text-rose-400">Gastos Lançados (R$)</th>
                    <th className="py-2.5 px-3 font-mono text-right text-emerald-400">Lucro Realizado (R$)</th>
                    <th className="py-2.5 px-3 font-mono text-center">Margem %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-medium font-mono">
                  {filteredObras.map((o) => {
                    const obraExpensesSum = filteredExpenses
                      .filter((exp) => exp.obraId === o.id)
                      .reduce((acc, exp) => acc + (exp.value || 0), 0);

                    const obraFuelSum = filteredFuelLogs
                      .filter((fl) => fl.obraId === o.id)
                      .reduce((acc, fl) => acc + (fl.totalValue || 0), 0);

                    const totalGastos =
                      (o.spentMaterials || 0) +
                      (o.spentLabor || 0) +
                      (o.otherExpenses || 0) +
                      obraExpensesSum +
                      obraFuelSum;

                    const lucroRealizado = o.totalValue - totalGastos;
                    const margin = o.totalValue > 0 ? ((lucroRealizado / o.totalValue) * 100).toFixed(1) : '0.0';

                    return (
                      <tr key={o.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-blue-400">{o.projectNumber || o.code}</td>
                        <td className="py-2.5 px-3 font-semibold text-zinc-100 font-sans">{o.projectName}</td>
                        <td className="py-2.5 px-3 text-zinc-300 font-sans">{o.clientName}</td>
                        <td className="py-2.5 px-3 text-right text-zinc-200">
                          R$ {o.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-rose-400">
                          R$ {totalGastos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                          R$ {lucroRealizado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-amber-400">{margin}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* TAB 3: BALANÇO POR FUNCIONÁRIO (SUBSTITUINDO CLIENTE) */}
        {selectedReportType === 'balanco_funcionario' && (
          <div className="overflow-x-auto">
            {employees.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 font-mono text-xs">
                Nenhum funcionário cadastrado no módulo de Recursos Humanos.
              </div>
            ) : (
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 text-[10px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Colaborador / Funcionário</th>
                    <th className="py-2.5 px-3">Cargo / Função</th>
                    <th className="py-2.5 px-3 text-right">Salário Base (R$)</th>
                    <th className="py-2.5 px-3 text-right">Diária (R$/dia)</th>
                    <th className="py-2.5 px-3 text-center">Dias Trabalhados</th>
                    <th className="py-2.5 px-3 text-right text-rose-400">Vales Descontados (R$)</th>
                    <th className="py-2.5 px-3 text-right text-emerald-400 font-bold">Saldo Líquido Pago (R$)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-medium">
                  {employees.map((emp) => {
                    const empPayments = filteredPaymentLogs.filter((p) => p.employeeId === emp.id);
                    const daysTotal = empPayments.reduce((acc, p) => acc + (p.daysWorked || 0), 0);
                    const valesTotal = empPayments.reduce((acc, p) => acc + (p.advancesValue || 0), 0);
                    const netPaidTotal = empPayments.reduce((acc, p) => acc + (p.netAmount || 0), 0);

                    return (
                      <tr key={emp.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-zinc-100 font-sans">
                          <div className="flex items-center space-x-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                            <span>{emp.name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-zinc-300 font-sans">
                          <span className="px-2 py-0.5 rounded bg-zinc-800 text-amber-400 font-bold text-[10px]">
                            {emp.role}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right text-zinc-300">
                          R$ {emp.salary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-right text-zinc-300">
                          R$ {emp.dailyRate.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-blue-400">{daysTotal} dias</td>
                        <td className="py-2.5 px-3 text-right font-bold text-rose-400">
                          {valesTotal > 0 ? `- R$ ${valesTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-emerald-400 text-sm">
                          R$ {netPaidTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* TAB 4: CONSUMO DE FROTA & KM */}
        {selectedReportType === 'custo_frota' && (
          <div className="overflow-x-auto">
            {filteredFuelLogs.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 font-mono text-xs">
                Nenhum abastecimento registrado no mês selecionado ({selectedMonth}).
              </div>
            ) : (
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 text-[10px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Data</th>
                    <th className="py-2.5 px-3">Veículo / Placa</th>
                    <th className="py-2.5 px-3">Obra</th>
                    <th className="py-2.5 px-3">Posto</th>
                    <th className="py-2.5 px-3">Motorista</th>
                    <th className="py-2.5 px-3 text-center">Litros</th>
                    <th className="py-2.5 px-3 text-right">Valor Total (R$)</th>
                    <th className="py-2.5 px-3 text-center">Consumo (KM/L)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-medium">
                  {filteredFuelLogs.map((fl) => (
                    <tr key={fl.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-2.5 px-3 text-zinc-400">{fl.date}</td>
                      <td className="py-2.5 px-3 font-bold text-zinc-100">{fl.vehicleModel} ({fl.vehiclePlate})</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold text-[10px]">
                          {fl.obraCode}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-blue-400 font-sans">{fl.stationName || 'Posto Shell'}</td>
                      <td className="py-2.5 px-3 text-zinc-300 font-sans">{fl.driverName}</td>
                      <td className="py-2.5 px-3 text-center text-amber-400 font-bold">{fl.liters} L</td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                        R$ {fl.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-center text-zinc-200">{fl.avgConsumptionKml} KM/L</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
