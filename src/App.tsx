import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ObrasModule } from './components/ObrasModule';
import { CRMModule } from './components/CRMModule';
import { FinancialModule } from './components/FinancialModule';
import { FleetModule } from './components/FleetModule';
import { HRModule } from './components/HRModule';
import { ReportsModule } from './components/ReportsModule';
import { CadastrosModule } from './components/CadastrosModule';
import { DocumentosGeradorModule } from './components/DocumentosGeradorModule';
import { AuthScreen } from './components/AuthScreen';
import { PublicProposalApproval } from './components/PublicProposalApproval';


import {
  INITIAL_OBRAS,
  INITIAL_CLIENTS,
  INITIAL_INVENTORY,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_FINANCIAL_ACCOUNTS,
  INITIAL_VEHICLES,
  INITIAL_FUEL_LOGS,
  INITIAL_EMPLOYEES,
  INITIAL_PROTOCOL_CHECKLISTS,
  INITIAL_DOCUMENTS,
  INITIAL_EXPENSES,
  INITIAL_RDOS,
  INITIAL_GANTT_TASKS,
  INITIAL_COMPANY_CONFIG,
  INITIAL_ENGINEERS,
  INITIAL_FINANCIAL_ACCOUNT_CONFIGS,
  INITIAL_EXPENSE_CATEGORIES,
  INITIAL_OBRA_TYPES,
  INITIAL_CONCESSIONARIAS,
  INITIAL_DOCUMENT_CATEGORIES,
  INITIAL_MATERIAL_CATEGORIES,
  INITIAL_SYSTEM_USERS,
} from './data/mockData';


import {
  Obra,
  Client,
  InventoryItem,
  StockMovement,
  PurchaseOrder,
  FinancialAccount,
  Vehicle,
  FuelLog,
  Employee,
  EmployeePaymentLog,
  ProtocolChecklistItem,
  ObraDocument,
  ObraExpense,
  DiarioObraRDO,
  GanttTask,
  ObraStatus,
  SystemCompanyConfig,
  TechnicalEngineer,
  FinancialAccountConfig,
  ExpenseCategoryConfig,
  ObraTypeConfig,
  ConcessionariaConfig,
  DocumentCategoryConfig,
  MaterialCategoryConfig,
  SystemUserItem,
  CommercialProposal,
  ApprovedContract,
} from './types';

