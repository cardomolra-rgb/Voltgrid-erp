import React, { useState } from 'react';
import { Tabs } from './ui/Tabs';
import { ConfirmDialog } from './ui/Modal';
import {
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Building2,
  X,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  ExternalLink,
  Eye,
} from 'lucide-react';
import { FinancialAccount, Obra, ObraExpense } from '../types';

interface FinancialModuleProps {
  financials: FinancialAccount[];
  obras: Obra[];
  expenses?: ObraExpense[];
  onAddAccount: (acc: FinancialAccount) => void;
  onUpdateAccount?: (acc: FinancialAccount) => void;
  onDeleteAccount?: (accId: string) => void;
  onUpdateExpense?: (exp: ObraExpense) => void;
  onDeleteExpense?: (expId: string) => void;
  onUpdateStatus: (accId: string, status: 'Pago' | 'Pendente') => void;
}

export const FinancialModule: React.FC<FinancialModuleProps> = ({
  financials,
  obras,
  expenses = [],
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount,
  onUpdateExpense,
  onDeleteExpense,
  onUpdateStatus,
}) => {
  const [filterType, setFilterType] = useState<'TODOS' | 'Pagar' | 'Receber'>('TODOS');
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<FinancialAccount | null>(null);

  // Modal for "Dar Baixa (Com ou Sem Comprovante)"
  const [baixaTarget, setBaixaTarget] = useState<FinancialAccount | null>(null);
  const [baixaFileName, setBaixaFileName] = useState('');
  const [baixaFileSize, setBaixaFileSize] = useState('');
  const [baixaRealUrl, setBaixaRealUrl] = useState<string>('');
  const [pendingBaixaSemComprovante, setPendingBaixaSemComprovante] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState<FinancialAccount | null>(null);

  // Modal for Viewing Real Attached Comprovante in-app or new tab
  const [previewReceipt, setPreviewReceipt] = useState<{
    fileName: string;
    url?: string;
    title: string;
    obraCode?: string;
    value: number;
    supplierClient: string;
    date: string;
  } | null>(null);

  // Form State for New / Edit Financial Title
  const [type, setType] = useState<'Pagar' | 'Receber'>('Pagar');
  const [description, setDescription] = useState('');
  const [value, setValue] = useState(15000);
  const [category, setCategory] = useState<FinancialAccount['category']>('Material');
  const [selectedObraId, setSelectedObraId] = useState('');
  const [supplierClient, setSupplierClient] = useState('');
  const [dueDate, setDueDate] = useState('2026-08-20');
  const [status, setStatus] = useState<'Pendente' | 'Pago'>('Pendente');

  // Recurrence & Installment Form State
  const [recurrenceType, setRecurrenceType] = useState<'Unica' | 'Recorrente' | 'Parcelada'>('Unica');
  const [installmentCount, setInstallmentCount] = useState<number>(6);
  const [divideTotalValue, setDivideTotalValue] = useState<boolean>(true);

  // Helper for shifted monthly due dates
  const addMonthsToDate = (dateStr: string, monthsToAdd: number): string => {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const day = parseInt(parts[2]);
    const d = new Date(year, month, day);
    d.setMonth(d.getMonth() + monthsToAdd);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  };

  // Convert ObraExpenses to Virtual FinancialAccount representations for unified financial table
  const expenseAccounts: FinancialAccount[] = expenses.map((exp) => {
    const linkedObra = obras.find((o) => o.id === exp.obraId);
    const expStatus = exp.status || 'Pendente';
    return {
      id: `EXP-ACC-${exp.id}`,
      type: 'Pagar',
      description: `${exp.category}: ${exp.description}`,
      category: 'Material',
      totalValue: exp.value,
      paidValue: expStatus === 'Pago' ? exp.value : 0,
      dueDate: exp.date || new Date().toISOString().split('T')[0],
      status: expStatus,
      supplierClient: exp.responsible || 'Lançamento Direto de Obra',
      costCenter: 'CC-OBRA-CAMPO',
      paymentMethod: 'PIX',
      obraId: exp.obraId,
      obraCode: linkedObra?.code || 'Obra',
      isObraExpense: true,
      originalExpenseId: exp.id,
      receiptUrl: exp.receiptUrl,
      receiptFileName: exp.receiptFileName,
    };
  });

  // Ensure every Obra has a receivable entry representation initialized to 'Pendente' until payment is received
  const obraReceivableAccounts: FinancialAccount[] = obras
    .filter((o) => !financials.some((f) => f.obraId === o.id && f.type === 'Receber'))
    .map((o) => ({
      id: `OBRA-REC-${o.id}`,
      type: 'Receber' as const,
      description: `Faturamento Obra: ${o.projectName}`,
      category: 'Faturamento Obra' as const,
      totalValue: o.totalValue,
      paidValue: 0,
      dueDate: o.expectedEndDate || o.startDate || new Date().toISOString().split('T')[0],
      status: 'Pendente' as const,
      supplierClient: o.clientName || 'Cliente Obra',
      costCenter: 'CC-FATURAMENTO-OBRAS',
      paymentMethod: 'PIX' as const,
      obraId: o.id,
      obraCode: o.code,
    }));

  const allFinancialsCombined = [...financials, ...expenseAccounts, ...obraReceivableAccounts];

  // 1. Calculate Contas a Receber (Pendente)
  const totalReceberPendente = allFinancialsCombined
    .filter((f) => f.type === 'Receber' && f.status === 'Pendente')
    .reduce((acc, f) => acc + f.totalValue, 0);

  // 2. Calculate Contas a Pagar (Despesas de Obras + Fornecedores Pendentes)
  const totalPagarTotal = allFinancialsCombined
    .filter((f) => f.type === 'Pagar' && f.status === 'Pendente')
    .reduce((acc, f) => acc + f.totalValue, 0);

  // 3. Calculate Faturamento Efetivado / Baixado
  const totalRealizado = allFinancialsCombined
    .filter((f) => f.type === 'Receber' && f.status === 'Pago')
    .reduce((acc, f) => acc + f.totalValue, 0);

  const filteredFinancials = allFinancialsCombined.filter(
    (f) => filterType === 'TODOS' || f.type === filterType
  );

  const handleOpenAddModal = () => {
    setEditingAccount(null);
    setType('Pagar');
    setDescription('');
    setValue(5000);
    setCategory('Material');
    setSelectedObraId('');
    setSupplierClient('');
    setDueDate(new Date().toISOString().split('T')[0]);
    setStatus('Pendente');
    setRecurrenceType('Unica');
    setInstallmentCount(6);
    setDivideTotalValue(true);
    setShowModal(true);
  };

  const handleOpenEditModal = (acc: FinancialAccount) => {
    setEditingAccount(acc);
    setType(acc.type);
    setDescription(acc.description);
    setValue(acc.totalValue);
    setCategory(acc.category);
    setSelectedObraId(acc.obraId || '');
    setSupplierClient(acc.supplierClient);
    setDueDate(acc.dueDate);
    setStatus(acc.status === 'Pago' ? 'Pago' : 'Pendente');
    setRecurrenceType(acc.recurrenceType || 'Unica');
    setInstallmentCount(acc.installmentCount || 6);
    setDivideTotalValue(true);
    setShowModal(true);
  };

  const handleInitiateBaixa = (acc: FinancialAccount) => {
    if (acc.status === 'Pago') {
      // If already paid, allow toggling back to Pendente
      if (acc.isObraExpense && acc.originalExpenseId && onUpdateExpense) {
        const original = expenses.find((e) => e.id === acc.originalExpenseId);
        if (original) onUpdateExpense({ ...original, status: 'Pendente' });
      } else if (acc.id.startsWith('OBRA-REC-')) {
        // Auto generated
      } else {
        onUpdateStatus(acc.id, 'Pendente');
      }
      return;
    }

    // Open Baixa Modal
    setBaixaTarget(acc);
    setBaixaFileName(acc.receiptFileName || '');
    setBaixaFileSize('');
    setBaixaRealUrl(acc.receiptUrl || '');
  };

  const handleFileSelectForBaixa = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBaixaFileName(file.name);
      setBaixaFileSize(`${(file.size / 1024).toFixed(1)} KB`);
      // Capture actual object URL of real file selected by user
      const objectUrl = URL.createObjectURL(file);
      setBaixaRealUrl(objectUrl);
    }
  };

  // Execute Baixa (with or without attached file)
  const handleExecuteBaixa = (withFile: boolean) => {
    if (!baixaTarget) return;

    if (!withFile) {
      setPendingBaixaSemComprovante(true);
      return;
    }

    executeBaixaNow(withFile);
  };

  const executeBaixaNow = (withFile: boolean) => {
    if (!baixaTarget) return;

    const finalFileName = withFile ? baixaFileName : undefined;
    const finalUrl = withFile ? baixaRealUrl : undefined;

    if (baixaTarget.isObraExpense && baixaTarget.originalExpenseId && onUpdateExpense) {
      // Update original ObraExpense in state
      const original = expenses.find((e) => e.id === baixaTarget.originalExpenseId);
      if (original) {
        onUpdateExpense({
          ...original,
          status: 'Pago',
          receiptFileName: finalFileName,
          receiptUrl: finalUrl,
        });
      }
    } else if (baixaTarget.id.startsWith('OBRA-REC-')) {
      // Auto-generated obra receivable
      const persistentAcc: FinancialAccount = {
        ...baixaTarget,
        id: `FIN-OBRA-${baixaTarget.obraId}-${Date.now()}`,
        status: 'Pago',
        paidValue: baixaTarget.totalValue,
        receiptFileName: finalFileName,
        receiptUrl: finalUrl,
      };
      onAddAccount(persistentAcc);
    } else {
      // Standard FinancialAccount title
      if (onUpdateAccount) {
        onUpdateAccount({
          ...baixaTarget,
          status: 'Pago',
          paidValue: baixaTarget.totalValue,
          receiptFileName: finalFileName,
          receiptUrl: finalUrl,
        });
      } else {
        onUpdateStatus(baixaTarget.id, 'Pago');
      }
    }

    setBaixaTarget(null);
    setBaixaFileName('');
    setBaixaRealUrl('');
  };

  // Open Attached Real Comprovante Viewer
  const handleOpenReceiptViewer = (acc: FinancialAccount) => {
    setPreviewReceipt({
      fileName: acc.receiptFileName || 'Comprovante_Pagamento.pdf',
      url: acc.receiptUrl,
      title: acc.description,
      obraCode: acc.obraCode || 'Geral',
      value: acc.totalValue,
      supplierClient: acc.supplierClient,
      date: acc.dueDate,
    });
  };

  // Open Real Comprovante Document in New Browser Tab
  const handleOpenReceiptInNewTab = () => {
    if (!previewReceipt) return;

    if (
      previewReceipt.url &&
      (previewReceipt.url.startsWith('blob:') ||
        previewReceipt.url.startsWith('data:') ||
        previewReceipt.url.startsWith('http'))
    ) {
      window.open(previewReceipt.url, '_blank');
    } else {
      // Fallback Document canvas for mock/preset items
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Comprovante Anexado - ${previewReceipt.fileName}</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #09090b; color: #f4f4f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
              .card { background: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 32px; max-width: 550px; width: 100%; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
              .badge { background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; display: inline-block; margin-bottom: 16px; }
              h2 { margin: 0 0 8px 0; font-size: 18px; color: #fff; }
              .mono { font-family: monospace; }
              .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #27272a; font-size: 13px; }
              .label { color: #a1a1aa; }
              .val { font-weight: bold; color: #f4f4f5; }
              .amount { font-size: 26px; font-weight: 900; color: #10b981; margin: 18px 0; text-align: center; font-family: monospace; }
              .stamp { text-align: center; border: 2px dashed #10b981; color: #10b981; padding: 10px; border-radius: 8px; font-weight: bold; margin-top: 24px; font-size: 12px; text-transform: uppercase; }
            </style>
          </head>
          <body>
            <div class="card">
              <span class="badge">✓ COMPROVANTE REAL ANEXADO NO SISTEMA</span>
              <h2>ProObras ERP — Visualização de Documento</h2>
              <p style="font-size: 12px; color: #a1a1aa; margin-top: 0;">Arquivo Anexado: <span class="mono">${previewReceipt.fileName}</span></p>

              <div class="amount">R$ ${previewReceipt.value.toLocaleString('pt-BR')}</div>

              <div class="row"><span class="label">Título / Descrição:</span><span class="val">${previewReceipt.title}</span></div>
              <div class="row"><span class="label">Favorecido / Origem:</span><span class="val">${previewReceipt.supplierClient}</span></div>
              <div class="row"><span class="label">Obra Vinculada:</span><span class="val font-mono">${previewReceipt.obraCode}</span></div>
              <div class="row"><span class="label">Data de Vencimento / Liquidação:</span><span class="val font-mono">${previewReceipt.date}</span></div>
              <div class="row"><span class="label">Status:</span><span class="val" style="color: #10b981;">Pago / Efetivado</span></div>

              <div class="stamp">Documento Autenticado no ERP — ProObras Engenharia</div>
            </div>
          </body>
        </html>
      `;
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    }
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedObra = obras.find((o) => o.id === selectedObraId);
    const obraCode = selectedObra ? selectedObra.code : undefined;

    if (editingAccount && onUpdateAccount && !editingAccount.isObraExpense) {
      const updated: FinancialAccount = {
        ...editingAccount,
        type,
        description,
        category,
        totalValue: value,
        dueDate,
        status,
        supplierClient: supplierClient || (selectedObra ? selectedObra.clientName : 'Fornecedor Homologado'),
        obraId: selectedObraId || undefined,
        obraCode,
        recurrenceType,
        installmentCount,
        installmentsInfo:
          recurrenceType === 'Parcelada'
            ? `Parcelado (${installmentCount}x)`
            : recurrenceType === 'Recorrente'
            ? `Recorrente (${installmentCount}m)`
            : 'À Vista',
      };
      onUpdateAccount(updated);
    } else {
      if (recurrenceType === 'Parcelada') {
        const n = Math.max(2, installmentCount);
        const valPerInstallment = divideTotalValue ? value / n : value;

        for (let i = 1; i <= n; i++) {
          const calcDate = addMonthsToDate(dueDate, i - 1);
          const newAcc: FinancialAccount = {
            id: `FIN-${Date.now()}-${i}`,
            type,
            description: `${description} (Parcela ${i}/${n})`,
            category,
            totalValue: Math.round(valPerInstallment * 100) / 100,
            paidValue: status === 'Pago' && i === 1 ? Math.round(valPerInstallment * 100) / 100 : 0,
            dueDate: calcDate,
            status: i === 1 ? status : 'Pendente',
            supplierClient: supplierClient || (selectedObra ? selectedObra.clientName : 'Fornecedor Homologado'),
            costCenter: 'CC-OBRAS-GERAL',
            paymentMethod: 'Boleto',
            installmentsInfo: `${i}/${n}`,
            recurrenceType: 'Parcelada',
            installmentCount: n,
            installmentIndex: i,
            obraId: selectedObraId || undefined,
            obraCode,
          };
          onAddAccount(newAcc);
        }
      } else if (recurrenceType === 'Recorrente') {
        const n = Math.max(2, installmentCount);

        for (let i = 1; i <= n; i++) {
          const calcDate = addMonthsToDate(dueDate, i - 1);
          const newAcc: FinancialAccount = {
            id: `FIN-${Date.now()}-${i}`,
            type,
            description: `${description} (Recorrente ${i}/${n})`,
            category,
            totalValue: value,
            paidValue: status === 'Pago' && i === 1 ? value : 0,
            dueDate: calcDate,
            status: i === 1 ? status : 'Pendente',
            supplierClient: supplierClient || (selectedObra ? selectedObra.clientName : 'Fornecedor Homologado'),
            costCenter: 'CC-OBRAS-GERAL',
            paymentMethod: 'PIX',
            installmentsInfo: `Recorrente ${i}/${n}`,
            recurrenceType: 'Recorrente',
            installmentCount: n,
            installmentIndex: i,
            obraId: selectedObraId || undefined,
            obraCode,
          };
          onAddAccount(newAcc);
        }
      } else {
        const newAcc: FinancialAccount = {
          id: `FIN-${Date.now()}`,
          type,
          description,
          category,
          totalValue: value,
          paidValue: status === 'Pago' ? value : 0,
          dueDate,
          status,
          supplierClient: supplierClient || (selectedObra ? selectedObra.clientName : 'Fornecedor Homologado'),
          costCenter: 'CC-OBRAS-GERAL',
          paymentMethod: 'PIX',
          installmentsInfo: 'À Vista',
          recurrenceType: 'Unica',
          installmentCount: 1,
          installmentIndex: 1,
          obraId: selectedObraId || undefined,
          obraCode,
        };
        onAddAccount(newAcc);
      }
    }

    setShowModal(false);
  };

  const handleDelete = (acc: FinancialAccount) => {
    setDeletingAccount(acc);
  };

  const confirmDeleteAccount = () => {
    const acc = deletingAccount;
    if (acc) {
      if (acc.isObraExpense && acc.originalExpenseId && onDeleteExpense) {
        onDeleteExpense(acc.originalExpenseId);
      } else if (onDeleteAccount) {
        onDeleteAccount(acc.id);
      }
    }
    setDeletingAccount(null);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-base font-semibold text-zinc-100 flex items-center space-x-2 font-mono">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span>Módulo Financeiro, Fluxo de Caixa & DRE de Obras</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Contas a pagar, faturamento de medições e leitor de documento real anexado em comprovantes.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center space-x-2 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Lançar Novo Título</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Contas a Receber (Cadastra o valor de cada obra adicionada como Pendente) */}
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider font-mono">
              Contas a Receber (Pendente)
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
              Aguardando Baixa
            </span>
          </div>
          <p className="text-xl font-bold font-mono text-amber-400">
            R$ {totalReceberPendente.toLocaleString('pt-BR')}
          </p>
          <p className="text-[10px] text-zinc-400 font-mono pt-1">
            {obras.length} obra(s) em status Pendente de Recebimento
          </p>
        </div>

        {/* Contas a Pagar (Todas as despesas de obras entram como Pendentes) */}
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider font-mono">
              Contas a Pagar (Despesas & Fornecedores)
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono">
              Pendentes
            </span>
          </div>
          <p className="text-xl font-bold font-mono text-rose-400">
            R$ {totalPagarTotal.toLocaleString('pt-BR')}
          </p>
          <p className="text-[10px] text-zinc-400 font-mono pt-1">
            {expenses.filter((e) => e.status !== 'Pago').length} despesa(s) de obra(s) pendente(s)
          </p>
        </div>

        {/* Faturamento Recebido / Efetivado */}
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider font-mono">
              Faturamento Efetivado / Baixado
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              Efetivado
            </span>
          </div>
          <p className="text-xl font-bold font-mono text-emerald-400">
            R$ {totalRealizado.toLocaleString('pt-BR')}
          </p>
          <p className="text-[10px] text-zinc-400 font-mono pt-1">
            Títulos com pagamento confirmado
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <Tabs
        items={[
          { id: 'TODOS', label: 'Todos os Títulos' },
          { id: 'Receber', label: 'Contas a Receber' },
          { id: 'Pagar', label: 'Contas a Pagar' },
        ]}
        activeId={filterType}
        onChange={(id) => setFilterType(id as 'TODOS' | 'Pagar' | 'Receber')}
      />

      {/* Financial Table */}
      <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm overflow-x-auto">
        {filteredFinancials.length === 0 ? (
          <div className="p-8 text-center text-zinc-400 text-xs space-y-2 font-sans">
            <DollarSign className="w-8 h-8 text-zinc-600 mx-auto" />
            <p>Nenhum título financeiro cadastrado nesta visualização.</p>
            <button
              onClick={handleOpenAddModal}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs inline-flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Lançar Primeiro Título</span>
            </button>
          </div>
        ) : (
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider font-mono text-[11px]">
                <th className="py-3 px-3">Tipo</th>
                <th className="py-3 px-3">Descrição / Origem</th>
                <th className="py-3 px-3">Obra Vinculada</th>
                <th className="py-3 px-3">Vencimento</th>
                <th className="py-3 px-3">Valor Total</th>
                <th className="py-3 px-3">Comprovante Anetado</th>
                <th className="py-3 px-3">Status do Pagamento</th>
                <th className="py-3 px-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-medium">
              {filteredFinancials.map((acc) => {
                const linkedObra = obras.find((o) => o.id === acc.obraId || o.code === acc.obraCode);
                const hasReceipt = Boolean(acc.receiptFileName);

                return (
                  <tr key={acc.id} className="hover:bg-zinc-950/60 transition-colors">
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded font-black text-[10px] font-mono ${
                          acc.type === 'Receber'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {acc.type}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-bold text-zinc-100 flex items-center space-x-1.5 flex-wrap gap-y-1">
                        {acc.isObraExpense && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-mono font-bold">
                            Despesa Obra
                          </span>
                        )}
                        {acc.installmentsInfo && (
                          <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[9px] font-mono font-bold">
                            {acc.installmentsInfo}
                          </span>
                        )}
                        <span>{acc.description}</span>
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono">{acc.supplierClient}</div>
                    </td>

                    {/* Obra Vinculada */}
                    <td className="py-3 px-3 font-mono">
                      {linkedObra ? (
                        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold text-[10px] inline-flex items-center space-x-1">
                          <Building2 className="w-3 h-3" />
                          <span>{linkedObra.projectNumber || linkedObra.code} - {linkedObra.projectName}</span>
                        </span>
                      ) : (
                        <span className="text-zinc-500 text-[11px] font-sans">
                          {acc.obraCode || 'Despesa Geral'}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-zinc-300 font-mono">{acc.dueDate}</td>

                    <td className="py-3 px-3 font-bold font-mono text-zinc-100">
                      R$ {acc.totalValue.toLocaleString('pt-BR')}
                    </td>

                    {/* Visualizar Comprovante Real Anexado */}
                    <td className="py-3 px-3 font-mono">
                      {hasReceipt ? (
                        <button
                          type="button"
                          onClick={() => handleOpenReceiptViewer(acc)}
                          className="px-2.5 py-1 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold text-[10px] inline-flex items-center space-x-1.5 cursor-pointer transition-all"
                          title="Clique para abrir e visualizar o documento real anexado"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[110px]">{acc.receiptFileName}</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-zinc-500 flex items-center space-x-1">
                          <AlertCircle className="w-3 h-3 text-amber-500/80" />
                          <span>Sem Anexo</span>
                        </span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3 font-mono">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center space-x-1 ${
                          acc.status === 'Pago'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {acc.status === 'Pago' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>✓ Pago / Efetivado</span>
                          </>
                        ) : (
                          <span>⌛ Pendente</span>
                        )}
                      </span>
                    </td>

                    {/* Actions Column */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {/* Dar Baixa Button */}
                        <button
                          type="button"
                          onClick={() => handleInitiateBaixa(acc)}
                          className={`px-2.5 py-1 rounded font-bold text-[10px] shadow-sm transition-all inline-flex items-center space-x-1 cursor-pointer ${
                            acc.status === 'Pago'
                              ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          }`}
                          title={
                            acc.status === 'Pago'
                              ? 'Reverter status para Pendente'
                              : 'Dar Baixa (Com ou Sem Comprovante)'
                          }
                        >
                          {acc.status === 'Pago' ? (
                            <span>Reverter</span>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Dar Baixa</span>
                            </>
                          )}
                        </button>

                        {/* Edit Button */}
                        {!acc.isObraExpense && (
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(acc)}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-blue-600 text-zinc-400 hover:text-white transition-colors"
                            title="Editar Título Financeiro"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDelete(acc)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-600 text-zinc-400 hover:text-white transition-colors"
                          title="Excluir Lançamento Financeiro"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal 1: Dar Baixa (Com opção de anexar arquivo real ou dar baixa sem comprovante) */}
      {baixaTarget && (
        <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider font-mono flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Efetivar Baixa no Financeiro</span>
              </h2>
              <button
                type="button"
                onClick={() => setBaixaTarget(null)}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Item Details Box */}
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-1.5 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 text-[10px]">Título:</span>
                <span className="font-bold text-zinc-100">{baixaTarget.description}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 text-[10px]">Obra / Cliente:</span>
                <span className="font-bold text-blue-400">{baixaTarget.obraCode || baixaTarget.supplierClient}</span>
              </div>
              <div className="flex items-center justify-between border-t border-zinc-800 pt-1 text-sm font-black">
                <span className="text-zinc-400 text-xs font-normal">Valor a Liquidar:</span>
                <span className="text-emerald-400">R$ {baixaTarget.totalValue.toLocaleString('pt-BR')}</span>
              </div>
            </div>

            {/* Comprovante Real File Attachment Section */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-zinc-300 block mb-1.5 font-mono">
                  Anexar Documento Real (PDF, PNG, JPG)
                </label>

                <div className="relative border-2 border-dashed border-zinc-700 hover:border-blue-500 rounded-xl p-3.5 text-center transition-all bg-zinc-950">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileSelectForBaixa}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="space-y-1">
                    <Paperclip className="w-5 h-5 text-amber-400 mx-auto" />
                    <p className="font-bold text-zinc-200 text-xs">
                      {baixaFileName ? baixaFileName : 'Clique para selecionar o arquivo real (opcional)'}
                    </p>
                    {baixaFileSize && (
                      <p className="text-[10px] text-emerald-400 font-mono font-bold">Tamanho: {baixaFileSize}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-zinc-800 space-y-2">
                {baixaFileName ? (
                  <button
                    type="button"
                    onClick={() => handleExecuteBaixa(true)}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirmar Baixa COM Comprovante Anetado</span>
                  </button>
                ) : (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => handleExecuteBaixa(false)}
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Dar Baixa SEM Comprovante (Confirmar)</span>
                    </button>
                    <p className="text-[10px] text-zinc-400 text-center font-sans">
                      Você pode dar baixa manualmente agora sem anexar comprovante e anexar depois.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Visualizador de Documento Real Anexado */}
      {previewReceipt && (
        <div className="fixed inset-0 z-50 bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider font-mono flex items-center space-x-2">
                <Eye className="w-4 h-4 text-blue-400" />
                <span>Visualizador de Documento Real — {previewReceipt.fileName}</span>
              </h2>
              <button
                type="button"
                onClick={() => setPreviewReceipt(null)}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Document Header Metadata */}
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-zinc-400 text-[10px] block">Lançamento:</span>
                <span className="font-bold text-zinc-100">{previewReceipt.title} ({previewReceipt.supplierClient})</span>
              </div>
              <div className="text-right">
                <span className="text-zinc-400 text-[10px] block">Valor Liquidado:</span>
                <span className="font-extrabold text-emerald-400">R$ {previewReceipt.value.toLocaleString('pt-BR')}</span>
              </div>
            </div>

            {/* Real File Container rendering Image, PDF iframe or Document Canvas */}
            {previewReceipt.url &&
            (previewReceipt.url.startsWith('blob:') ||
              previewReceipt.url.startsWith('data:') ||
              previewReceipt.url.startsWith('http')) ? (
              previewReceipt.fileName.toLowerCase().match(/\.(jpg|jpeg|png|webp|gif)$/) ? (
                <div className="p-2 bg-zinc-950 rounded-xl border border-zinc-800 text-center max-h-[450px] overflow-auto">
                  <img
                    src={previewReceipt.url}
                    alt={previewReceipt.fileName}
                    className="max-h-[420px] mx-auto rounded-lg object-contain shadow-md"
                  />
                </div>
              ) : (
                <div className="bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden h-[420px]">
                  <iframe
                    src={previewReceipt.url}
                    className="w-full h-full border-none"
                    title={previewReceipt.fileName}
                  />
                </div>
              )
            ) : (
              /* High fidelity document preview canvas */
              <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4 text-xs font-sans">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] font-mono border border-emerald-500/30">
                    ✓ DOCUMENTO REAL ANEXADO NO ERP
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">{previewReceipt.fileName}</span>
                </div>

                <div className="text-center py-2">
                  <span className="text-[10px] text-zinc-400 font-mono block">VALOR REGISTRADO NO SISTEMA</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono">
                    R$ {previewReceipt.value.toLocaleString('pt-BR')}
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono bg-zinc-900 p-3 rounded-xl border border-zinc-800">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Título / Descrição:</span>
                    <span className="font-bold text-zinc-100">{previewReceipt.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Favorecido / Origem:</span>
                    <span className="font-bold text-zinc-100">{previewReceipt.supplierClient}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Obra Vinculada:</span>
                    <span className="font-bold text-blue-400">{previewReceipt.obraCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Data de Vencimento:</span>
                    <span className="font-bold text-zinc-100">{previewReceipt.date}</span>
                  </div>
                </div>

                <div className="text-center text-[10px] font-mono text-zinc-400 border border-emerald-500/20 bg-emerald-500/5 p-2 rounded-lg">
                  AUTENTICAÇÃO DIGITAL ERP VOLTGRID — DOCUMENTO REGISTRADO
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleOpenReceiptInNewTab}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-md"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Abrir Documento Real em Nova Aba</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewReceipt(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition-colors"
              >
                Fechar Visualizador
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Financial Title Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider font-mono">
                {editingAccount ? 'Editar Título Financeiro' : 'Lançar Novo Título Financeiro'}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-zinc-300 block mb-1">Tipo de Título</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500 font-sans"
                >
                  <option value="Pagar">Conta a Pagar (Despesa / Fornecedor)</option>
                  <option value="Receber">Conta a Receber (Receita / Medição)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-zinc-300 block mb-1">Vincular à Obra Cadastrada</label>
                <select
                  value={selectedObraId}
                  onChange={(e) => setSelectedObraId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500 font-sans"
                >
                  <option value="">Nenhuma / Despesa Institucional Geral</option>
                  {obras.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.projectNumber || o.code} - {o.projectName} ({o.clientName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-zinc-300 block mb-1">Descrição do Título</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pagamento DAS Simples Nacional, Nota de Materiais ou Medição #2..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>

              <div>
                <label className="font-semibold text-amber-400 block mb-1 font-mono uppercase text-[11px]">
                  Categoria Financeira
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 font-semibold focus:outline-none focus:border-blue-500 font-sans"
                >
                  <option value="Impostos">🏛️ Impostos / Tributos (DAS / ISS / PIS / COFINS)</option>
                  <option value="Material">📦 Material de Obra / Insumos</option>
                  <option value="Mão de Obra">👷 Mão de Obra / Salários</option>
                  <option value="Frota/Combustível">⛽ Frota / Combustível</option>
                  <option value="Diárias/Hospedagem">🏨 Diárias / Hospedagem / Alimentação</option>
                  <option value="Equipamentos/Linha Viva">⚡ Equipamentos / Linha Viva</option>
                  <option value="Projetos/ART">📐 Projetos / ART / Licenciamento</option>
                  <option value="Faturamento Obra">💰 Faturamento Obra (Receita)</option>
                </select>
              </div>


              <div>
                <label className="font-semibold text-zinc-300 block mb-1">Fornecedor / Cliente / Favorecido</label>
                <input
                  type="text"
                  placeholder="Nome do fornecedor ou cliente..."
                  value={supplierClient}
                  onChange={(e) => setSupplierClient(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Valor Total (R$)</label>
                  <input
                    type="number"
                    required
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Data 1º Vencimento</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* Recorrência e Quantidade de Parcelas */}
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div>
                  <label className="font-semibold text-amber-400 block mb-1 font-mono uppercase text-[11px]">
                    Recorrência / Condição de Pagamento
                  </label>
                  <select
                    value={recurrenceType}
                    onChange={(e) => setRecurrenceType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 font-semibold focus:outline-none focus:border-blue-500 font-sans"
                  >
                    <option value="Unica">À Vista / Lançamento Único (1x)</option>
                    <option value="Parcelada">Parcelado em N vezes (Ex: 2x, 3x, 6x, 10x, 12x)</option>
                    <option value="Recorrente">Recorrente Mensal Fixa (Ex: Aluguel, Sistema, Internet)</option>
                  </select>
                </div>

                {recurrenceType === 'Parcelada' && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="font-semibold text-zinc-300 block mb-1">Qtd. de Parcelas</label>
                      <input
                        type="number"
                        min={2}
                        max={60}
                        value={installmentCount}
                        onChange={(e) => setInstallmentCount(Math.max(2, Math.min(60, parseInt(e.target.value) || 2)))}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 font-mono"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-zinc-300 block mb-1">Cálculo das Parcelas</label>
                      <select
                        value={divideTotalValue ? 'dividir' : 'integral'}
                        onChange={(e) => setDivideTotalValue(e.target.value === 'dividir')}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 font-sans"
                      >
                        <option value="dividir">Dividir Total (R$ {Math.round(value / Math.max(1, installmentCount)).toLocaleString('pt-BR')}/parc)</option>
                        <option value="integral">Valor Integral em cada parcela</option>
                      </select>
                    </div>
                  </div>
                )}

                {recurrenceType === 'Recorrente' && (
                  <div className="pt-1">
                    <label className="font-semibold text-zinc-300 block mb-1">Quantidade de Meses a Gerar</label>
                    <input
                      type="number"
                      min={2}
                      max={60}
                      value={installmentCount}
                      onChange={(e) => setInstallmentCount(Math.max(2, Math.min(60, parseInt(e.target.value) || 2)))}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 font-mono"
                    />
                    <span className="text-[10px] text-zinc-400 block mt-1">
                      Serão gerados {installmentCount} lançamentos mensais idênticos de R$ {value.toLocaleString('pt-BR')} cada.
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="font-semibold text-zinc-300 block mb-1">Status Inicial</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500 font-sans"
                >
                  <option value="Pendente">Pendente de Pagamento</option>
                  <option value="Pago">Pago / Baixado</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 font-medium text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm transition-colors"
                >
                  {editingAccount ? 'Salvar Alterações' : 'Salvar Título'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={pendingBaixaSemComprovante}
        title="Confirmar baixa sem comprovante"
        message={`Deseja efetivar a baixa do título "${baixaTarget?.description ?? ''}" SEM anexar um comprovante?`}
        confirmLabel="Confirmar Baixa"
        onConfirm={() => {
          setPendingBaixaSemComprovante(false);
          executeBaixaNow(false);
        }}
        onCancel={() => setPendingBaixaSemComprovante(false)}
      />

      <ConfirmDialog
        open={deletingAccount !== null}
        title="Excluir lançamento financeiro"
        message="Tem certeza de que deseja excluir este lançamento financeiro? Esta ação não poderá ser desfeita."
        tone="danger"
        confirmLabel="Excluir"
        onConfirm={confirmDeleteAccount}
        onCancel={() => setDeletingAccount(null)}
      />
    </div>
  );
};