export default function App() {
  // Navigation & User State
  const [activeTab, setActiveTab] = useState<string>('painel');
  const [newObraSignal, setNewObraSignal] = useState(0);
  const [selectedObraId, setSelectedObraId] = useState<string>('');
  const [role, setRole] = useState<any>('Diretor');
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Sync Dark/Light Mode with HTML document class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.body.classList.remove('dark');
      document.body.classList.add('light');
    }
  }, [darkMode]);

  // LocalStorage Helper for Master State Persistence
  const loadLocal = <T,>(key: string, fallback: T): T => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : fallback;
    } catch (e) {
      return fallback;
    }
  };

  // Registered Users and Permissions State
  const [systemUsers, setSystemUsers] = useState<SystemUserItem[]>(() =>
    loadLocal('proobras_system_users', INITIAL_SYSTEM_USERS)
  );
  const [activeUser, setActiveUser] = useState<SystemUserItem | null>(() =>
    loadLocal('proobras_active_user', null)
  );

  // Sync role with activeUser when loaded or updated
  useEffect(() => {
    if (activeUser) {
      setRole(activeUser.role);
    }
  }, [activeUser]);

  // Handle Login & Logout Handlers
  const handleLoginSuccess = (user: SystemUserItem) => {
    setActiveUser(user);
    setRole(user.role);
    try {
      localStorage.setItem('proobras_active_user', JSON.stringify(user));
    } catch (e) {
      console.warn('Error saving active user session:', e);
    }
  };

  const handleLogout = () => {
    setActiveUser(null);
    try {
      localStorage.removeItem('proobras_active_user');
    } catch (e) {
      console.warn('Error clearing active user session:', e);
    }
  };

  // AI Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [aiMode, setAiMode] = useState<'chat' | 'ocr'>('chat');

  // App Master Data States (With Automatic Local Storage Persistence)
  const [companyConfig, setCompanyConfig] = useState<SystemCompanyConfig>(() =>
    loadLocal('proobras_company_config', INITIAL_COMPANY_CONFIG)
  );
  const [obras, setObras] = useState<Obra[]>(() => loadLocal('proobras_obras', INITIAL_OBRAS));
  const [clients, setClients] = useState<Client[]>(() => loadLocal('proobras_clients', INITIAL_CLIENTS));
  const [inventory, setInventory] = useState<InventoryItem[]>(() => loadLocal('proobras_inventory', INITIAL_INVENTORY));
  const [movements, setMovements] = useState<StockMovement[]>(() => loadLocal('proobras_movements', INITIAL_STOCK_MOVEMENTS));
  const [purchases, setPurchases] = useState<PurchaseOrder[]>(() => loadLocal('proobras_purchases', INITIAL_PURCHASE_ORDERS));
  const [financials, setFinancials] = useState<FinancialAccount[]>(() => loadLocal('proobras_financials', INITIAL_FINANCIAL_ACCOUNTS));
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => loadLocal('proobras_vehicles', INITIAL_VEHICLES));
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>(() => loadLocal('proobras_fuel_logs', INITIAL_FUEL_LOGS));
  const [employees, setEmployees] = useState<Employee[]>(() => loadLocal('proobras_employees', INITIAL_EMPLOYEES));
  const [checklists, setChecklists] = useState<ProtocolChecklistItem[]>(() => loadLocal('proobras_checklists', INITIAL_PROTOCOL_CHECKLISTS));
  const [documents, setDocuments] = useState<ObraDocument[]>(() => loadLocal('proobras_documents', INITIAL_DOCUMENTS));
  const [expenses, setExpenses] = useState<ObraExpense[]>(() => loadLocal('proobras_expenses', INITIAL_EXPENSES));
  const [rdos, setRdos] = useState<DiarioObraRDO[]>(() => loadLocal('proobras_rdos', INITIAL_RDOS));
  const [ganttTasks, setGanttTasks] = useState<GanttTask[]>(() => loadLocal('proobras_gantt_tasks', INITIAL_GANTT_TASKS));
  const [proposals, setProposals] = useState<CommercialProposal[]>(() => loadLocal('proobras_proposals', []));
  const [employeePaymentLogs, setEmployeePaymentLogs] = useState<EmployeePaymentLog[]>(() => loadLocal('proobras_payment_logs', []));
  const [approvedContracts, setApprovedContracts] = useState<ApprovedContract[]>(() => loadLocal('proobras_approved_contracts', []));

  // Auto-Save Effect: Persists state directly to browser/app folder storage whenever modified
  useEffect(() => {
    try {
      localStorage.setItem('proobras_system_users', JSON.stringify(systemUsers));
      if (activeUser) {
        localStorage.setItem('proobras_active_user', JSON.stringify(activeUser));
      } else {
        localStorage.removeItem('proobras_active_user');
      }
      localStorage.setItem('proobras_company_config', JSON.stringify(companyConfig));
      localStorage.setItem('proobras_obras', JSON.stringify(obras));
      localStorage.setItem('proobras_clients', JSON.stringify(clients));
      localStorage.setItem('proobras_inventory', JSON.stringify(inventory));
      localStorage.setItem('proobras_movements', JSON.stringify(movements));
      localStorage.setItem('proobras_purchases', JSON.stringify(purchases));
      localStorage.setItem('proobras_financials', JSON.stringify(financials));
      localStorage.setItem('proobras_vehicles', JSON.stringify(vehicles));
      localStorage.setItem('proobras_fuel_logs', JSON.stringify(fuelLogs));
      localStorage.setItem('proobras_employees', JSON.stringify(employees));
      localStorage.setItem('proobras_checklists', JSON.stringify(checklists));
      localStorage.setItem('proobras_documents', JSON.stringify(documents));
      localStorage.setItem('proobras_expenses', JSON.stringify(expenses));
      localStorage.setItem('proobras_rdos', JSON.stringify(rdos));
      localStorage.setItem('proobras_gantt_tasks', JSON.stringify(ganttTasks));
      localStorage.setItem('proobras_proposals', JSON.stringify(proposals));
      localStorage.setItem('proobras_payment_logs', JSON.stringify(employeePaymentLogs));
      localStorage.setItem('proobras_approved_contracts', JSON.stringify(approvedContracts));
    } catch (err) {
      console.warn('LocalStorage save error:', err);
    }
  }, [
    systemUsers,
    activeUser,
    companyConfig,

    obras,
    clients,
    inventory,
    movements,
    purchases,
    financials,
    vehicles,
    fuelLogs,
    employees,
    checklists,
    documents,
    expenses,
    rdos,
    ganttTasks,
    proposals,
    employeePaymentLogs,
    approvedContracts,
  ]);

  const handleApproveContract = (contract: ApprovedContract) => {
    setApprovedContracts((prev) => [contract, ...prev]);

    // If there is an associated Obra, automatically attach contract document to documents state!
    if (contract.obraId) {
      const newDoc: ObraDocument = {
        id: `DOC-CTR-${Date.now()}`,
        obraId: contract.obraId,
        name: `Contrato de Empreitada - ${contract.contractNumber}`,
        category: 'Contrato',
        version: '1.0',
        status: 'Válido',
        validityDate: '2027-12-31',
        responsible: contract.approvedBy || 'Diretoria Comercial',
        fileName: contract.fileName || `Contrato_${contract.contractNumber}.pdf`,
        fileSize: '485 KB',
        createdAt: contract.approvedAt,
      };
      setDocuments((prev) => [newDoc, ...prev]);
    }

    // Auto-generate Contas a Receber title in Financials
    const newReceivable: FinancialAccount = {
      id: `FIN-CTR-${contract.id}`,
      type: 'Receber',
      description: `Receita Contratual - ${contract.contractNumber} (${contract.clientName})`,
      obraId: contract.obraId,
      obraCode: contract.obraCode,
      category: 'Faturamento Obra',
      totalValue: contract.contractValue,
      paidValue: 0,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Pendente',
      supplierClient: contract.clientName,
      costCenter: 'CC-FATURAMENTO',
      paymentMethod: 'PIX',
      notes: `Gerado automaticamente via Homologação de Contrato ${contract.contractNumber}. Modalidade: ${contract.paymentMethod}`,
    };
    setFinancials((prev) => [newReceivable, ...prev]);
  };

  const handleConvertProposalToObra = (proposal: CommercialProposal) => {
    const nextCodeNum = obras.length + 101;
    const newObra: Obra = {
      id: `OBR-${Date.now()}`,
      code: `OBR-2026-${String(nextCodeNum).padStart(3, '0')}`,
      clientId: proposal.clientId || 'CLI-001',
      clientName: proposal.clientName,
      projectName: `Obra ${proposal.proposalType} - ${proposal.clientName}`,
      powerKva: 150,
      type: proposal.proposalType.includes('Subestação') ? 'Subestação Abrigada' : 'Extensão RDU Urbana',
      concessionaria: 'Energisa',
      municipality: proposal.clientCity || 'Palmas',
      state: proposal.clientState || 'TO',
      techResponsible: engineers[0]?.name || 'Ricardo Moura',
      artNumber: 'ART-2026-99881',
      startDate: new Date().toISOString().split('T')[0],
      expectedEndDate: proposal.validityDate || '2026-12-31',
      status: 'Execução',
      percentageExecuted: 0,
      materialValue: proposal.totalValue * 0.6,
      laborValue: proposal.totalValue * 0.3,
      totalValue: proposal.totalValue,
      expectedProfit: proposal.totalValue * 0.1,
      actualProfit: 0,
      lat: -10.1844,
      lng: -48.3336,
      protocolBlocked: false,
      missingProtocolItemsCount: 0,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    setObras((prev) => [newObra, ...prev]);

    // Auto-generate Contas a Receber title
    const newReceivable: FinancialAccount = {
      id: `FIN-OBRA-${newObra.id}`,
      type: 'Receber',
      description: `Faturamento Obra (Proposta ${proposal.proposalNumber}): ${newObra.projectName}`,
      obraId: newObra.id,
      obraCode: newObra.code,
      category: 'Faturamento Obra',
      totalValue: newObra.totalValue,
      paidValue: 0,
      dueDate: newObra.expectedEndDate,
      status: 'Pendente',
      supplierClient: newObra.clientName,
      costCenter: 'CC-FATURAMENTO',
      paymentMethod: 'PIX',
      notes: `Gerado via conversão direta da Proposta Comercial ${proposal.proposalNumber}`,
    };
    setFinancials((prev) => [newReceivable, ...prev]);

    // Select new Obra and navigate
    setSelectedObraId(newObra.id);
    setActiveTab('obras');
  };

  // Master System Registrations States (With Automatic Local Storage Persistence)
  const [engineers, setEngineers] = useState<TechnicalEngineer[]>(() => loadLocal('voltgrid_engineers', INITIAL_ENGINEERS));
  const [financialAccountConfigs, setFinancialAccountConfigs] = useState<FinancialAccountConfig[]>(() => loadLocal('voltgrid_fin_account_configs', INITIAL_FINANCIAL_ACCOUNT_CONFIGS));
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategoryConfig[]>(() => loadLocal('voltgrid_expense_cats', INITIAL_EXPENSE_CATEGORIES));
  const [obraTypes, setObraTypes] = useState<ObraTypeConfig[]>(() => loadLocal('voltgrid_obra_types', INITIAL_OBRA_TYPES));
  const [concessionarias, setConcessionarias] = useState<ConcessionariaConfig[]>(() => loadLocal('voltgrid_concessionarias', INITIAL_CONCESSIONARIAS));
  const [documentCategories, setDocumentCategories] = useState<DocumentCategoryConfig[]>(() => loadLocal('voltgrid_doc_cats', INITIAL_DOCUMENT_CATEGORIES));
  const [materialCategories, setMaterialCategories] = useState<MaterialCategoryConfig[]>(() => loadLocal('voltgrid_mat_cats', INITIAL_MATERIAL_CATEGORIES));

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Handler functions
  const handleAddObra = (newObra: Obra) => {
    setObras((prev) => [newObra, ...prev]);

    // Automatically create a "Conta a Receber" title in Financials initialized as Pendente
    const newReceivable: FinancialAccount = {
      id: `FIN-OBRA-${newObra.id}`,
      type: 'Receber',
      description: `Faturamento Obra: ${newObra.projectName}`,
      category: 'Faturamento Obra',
      totalValue: newObra.totalValue,
      paidValue: 0,
      dueDate: newObra.expectedEndDate || newObra.startDate || new Date().toISOString().split('T')[0],
      status: 'Pendente',
      supplierClient: newObra.clientName || 'Cliente Obra',
      costCenter: 'CC-FATURAMENTO-OBRAS',
      paymentMethod: 'PIX',
      obraId: newObra.id,
      obraCode: newObra.code,
    };

    setFinancials((prev) => [newReceivable, ...prev]);
  };

  const handleUpdateObra = (updatedObra: Obra) => {
    setObras((prev) =>
      prev.map((o) => (o.id === updatedObra.id ? { ...updatedObra, updatedAt: new Date().toISOString() } : o))
    );
    // Sync matching financial receivable title
    setFinancials((prev) =>
      prev.map((f) =>
        f.obraId === updatedObra.id && f.type === 'Receber'
          ? {
              ...f,
              totalValue: updatedObra.totalValue,
              supplierClient: updatedObra.clientName || f.supplierClient,
              description: `Faturamento Obra: ${updatedObra.projectName}`,
              dueDate: updatedObra.expectedEndDate || f.dueDate,
            }
          : f
      )
    );
  };

  const handleDeleteObra = (obraId: string) => {
    setObras((prev) => prev.filter((o) => o.id !== obraId));
    setFinancials((prev) => prev.filter((f) => f.obraId !== obraId));
  };

  const handleUpdateObraStatus = (obraId: string, status: ObraStatus) => {
    setObras((prev) =>
      prev.map((o) => (o.id === obraId ? { ...o, status, updatedAt: new Date().toISOString() } : o))
    );
  };

  const handleToggleChecklist = (checkId: string) => {
    setChecklists((prev) =>
      prev.map((item) => {
        if (item.id === checkId) {
          const nextStatus = item.status === 'Aprovado' ? 'Pendente' : 'Aprovado';
          return { ...item, status: nextStatus as any };
        }
        return item;
      })
    );
  };

  const handleAddChecklistItem = (item: ProtocolChecklistItem) => {
    setChecklists((prev) => [item, ...prev]);
  };

  const handleAddDocument = (doc: ObraDocument) => {
    setDocuments((prev) => [doc, ...prev]);
  };

  const handleUpdateDocument = (updatedDoc: ObraDocument) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === updatedDoc.id ? updatedDoc : d))
    );
  };

  const handleDeleteDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  };

  const mapExpenseCategoryToFinancialCategory = (cat: ObraExpense['category']): FinancialAccount['category'] => {
    switch (cat) {
      case 'Materiais':
      case 'Ferramentas':
      case 'Fornecedores':
        return 'Material';
      case 'Funcionários':
        return 'Mão de Obra';
      case 'Combustível':
      case 'Veículos':
      case 'Fretes':
      case 'Pedágio':
        return 'Frota/Combustível';
      case 'Hotel':
      case 'Alimentação':
        return 'Diárias/Hospedagem';
      case 'Equipamentos':
      case 'Linha Viva':
        return 'Equipamentos/Linha Viva';
      default:
        return 'Material';
    }
  };

  const handleAddExpense = (newExp: ObraExpense) => {
    setExpenses((prev) => [newExp, ...prev]);

    // Automatically create corresponding entry in Contas a Pagar in Gestão Financeira
    const obra = obras.find((o) => o.id === newExp.obraId);
    const newPayable: FinancialAccount = {
      id: `FIN-EXP-${newExp.id}`,
      type: 'Pagar',
      category: mapExpenseCategoryToFinancialCategory(newExp.category),
      description: `Despesa de Obra: ${newExp.description} (${newExp.category})`,
      totalValue: newExp.value,
      paidValue: newExp.status === 'Pago' ? newExp.value : 0,
      dueDate: newExp.date || new Date().toISOString().split('T')[0],
      status: newExp.status || 'Pago',
      supplierClient: newExp.responsible || 'Fornecedor da Obra',
      costCenter: obra ? `CC-${obra.code}` : 'CC-OBRAS',
      paymentMethod: 'PIX',
      obraId: newExp.obraId,
      obraCode: obra?.code,
    };
    setFinancials((prev) => [newPayable, ...prev]);

    // Also deduct from actual profit of Obra
    setObras((prev) =>
      prev.map((o) =>
        o.id === newExp.obraId ? { ...o, actualProfit: Math.max(0, o.actualProfit - newExp.value) } : o
      )
    );
  };

  const handleUpdateExpense = (updatedExpense: ObraExpense) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === updatedExpense.id ? updatedExpense : e))
    );

    const obra = obras.find((o) => o.id === updatedExpense.obraId);
    setFinancials((prev) => {
      const exists = prev.some((f) => f.id === `FIN-EXP-${updatedExpense.id}`);
      if (exists) {
        return prev.map((f) =>
          f.id === `FIN-EXP-${updatedExpense.id}`
            ? {
                ...f,
                category: mapExpenseCategoryToFinancialCategory(updatedExpense.category),
                description: `Despesa de Obra: ${updatedExpense.description} (${updatedExpense.category})`,
                totalValue: updatedExpense.value,
                paidValue: updatedExpense.status === 'Pago' ? updatedExpense.value : 0,
                dueDate: updatedExpense.date || f.dueDate,
                status: updatedExpense.status || f.status,
                supplierClient: updatedExpense.responsible || f.supplierClient,
                obraId: updatedExpense.obraId,
                obraCode: obra?.code || f.obraCode,
              }
            : f
        );
      } else {
        const newPayable: FinancialAccount = {
          id: `FIN-EXP-${updatedExpense.id}`,
          type: 'Pagar',
          category: mapExpenseCategoryToFinancialCategory(updatedExpense.category),
          description: `Despesa de Obra: ${updatedExpense.description} (${updatedExpense.category})`,
          totalValue: updatedExpense.value,
          paidValue: updatedExpense.status === 'Pago' ? updatedExpense.value : 0,
          dueDate: updatedExpense.date || new Date().toISOString().split('T')[0],
          status: updatedExpense.status || 'Pago',
          supplierClient: updatedExpense.responsible || 'Fornecedor da Obra',
          costCenter: obra ? `CC-${obra.code}` : 'CC-OBRAS',
          paymentMethod: 'PIX',
          obraId: updatedExpense.obraId,
          obraCode: obra?.code,
        };
        return [newPayable, ...prev];
      }
    });
  };

  const handleDeleteExpense = (expenseId: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
    setFinancials((prev) => prev.filter((f) => f.id !== `FIN-EXP-${expenseId}`));
  };

  const handleAddStockMovement = (mov: StockMovement) => {
    setMovements((prev) => [mov, ...prev]);
    // Adjust inventory
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === mov.itemId) {
          const newQty =
            mov.type === 'Entrada'
              ? item.currentQuantity + mov.quantity
              : Math.max(0, item.currentQuantity - mov.quantity);
          return { ...item, currentQuantity: newQty };
        }
        return item;
      })
    );
  };

  const handleAddPurchaseOrder = (po: PurchaseOrder) => {
    setPurchases((prev) => [po, ...prev]);
  };

  const handleAddFinancial = (acc: FinancialAccount) => {
    setFinancials((prev) => [acc, ...prev]);
  };

  const handleUpdateFinancialAccount = (updatedAcc: FinancialAccount) => {
    setFinancials((prev) => prev.map((f) => (f.id === updatedAcc.id ? updatedAcc : f)));
  };

  const handleDeleteFinancialAccount = (accId: string) => {
    setFinancials((prev) => prev.filter((f) => f.id !== accId));
  };

  const handleUpdateFinancialStatus = (accId: string, status: 'Pago' | 'Pendente') => {
    setFinancials((prev) =>
      prev.map((acc) => (acc.id === accId ? { ...acc, status } : acc))
    );
  };

  const handleAddFuelLog = (log: FuelLog) => {
    setFuelLogs((prev) => [log, ...prev]);

    // Automatically create corresponding entry in Contas a Pagar in Gestão Financeira
    const newPayable: FinancialAccount = {
      id: `FIN-FUEL-${log.id}`,
      type: 'Pagar',
      category: 'Frota/Combustível',
      description: `Abastecimento: ${log.vehicleModel} (${log.vehiclePlate}) - ${log.liters}L`,
      totalValue: log.totalValue,
      paidValue: log.totalValue,
      dueDate: log.date || new Date().toISOString().split('T')[0],
      status: 'Pago',
      supplierClient: log.stationName || 'Posto de Combustível',
      costCenter: 'CC-FROTA-COMBUSTIVEL',
      paymentMethod: 'PIX',
      obraId: log.obraId,
      obraCode: log.obraCode,
    };

    setFinancials((prev) => [newPayable, ...prev]);
  };

  const handleUpdateFuelLog = (updatedLog: FuelLog) => {
    setFuelLogs((prev) =>
      prev.map((f) => (f.id === updatedLog.id ? updatedLog : f))
    );

    // Sync matching financial account entry
    setFinancials((prev) => {
      const exists = prev.some((f) => f.id === `FIN-FUEL-${updatedLog.id}`);
      if (exists) {
        return prev.map((f) =>
          f.id === `FIN-FUEL-${updatedLog.id}`
            ? {
                ...f,
                category: 'Frota/Combustível',
                description: `Abastecimento: ${updatedLog.vehicleModel} (${updatedLog.vehiclePlate}) - ${updatedLog.liters}L`,
                totalValue: updatedLog.totalValue,
                paidValue: updatedLog.totalValue,
                dueDate: updatedLog.date || f.dueDate,
                supplierClient: updatedLog.stationName || f.supplierClient,
                obraId: updatedLog.obraId,
                obraCode: updatedLog.obraCode,
              }
            : f
        );
      } else {
        const newPayable: FinancialAccount = {
          id: `FIN-FUEL-${updatedLog.id}`,
          type: 'Pagar',
          category: 'Frota/Combustível',
          description: `Abastecimento: ${updatedLog.vehicleModel} (${updatedLog.vehiclePlate}) - ${updatedLog.liters}L`,
          totalValue: updatedLog.totalValue,
          paidValue: updatedLog.totalValue,
          dueDate: updatedLog.date || new Date().toISOString().split('T')[0],
          status: 'Pago',
          supplierClient: updatedLog.stationName || 'Posto de Combustível',
          costCenter: 'CC-FROTA-COMBUSTIVEL',
          paymentMethod: 'PIX',
          obraId: updatedLog.obraId,
          obraCode: updatedLog.obraCode,
        };
        return [newPayable, ...prev];
      }
    });
  };

  const handleDeleteFuelLog = (logId: string) => {
    setFuelLogs((prev) => prev.filter((f) => f.id !== logId));
    // Automatically remove corresponding financial title
    setFinancials((prev) => prev.filter((f) => f.id !== `FIN-FUEL-${logId}`));
  };

  const handleAddClient = (client: Client) => {
    setClients((prev) => [client, ...prev]);
  };

  const handleUpdateClient = (updatedClient: Client) => {
    setClients((prev) => prev.map((c) => (c.id === updatedClient.id ? updatedClient : c)));
  };

  const handleDeleteClient = (clientId: string) => {
    if (confirm('Tem certeza de que deseja excluir este cliente?')) {
      setClients((prev) => prev.filter((c) => c.id !== clientId));
    }
  };

  const handleAddEmployee = (employee: Employee) => {
    setEmployees((prev) => [employee, ...prev]);
  };

  const handleUpdateEmployee = (updatedEmployee: Employee) => {
    setEmployees((prev) => prev.map((e) => (e.id === updatedEmployee.id ? updatedEmployee : e)));
  };

  const handleDeleteEmployee = (employeeId: string) => {
    // Soft Delete: Mark status as 'Inativo' instead of removing record to preserve financial logs and history
    setEmployees((prev) =>
      prev.map((e) => (e.id === employeeId ? { ...e, status: 'Inativo' } : e))
    );
  };

  const handleAddEmployeePaymentLog = (log: EmployeePaymentLog) => {
    setEmployeePaymentLogs((prev) => [log, ...prev]);

    // Automatically create entry in Contas a Pagar in Gestão Financeira under category Mão de Obra
    const newPayable: FinancialAccount = {
      id: `FIN-HR-${log.id}`,
      type: 'Pagar',
      category: 'Mão de Obra',
      description: `Pagamento Diárias: ${log.employeeName} (${log.daysWorked} dias${log.advancesValue > 0 ? ` - Vale: R$ ${log.advancesValue}` : ''})`,
      totalValue: log.netAmount,
      paidValue: log.netAmount,
      dueDate: log.paymentDate || new Date().toISOString().split('T')[0],
      status: 'Pago',
      supplierClient: log.employeeName,
      costCenter: 'CC-MAO-DE-OBRA',
      paymentMethod: 'PIX',
      obraId: log.obraId,
      obraCode: log.obraCode,
    };
    setFinancials((prev) => [newPayable, ...prev]);
  };

  const handleUpdateEmployeePaymentLog = (updatedLog: EmployeePaymentLog) => {
    setEmployeePaymentLogs((prev) =>
      prev.map((l) => (l.id === updatedLog.id ? updatedLog : l))
    );

    // Sync matching financial account entry
    setFinancials((prev) => {
      const exists = prev.some((f) => f.id === `FIN-HR-${updatedLog.id}`);
      if (exists) {
        return prev.map((f) =>
          f.id === `FIN-HR-${updatedLog.id}`
            ? {
                ...f,
                category: 'Mão de Obra',
                description: `Pagamento Diárias: ${updatedLog.employeeName} (${updatedLog.daysWorked} dias${updatedLog.advancesValue > 0 ? ` - Vale: R$ ${updatedLog.advancesValue}` : ''})`,
                totalValue: updatedLog.netAmount,
                paidValue: updatedLog.netAmount,
                dueDate: updatedLog.paymentDate || f.dueDate,
                supplierClient: updatedLog.employeeName,
                obraId: updatedLog.obraId,
                obraCode: updatedLog.obraCode,
              }
            : f
        );
      } else {
        const newPayable: FinancialAccount = {
          id: `FIN-HR-${updatedLog.id}`,
          type: 'Pagar',
          category: 'Mão de Obra',
          description: `Pagamento Diárias: ${updatedLog.employeeName} (${updatedLog.daysWorked} dias${updatedLog.advancesValue > 0 ? ` - Vale: R$ ${updatedLog.advancesValue}` : ''})`,
          totalValue: updatedLog.netAmount,
          paidValue: updatedLog.netAmount,
          dueDate: updatedLog.paymentDate || new Date().toISOString().split('T')[0],
          status: 'Pago',
          supplierClient: updatedLog.employeeName,
          costCenter: 'CC-MAO-DE-OBRA',
          paymentMethod: 'PIX',
          obraId: updatedLog.obraId,
          obraCode: updatedLog.obraCode,
        };
        return [newPayable, ...prev];
      }
    });
  };

  const handleDeleteEmployeePaymentLog = (logId: string) => {
    setEmployeePaymentLogs((prev) => prev.filter((l) => l.id !== logId));
    // Automatically remove corresponding financial title
    setFinancials((prev) => prev.filter((f) => f.id !== `FIN-HR-${logId}`));
  };

  const handleAddVehicle = (vehicle: Vehicle) => {
    setVehicles((prev) => [vehicle, ...prev]);
  };

  const handleUpdateVehicle = (updatedVehicle: Vehicle) => {
    setVehicles((prev) => prev.map((v) => (v.id === updatedVehicle.id ? updatedVehicle : v)));
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    // Soft Delete: Mark status as 'Manutenção' to preserve historical fuel logs and financial accounts
    setVehicles((prev) =>
      prev.map((v) => (v.id === vehicleId ? { ...v, status: 'Manutenção' } : v))
    );
  };

  const handleNavigateToObra = (obraId: string) => {
    setSelectedObraId(obraId);
    setActiveTab('obras');
  };

  const handleOpenNewObraFromDashboard = () => {
    setNewObraSignal((n) => n + 1);
    setActiveTab('obras');
  };

  // Public URL Approval Router for Client Link sent via WhatsApp (?aprovar=...)
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const publicApprovalId = urlParams?.get('aprovar') || urlParams?.get('proposta');

  if (publicApprovalId) {
    const targetProposal = proposals.find((p) => p.id === publicApprovalId || p.proposalNumber === publicApprovalId) || proposals[0];

    if (targetProposal) {
      return (
        <PublicProposalApproval
          proposal={targetProposal}
          companyConfig={companyConfig}
          onApprove={(prop, signerName, signerCpf) => {
            const formattedDate = new Date().toLocaleDateString('pt-BR');
            const nowIso = new Date().toISOString();

            const updatedProp: CommercialProposal = {
              ...prop,
              status: 'Aprovada',
              history: [
                {
                  id: `LOG-${Date.now()}`,
                  date: formattedDate,
                  user: `Cliente: ${signerName}`,
                  action: `Proposta APROVADA DIGITALMENTE pelo cliente (CPF/CNPJ: ${signerCpf})`,
                  version: prop.currentVersion,
                },
                ...(prop.history || []),
              ],
              updatedAt: nowIso,
            };

            const updatedList = proposals.map((p) => (p.id === prop.id ? updatedProp : p));
            setProposals(updatedList);
            try {
              localStorage.setItem('proobras_proposals', JSON.stringify(updatedList));
            } catch (e) {}

            handleConvertProposalToObra(updatedProp);

            try {
              window.history.replaceState({}, document.title, window.location.pathname);
            } catch (e) {}
          }}
          onClose={() => {
            try {
              window.history.replaceState({}, document.title, window.location.pathname);
              window.location.reload();
            } catch (e) {}
          }}
        />
      );
    }
  }

  if (!activeUser) {
    return (
      <AuthScreen
        systemUsers={systemUsers}
        onLoginSuccess={handleLoginSuccess}
        companyName={companyConfig.nomeFantasia || 'ProObras ERP • VoltGrid'}
      />
    );
  }


  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans selection:bg-blue-500 selection:text-white transition-colors duration-200">
      {/* Header */}
      <Header
        role={role}
        onRoleChange={setRole}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        pendingAlertsCount={
          financials.filter((f) => f.status === 'Pendente').length
        }
        registeredUsers={systemUsers}
        activeUser={activeUser}
        onSelectUser={(u) => {
          setActiveUser(u);
          if (u) setRole(u.role);
        }}
        onLogout={handleLogout}
      />


      {/* Main Layout Container */}
      <div className="flex pt-16 print:pt-0 print:block">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          allowedModules={activeUser ? activeUser.allowedModules : undefined}
          counts={{
            obrasCount: obras.length,
            clientsCount: clients.length,
            expiredCompanyDocsCount: 0,
          }}
        />

        {/* Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 print:p-0 print:m-0 print:max-w-none">
          {activeTab === 'painel' && (
            <Dashboard
              obras={obras}
              financials={financials}
              inventory={inventory}
              vehicles={vehicles}
              employees={employees}
              expenses={expenses}
              onNavigateToObra={handleNavigateToObra}
              onOpenNewObra={handleOpenNewObraFromDashboard}
              onNavigateToTab={setActiveTab}
            />
          )}

          {activeTab === 'obras' && (
            <ObrasModule
              obras={obras}
              clients={clients}
              checklists={checklists}
              documents={documents}
              expenses={expenses}
              fuelLogs={fuelLogs}
              financials={financials}
              movements={movements}
              vehicles={vehicles}
              employees={employees}
              rdos={rdos}
              ganttTasks={ganttTasks}
              onAddObra={handleAddObra}
              onUpdateObra={handleUpdateObra}
              onDeleteObra={handleDeleteObra}
              onUpdateObraStatus={handleUpdateObraStatus}
              onToggleChecklist={handleToggleChecklist}
              onAddChecklistItem={handleAddChecklistItem}
              onAddDocument={handleAddDocument}
              onUpdateDocument={handleUpdateDocument}
              onDeleteDocument={handleDeleteDocument}
              onAddExpense={handleAddExpense}
              onUpdateExpense={handleUpdateExpense}
              onDeleteExpense={handleDeleteExpense}
              onAddRDO={(rdo) => setRdos((prev) => [rdo, ...prev])}
              selectedObraIdFromParent={selectedObraId}
              openNewModalSignal={newObraSignal}
            />
          )}

          {(activeTab === 'crm' || activeTab === 'clientes') && (
            <CRMModule
              initialTab={activeTab === 'clientes' ? 'clientes' : 'propostas'}
              clients={clients}
              obras={obras}
              onAddClient={handleAddClient}
              onUpdateClient={handleUpdateClient}
              onDeleteClient={handleDeleteClient}
              companyConfig={companyConfig}
              proposals={proposals}
              onSaveProposals={setProposals}
              userRole={role}
              activeUserName={activeUser ? activeUser.name : 'Engenheiro Responsável'}
              onConvertProposalToObra={handleConvertProposalToObra}
            />
          )}

          {activeTab === 'financeiro' && (
            <FinancialModule
              financials={financials}
              obras={obras}
              clients={clients}
              expenses={expenses}
              onAddAccount={handleAddFinancial}
              onUpdateAccount={handleUpdateFinancialAccount}
              onDeleteAccount={handleDeleteFinancialAccount}
              onUpdateExpense={handleUpdateExpense}
              onDeleteExpense={handleDeleteExpense}
              onUpdateStatus={handleUpdateFinancialStatus}
            />
          )}

          {activeTab === 'frota' && (
            <FleetModule
              vehicles={vehicles}
              fuelLogs={fuelLogs}
              obras={obras}
              onAddVehicle={handleAddVehicle}
              onUpdateVehicle={handleUpdateVehicle}
              onDeleteVehicle={handleDeleteVehicle}
              onAddFuelLog={handleAddFuelLog}
              onUpdateFuelLog={handleUpdateFuelLog}
              onDeleteFuelLog={handleDeleteFuelLog}
            />
          )}

          {activeTab === 'rh' && (
            <HRModule
              employees={employees}
              obras={obras}
              paymentLogs={employeePaymentLogs}
              onAddEmployee={handleAddEmployee}
              onUpdateEmployee={handleUpdateEmployee}
              onDeleteEmployee={handleDeleteEmployee}
              onAddPaymentLog={handleAddEmployeePaymentLog}
              onUpdatePaymentLog={handleUpdateEmployeePaymentLog}
              onDeletePaymentLog={handleDeleteEmployeePaymentLog}
            />
          )}

          {activeTab === 'relatorios' && (
            <ReportsModule
              obras={obras}
              clients={clients}
              financials={financials}
              fuelLogs={fuelLogs}
              expenses={expenses}
              employees={employees}
              paymentLogs={employeePaymentLogs}
              companyConfig={companyConfig}
            />
          )}

          {activeTab === 'documentacao' && (
            <DocumentosGeradorModule
              clients={clients}
              obras={obras}
              engineers={engineers}
              companyConfig={companyConfig}
              proposals={proposals}
              approvedContracts={approvedContracts}
              onApproveContract={handleApproveContract}
            />
          )}

          {(activeTab === 'cadastros' || activeTab === 'cadastros_usuarios' || activeTab === 'cadastros_fornecedores' || activeTab === 'cadastros_documentos_empresa') && (
            <CadastrosModule
              initialSubTab={
                activeTab === 'cadastros_documentos_empresa'
                  ? 'documentos_empresa'
                  : activeTab === 'cadastros_usuarios'
                  ? 'usuarios'
                  : activeTab === 'cadastros_fornecedores'
                  ? 'empresa'
                  : 'documentos_empresa'
              }
              onRoleChange={setRole}
              systemUsers={systemUsers}
              onSaveUsers={setSystemUsers}
              onSelectUser={(u) => {
                setActiveUser(u);
                if (u) setRole(u.role);
              }}
              companyConfig={companyConfig}
              onUpdateCompanyConfig={setCompanyConfig}
              engineers={engineers}
              onAddEngineer={(eng) => setEngineers((prev) => [eng, ...prev])}
              onUpdateEngineer={(eng) => setEngineers((prev) => prev.map((e) => e.id === eng.id ? eng : e))}
              onDeleteEngineer={(id) => setEngineers((prev) => prev.filter((e) => e.id !== id))}
              financialAccountConfigs={financialAccountConfigs}
              onAddFinancialAccountConfig={(acc) => setFinancialAccountConfigs((prev) => [acc, ...prev])}
              onUpdateFinancialAccountConfig={(acc) => setFinancialAccountConfigs((prev) => prev.map((a) => a.id === acc.id ? acc : a))}
              onDeleteFinancialAccountConfig={(id) => setFinancialAccountConfigs((prev) => prev.filter((a) => a.id !== id))}
              expenseCategories={expenseCategories}
              onAddExpenseCategory={(cat) => setExpenseCategories((prev) => [cat, ...prev])}
              onUpdateExpenseCategory={(cat) => setExpenseCategories((prev) => prev.map((c) => c.id === cat.id ? cat : c))}
              onDeleteExpenseCategory={(id) => setExpenseCategories((prev) => prev.filter((c) => c.id !== id))}
              obraTypes={obraTypes}
              onAddObraType={(ot) => setObraTypes((prev) => [ot, ...prev])}
              onUpdateObraType={(ot) => setObraTypes((prev) => prev.map((t) => t.id === ot.id ? ot : t))}
              onDeleteObraType={(id) => setObraTypes((prev) => prev.filter((t) => t.id !== id))}
              concessionarias={concessionarias}
              onAddConcessionaria={(con) => setConcessionarias((prev) => [con, ...prev])}
              onUpdateConcessionaria={(con) => setConcessionarias((prev) => prev.map((c) => c.id === con.id ? con : c))}
              onDeleteConcessionaria={(id) => setConcessionarias((prev) => prev.filter((c) => c.id !== id))}
              documentCategories={documentCategories}
              onAddDocumentCategory={(dc) => setDocumentCategories((prev) => [dc, ...prev])}
              onUpdateDocumentCategory={(dc) => setDocumentCategories((prev) => prev.map((d) => d.id === dc.id ? dc : d))}
              onDeleteDocumentCategory={(id) => setDocumentCategories((prev) => prev.filter((d) => d.id !== id))}
              materialCategories={materialCategories}
              onAddMaterialCategory={(mc) => setMaterialCategories((prev) => [mc, ...prev])}
              onUpdateMaterialCategory={(mc) => setMaterialCategories((prev) => prev.map((m) => m.id === mc.id ? mc : m))}
              onDeleteMaterialCategory={(id) => setMaterialCategories((prev) => prev.filter((m) => m.id !== id))}
            />
          )}
        </main>
      </div>
    </div>
  );
}
