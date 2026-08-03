import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import {
  HardHat,
  Search,
  Filter,
  Plus,
  Zap,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  CheckCircle,
  FileText,
  FilePlus,
  DollarSign,
  Clock,
  Camera,
  Layers,
  ChevronRight,
  ShieldAlert,
  Paperclip,
  Upload,
  Download,
  FolderDown,
  Package,
  UserCheck,
  X,
  Edit,
  Trash2,
  FileCheck,
  Play,
  Check,
  CheckSquare,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import {
  Obra,
  ObraStatus,
  ObraType,
  Concessionaria,
  ProtocolChecklistItem,
  ObraDocument,
  ObraExpense,
  DiarioObraRDO,
  GanttTask,
  Client,
  FuelLog,
  FinancialAccount,
  StockMovement,
  Vehicle,
  Employee,
} from '../types';
import { calculateObraFinancials } from '../utils/calculations';

interface ObrasModuleProps {
  obras: Obra[];
  clients: Client[];
  checklists: ProtocolChecklistItem[];
  documents: ObraDocument[];
  expenses: ObraExpense[];
  fuelLogs?: FuelLog[];
  financials?: FinancialAccount[];
  movements?: StockMovement[];
  vehicles?: Vehicle[];
  employees?: Employee[];
  rdos: DiarioObraRDO[];
  ganttTasks: GanttTask[];
  onAddObra: (obra: Obra) => void;
  onUpdateObra?: (obra: Obra) => void;
  onDeleteObra?: (obraId: string) => void;
  onUpdateObraStatus: (obraId: string, status: ObraStatus) => void;
  onToggleChecklist: (checkId: string) => void;
  onAddChecklistItem?: (item: ProtocolChecklistItem) => void;
  onAddDocument?: (doc: ObraDocument) => void;
  onUpdateDocument?: (doc: ObraDocument) => void;
  onDeleteDocument?: (docId: string) => void;
  onAddExpense: (expense: ObraExpense) => void;
  onUpdateExpense?: (expense: ObraExpense) => void;
  onDeleteExpense?: (expenseId: string) => void;
  onAddRDO: (rdo: DiarioObraRDO) => void;
  selectedObraIdFromParent?: string;
}

const OBRA_PHASES: ObraStatus[] = [
  'Orçamento',
  'Aprovada',
  'Cotação',
  'Proposta',
  'Contrato',
  'Notas Fiscais',
  'Laudos',
  'Execução',
  'Fiscalização',
  'Ligação',
  'Finalizada',
  'Recebida',
];

const DEFAULT_STAGE_CHECKLISTS: Record<
  ObraStatus,
  Array<{ title: string; category: 'Legal' | 'Técnico' | 'Nota Fiscal' | 'Laudo' | 'Cliente'; required: boolean }>
> = {
  Orçamento: [
    { title: 'Levantamento Inicial de Carga & Solicitação do Cliente', category: 'Técnico', required: true },
    { title: 'Análise de Viabilidade Técnica e Previsão de BDI', category: 'Técnico', required: true },
    { title: 'Elaboração da Estimativa de Custos da Obra', category: 'Técnico', required: true },
  ],
  Aprovada: [
    { title: 'Aprovação Comercial do Escopo pelo Cliente', category: 'Cliente', required: true },
    { title: 'Emissão da Ordem de Serviço (OS Inicial)', category: 'Técnico', required: true },
    { title: 'Designação do Engenheiro Responsável Técnico no CREA', category: 'Técnico', required: true },
  ],
  Cotação: [
    { title: 'Cotação de Preços de Postes, Transformadores e Cabos', category: 'Técnico', required: true },
    { title: 'Mapa Comparativo de Fornecedores e Prazos de Entrega', category: 'Nota Fiscal', required: true },
    { title: 'Validação Comercial das Propostas de Suprimentos', category: 'Técnico', required: true },
  ],
  Proposta: [
    { title: 'Elaboração da Proposta Técnica-Comercial Definitiva', category: 'Técnico', required: true },
    { title: 'Apresentação das Condições de Pagamento e Prazos', category: 'Cliente', required: true },
    { title: 'Aceite e Validação do Cliente na Proposta', category: 'Cliente', required: true },
  ],
  Contrato: [
    { title: 'Elaboração e Minuta do Contrato de Prestação de Serviços', category: 'Legal', required: true },
    { title: 'Assinatura Digital / Reconhecimento das Partes', category: 'Legal', required: true },
    { title: 'Emissão da ART de Execução/Projeto no CREA', category: 'Legal', required: true },
  ],
  'Notas Fiscais': [
    { title: 'Faturamento de Entrada / Sinal da Obra', category: 'Nota Fiscal', required: true },
    { title: 'Emissão das NFs de Compra de Materiais e Equipamentos', category: 'Nota Fiscal', required: true },
    { title: 'Lançamento Contábil e Fiscal das NFs de Fornecedores', category: 'Nota Fiscal', required: true },
  ],
  Laudos: [
    { title: 'Laudo de Ensaio de Rotina do Transformador (150kVA+)', category: 'Laudo', required: true },
    { title: 'Laudo de Medição do Aterramento e Malha', category: 'Laudo', required: true },
    { title: 'Laudo de Rigidez Dielétrica e Isolantes', category: 'Laudo', required: true },
  ],
  Execução: [
    { title: 'Implantação de Campo, Montagem e Lançamento de Rede', category: 'Técnico', required: true },
    { title: 'Validação das NRs dos Linheiros (NR-10, NR-35)', category: 'Legal', required: true },
    { title: 'Instalação de Postes, Transformador e Proteções', category: 'Técnico', required: true },
  ],
  Fiscalização: [
    { title: 'Vistoria Prévia da Engenharia Interna VoltGrid', category: 'Técnico', required: true },
    { title: 'Relatório de Conformidade Técnica Pré-Protocolo', category: 'Técnico', required: true },
    { title: 'Sanação e Resolução de Pendências da Vistoria', category: 'Técnico', required: true },
  ],
  Ligação: [
    { title: 'Protocolo de Pedido de Ligação/Vistoria na Concessionária', category: 'Legal', required: true },
    { title: 'Instalação dos Medidores e Energização da Rede', category: 'Técnico', required: true },
    { title: 'Termo de Energização e Comissionamento em Carga', category: 'Laudo', required: true },
  ],
  Finalizada: [
    { title: 'Desenhos As-Built (Projeto Conforme Construído)', category: 'Técnico', required: true },
    { title: 'Conclusão Física de Todos os Serviços Contratados', category: 'Técnico', required: true },
    { title: 'Baixa da ART no CREA e Emissão da NF-e Final', category: 'Legal', required: true },
  ],
  Recebida: [
    { title: 'Termo de Recebimento Definitivo Assinado pelo Cliente', category: 'Cliente', required: true },
    { title: 'Quitação Financeira Total da Obra', category: 'Nota Fiscal', required: true },
    { title: 'Entrega do Dossiê Completo de Engenharia ao Cliente', category: 'Legal', required: true },
  ],
  Cancelada: [
    { title: 'Termo de Distrato / Cancelamento de Obra', category: 'Legal', required: true },
    { title: 'Devolução de Materiais ao Estoque', category: 'Técnico', required: true },
  ],
};

const DEFAULT_OBRA_PROCESS_TEMPLATES: Array<{
  title: string;
  duration: number;
  phase: ObraStatus;
}> = [
  { title: 'Levantamento Inicial de Carga & Estimativa', duration: 3, phase: 'Orçamento' },
  { title: 'Aprovação do Orçamento & Liberação da OS', duration: 2, phase: 'Aprovada' },
  { title: 'Cotação de Materiais & Tabela Comparativa', duration: 5, phase: 'Cotação' },
  { title: 'Elaboração e Apresentação da Proposta Comercial', duration: 4, phase: 'Proposta' },
  { title: 'Assinatura do Contrato & Emissão da ART no CREA', duration: 5, phase: 'Contrato' },
  { title: 'Faturamento de Entrada & Lançamento de NFs de Fornecedores', duration: 3, phase: 'Notas Fiscais' },
  { title: 'Emissão de Laudo do Transformador & Medição de Malha', duration: 4, phase: 'Laudos' },
  { title: 'Execução e Montagem de Campo (Rede RDU/RDR)', duration: 20, phase: 'Execução' },
  { title: 'Vistoria de Conformidade e Fiscalização Interna', duration: 3, phase: 'Fiscalização' },
  { title: 'Protocolo de Vistoria, Medição & Energização (Ligação)', duration: 10, phase: 'Ligação' },
  { title: 'Desenhos As-Built, Baixa de ART & NF-e Final', duration: 5, phase: 'Finalizada' },
  { title: 'Termo de Recebimento Definitivo pelo Cliente & Quitação', duration: 2, phase: 'Recebida' },
];

export const ObrasModule: React.FC<ObrasModuleProps> = ({
  obras,
  clients,
  checklists,
  documents,
  expenses,
  fuelLogs = [],
  financials = [],
  movements = [],
  vehicles = [],
  employees = [],
  rdos,
  ganttTasks,
  onAddObra,
  onUpdateObra,
  onDeleteObra,
  onUpdateObraStatus,
  onToggleChecklist,
  onAddChecklistItem,
  onAddDocument,
  onUpdateDocument,
  onDeleteDocument,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  onAddRDO,
  selectedObraIdFromParent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('TODOS');
  const [selectedConcessionaria, setSelectedConcessionaria] = useState<string>('TODAS');
  const [activeObraModal, setActiveObraModal] = useState<Obra | null>(
    selectedObraIdFromParent ? obras.find((o) => o.id === selectedObraIdFromParent) || null : null
  );
  const [detailTab, setDetailTab] = useState<'geral' | 'fases' | 'docs' | 'custos'>('geral');

  // Document Management & Editing State
  const [localObraDocuments, setLocalObraDocuments] = useState<Record<string, ObraDocument[]>>({});
  const [editingDoc, setEditingDoc] = useState<ObraDocument | null>(null);
  const [editDocName, setEditDocName] = useState('');
  const [editDocCategory, setEditDocCategory] = useState<ObraDocument['category']>('Projeto Elétrico');
  const [editDocStage, setEditDocStage] = useState<ObraStatus>('Orçamento');
  const [editDocVersion, setEditDocVersion] = useState('v1.0');
  const [editDocStatus, setEditDocStatus] = useState<ObraDocument['status']>('Válido');
  const [editDocResponsible, setEditDocResponsible] = useState('');
  const [editDocValidity, setEditDocValidity] = useState('');
  const [docFilterCategory, setDocFilterCategory] = useState<string>('TODAS');
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [zipExportSuccessMessage, setZipExportSuccessMessage] = useState<string | null>(null);

  // Stage-by-Stage Checklist & Document Management States
  const [selectedStageInChecklist, setSelectedStageInChecklist] = useState<ObraStatus>('Orçamento');
  const [stageConfirmBanner, setStageConfirmBanner] = useState<{ stage: string; message: string } | null>(null);

  // New Checklist Item Form State
  const [showAddChecklistForm, setShowAddChecklistForm] = useState(false);
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [newChecklistCategory, setNewChecklistCategory] = useState<ProtocolChecklistItem['category']>('Técnico');

  // New Stage Document Upload Form State
  const [showUploadDocForm, setShowUploadDocForm] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocCategory, setNewDocCategory] = useState<ObraDocument['category']>('Projeto Elétrico');
  const [newDocVersion, setNewDocVersion] = useState('v1.0');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedFileSize, setSelectedFileSize] = useState('1.5 MB');

  // Gantt & Process Resumo State
  const [localGanttTasks, setLocalGanttTasks] = useState<Record<string, GanttTask[]>>({});
  const [ganttViewMode, setGanttViewMode] = useState<'table' | 'chart'>('table');
  const [showAddGanttForm, setShowAddGanttForm] = useState(false);
  const [newGanttTitle, setNewGanttTitle] = useState('');
  const [newGanttStartDate, setNewGanttStartDate] = useState('');
  const [newGanttEndDate, setNewGanttEndDate] = useState('');
  const [newGanttDuration, setNewGanttDuration] = useState<number>(3);

  // Sync selected stage when activeObraModal opens/changes
  useEffect(() => {
    if (activeObraModal) {
      setSelectedStageInChecklist(activeObraModal.status);
    }
  }, [activeObraModal?.id]);

  // New Obra Form State
  const [showNewModal, setShowNewModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newClientId, setNewClientId] = useState('');
  const [newClientCustomName, setNewClientCustomName] = useState('');
  const [newType, setNewType] = useState<ObraType>('Extensão RDU Urbana');
  const [newProjectNumber, setNewProjectNumber] = useState('');
  const [newConcessionaria, setNewConcessionaria] = useState<Concessionaria>('Energisa');
  const [newPowerKva, setNewPowerKva] = useState(150);
  const [newMunicipality, setNewMunicipality] = useState('Campinas');
  const [newTechResponsible, setNewTechResponsible] = useState('Engº Carlos Alberto Ramos');
  const [newArtNumber, setNewArtNumber] = useState('ART-SP-20260099881');
  const [newMaterialVal, setNewMaterialVal] = useState(120000);
  const [newLaborVal, setNewLaborVal] = useState(60000);
  const [newExpectedProfit, setNewExpectedProfit] = useState(45000);

  // Edit Obra Form State
  const [editingObra, setEditingObra] = useState<Obra | null>(null);
  const [editProjectName, setEditProjectName] = useState('');
  const [editProjectNumber, setEditProjectNumber] = useState('');
  const [editClientId, setEditClientId] = useState('');
  const [editType, setEditType] = useState<ObraType>('Extensão RDU Urbana');
  const [editConcessionaria, setEditConcessionaria] = useState<Concessionaria>('Energisa');
  const [editPowerKva, setEditPowerKva] = useState(150);
  const [editMunicipality, setEditMunicipality] = useState('Campinas');
  const [editState, setEditState] = useState('SP');
  const [editTechResponsible, setEditTechResponsible] = useState('');
  const [editArtNumber, setEditArtNumber] = useState('');
  const [editStatus, setEditStatus] = useState<ObraStatus>('Aprovada');
  const [editPercentageExecuted, setEditPercentageExecuted] = useState(10);
  const [editMaterialVal, setEditMaterialVal] = useState(0);
  const [editLaborVal, setEditLaborVal] = useState(0);
  const [editExpectedProfit, setEditExpectedProfit] = useState(0);
  const [editStartDate, setEditStartDate] = useState('');
  const [editExpectedEndDate, setEditExpectedEndDate] = useState('');

  // Delete Obra State
  const [deletingObra, setDeletingObra] = useState<Obra | null>(null);

  // New Expense Form State inside Modal
  const [showNewExpenseForm, setShowNewExpenseForm] = useState(false);
  const [expCategory, setExpCategory] = useState<any>('Combustível');
  const [expDesc, setExpDesc] = useState('');
  const [expVal, setExpVal] = useState(0);
  const [expVehicleId, setExpVehicleId] = useState('');
  const [expEmployeeId, setExpEmployeeId] = useState('');
  const [expSupplierName, setExpSupplierName] = useState('');

  // Edit & Delete Expense State
  const [editingExpense, setEditingExpense] = useState<ObraExpense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<ObraExpense | null>(null);

  const [editExpCategory, setEditExpCategory] = useState<any>('Combustível');
  const [editExpDesc, setEditExpDesc] = useState('');
  const [editExpVal, setEditExpVal] = useState<number>(0);
  const [editExpDate, setEditExpDate] = useState('');
  const [editExpResponsible, setEditExpResponsible] = useState('Gestor de Obras');
  const [editVehicleId, setEditVehicleId] = useState('');
  const [editEmployeeId, setEditEmployeeId] = useState('');
  const [editSupplierName, setEditSupplierName] = useState('');

  const defaultSuppliersList = Array.from(
    new Set([
      'Siemens Brasil',
      'WEG Equipamentos Elétricos',
      'Romagnole Postes & Eletrotecnia',
      'Prysmian Group (Cabos Elétricos)',
      'Schneider Electric Brasil',
      'ABB Eletrificação',
      'Induscon Materiais Elétricos',
      'Engenharia & Locações Ind.',
      ...clients.map((c) => c.name),
    ])
  );

  // Filtering
  const filteredObras = obras.filter((o) => {
    const matchesSearch =
      o.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.projectNumber && o.projectNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      o.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.artNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'TODOS' || o.status === selectedStatus;
    const matchesConc = selectedConcessionaria === 'TODAS' || o.concessionaria === selectedConcessionaria;
    return matchesSearch && matchesStatus && matchesConc;
  });

  const handleCreateObra = (e: React.FormEvent) => {
    e.preventDefault();
    const foundClient = clients.find((c) => c.id === newClientId);
    const clientId = foundClient ? foundClient.id : (newClientId || `CLI-${Date.now()}`);
    const clientName = foundClient ? foundClient.name : (newClientCustomName || 'Cliente Principal');
    const totalVal = newMaterialVal + newLaborVal + newExpectedProfit;

    const newObra: Obra = {
      id: `OBR-2026-00${obras.length + 1}`,
      code: `OBR-00${obras.length + 1}`,
      projectNumber: newProjectNumber || `PRJ-2026/00${obras.length + 1}`,
      clientId,
      clientName,
      projectName: newProjectName || 'Obra de Extensão de Rede Elétrica',
      powerKva: newPowerKva,
      type: newType,
      municipality: newMunicipality,
      state: 'SP',
      concessionaria: newConcessionaria,
      techResponsible: newTechResponsible,
      artNumber: newArtNumber,
      startDate: new Date().toISOString().split('T')[0],
      expectedEndDate: '2026-11-30',
      status: 'Aprovada',
      percentageExecuted: 10,
      materialValue: newMaterialVal,
      laborValue: newLaborVal,
      totalValue: totalVal,
      expectedProfit: newExpectedProfit,
      actualProfit: newExpectedProfit,
      lat: -22.9056,
      lng: -47.0608,
      protocolBlocked: true,
      missingProtocolItemsCount: 3,
      updatedAt: new Date().toISOString(),
    };

    onAddObra(newObra);
    setShowNewModal(false);
    setNewProjectName('');
    setNewProjectNumber('');
    setActiveObraModal(newObra);
  };

  const handleOpenEditModal = (obra: Obra) => {
    setEditingObra(obra);
    setEditProjectName(obra.projectName);
    setEditProjectNumber(obra.projectNumber || '');
    setEditClientId(obra.clientId);
    setEditType(obra.type);
    setEditConcessionaria(obra.concessionaria || 'Energisa');
    setEditPowerKva(obra.powerKva);
    setEditMunicipality(obra.municipality);
    setEditState(obra.state || 'SP');
    setEditTechResponsible(obra.techResponsible);
    setEditArtNumber(obra.artNumber);
    setEditStatus(obra.status);
    setEditPercentageExecuted(obra.percentageExecuted);
    setEditMaterialVal(obra.materialValue);
    setEditLaborVal(obra.laborValue);
    setEditExpectedProfit(obra.expectedProfit);
    setEditStartDate(obra.startDate || new Date().toISOString().split('T')[0]);
    setEditExpectedEndDate(obra.expectedEndDate || '2026-12-31');
  };

  const handleSaveEditObra = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingObra) return;

    const client = clients.find((c) => c.id === editClientId);
    const matVal = Number(editMaterialVal) || 0;
    const labVal = Number(editLaborVal) || 0;
    const expProfit = Number(editExpectedProfit) || 0;
    const totalVal = matVal + labVal + expProfit;

    const updatedObra: Obra = {
      ...editingObra,
      projectName: editProjectName,
      projectNumber: editProjectNumber,
      clientId: client ? client.id : editingObra.clientId,
      clientName: client ? client.name : editingObra.clientName,
      type: editType,
      concessionaria: editConcessionaria,
      powerKva: Number(editPowerKva) || 0,
      municipality: editMunicipality,
      state: editState || 'SP',
      techResponsible: editTechResponsible,
      artNumber: editArtNumber,
      status: editStatus,
      percentageExecuted: Number(editPercentageExecuted) || 0,
      materialValue: matVal,
      laborValue: labVal,
      totalValue: totalVal,
      expectedProfit: expProfit,
      startDate: editStartDate,
      expectedEndDate: editExpectedEndDate,
      updatedAt: new Date().toISOString(),
    };

    if (onUpdateObra) {
      onUpdateObra(updatedObra);
    } else {
      onUpdateObraStatus(updatedObra.id, updatedObra.status);
    }

    if (activeObraModal && activeObraModal.id === updatedObra.id) {
      setActiveObraModal(updatedObra);
    }

    setEditingObra(null);
  };

  const handleConfirmDeleteObra = () => {
    if (!deletingObra) return;
    if (onDeleteObra) {
      onDeleteObra(deletingObra.id);
    }
    if (activeObraModal && activeObraModal.id === deletingObra.id) {
      setActiveObraModal(null);
    }
    setDeletingObra(null);
  };

  const handleSaveExpense = () => {
    if (!activeObraModal || !expVal) return;

    let finalResp = 'Gestor de Obras';
    let descriptionText = expDesc;

    if (expCategory === 'Combustível' || expCategory === 'Veículos') {
      const veh = (vehicles || []).find((v) => v.id === expVehicleId);
      if (veh) {
        finalResp = `Motorista / Veículo ${veh.plate}`;
        if (!descriptionText) {
          descriptionText = `Abastecimento: ${veh.model} (${veh.plate})`;
        }
      }
    } else if (expCategory === 'Funcionários') {
      const emp = (employees || []).find((e) => e.id === expEmployeeId);
      if (emp) {
        finalResp = emp.name;
        if (!descriptionText) {
          descriptionText = `Diária / Pagamento: ${emp.name} (${emp.role})`;
        }
      }
    } else if (expCategory === 'Fornecedores') {
      if (expSupplierName) {
        finalResp = expSupplierName;
        if (!descriptionText) {
          descriptionText = `Compra / Serviço: ${expSupplierName}`;
        }
      }
    }

    const newExp: ObraExpense = {
      id: `EXP-${Date.now()}`,
      obraId: activeObraModal.id,
      category: expCategory,
      description: descriptionText || `Despesa de ${expCategory}`,
      value: Number(expVal) || 0,
      date: new Date().toISOString().split('T')[0],
      responsible: finalResp,
      status: 'Pendente',
      vehicleId: expVehicleId || undefined,
      employeeId: expEmployeeId || undefined,
      supplierName: expSupplierName || undefined,
    };
    onAddExpense(newExp);
    setShowNewExpenseForm(false);
    setExpDesc('');
    setExpVal(0);
    setExpVehicleId('');
    setExpEmployeeId('');
    setExpSupplierName('');
  };

  const handleOpenEditExpense = (exp: ObraExpense) => {
    setEditingExpense(exp);
    setEditExpCategory(exp.category);
    setEditExpDesc(exp.description);
    setEditExpVal(exp.value);
    setEditExpDate(exp.date || new Date().toISOString().split('T')[0]);
    setEditExpResponsible(exp.responsible || 'Gestor de Obras');
    setEditVehicleId(exp.vehicleId || '');
    setEditEmployeeId(exp.employeeId || '');
    setEditSupplierName(exp.supplierName || '');
  };

  const handleSaveEditExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense || !editExpVal) return;

    let finalResp = editExpResponsible || 'Gestor de Obras';

    if (editExpCategory === 'Combustível' || editExpCategory === 'Veículos') {
      const veh = (vehicles || []).find((v) => v.id === editVehicleId);
      if (veh) {
        finalResp = `Motorista / Veículo ${veh.plate}`;
      }
    } else if (editExpCategory === 'Funcionários') {
      const emp = (employees || []).find((e) => e.id === editEmployeeId);
      if (emp) {
        finalResp = emp.name;
      }
    } else if (editExpCategory === 'Fornecedores') {
      if (editSupplierName) {
        finalResp = editSupplierName;
      }
    }

    const updated: ObraExpense = {
      ...editingExpense,
      category: editExpCategory,
      description: editExpDesc || `Despesa de ${editExpCategory}`,
      value: Number(editExpVal) || 0,
      date: editExpDate || new Date().toISOString().split('T')[0],
      responsible: finalResp,
      vehicleId: editVehicleId || undefined,
      employeeId: editEmployeeId || undefined,
      supplierName: editSupplierName || undefined,
    };
    if (onUpdateExpense) {
      onUpdateExpense(updated);
    }
    setEditingExpense(null);
  };

  const handleConfirmDeleteExpense = () => {
    if (!deletingExpense) return;
    if (onDeleteExpense) {
      onDeleteExpense(deletingExpense.id);
    }
    setDeletingExpense(null);
  };

  const handleConfirmStageCompletion = (stage: ObraStatus) => {
    if (!activeObraModal) return;
    const stageIndex = OBRA_PHASES.indexOf(stage);
    const nextStage = OBRA_PHASES[stageIndex + 1] || stage;
    const calculatedPercent = Math.min(100, Math.round(((stageIndex + 1) / OBRA_PHASES.length) * 100));

    const updatedObra: Obra = {
      ...activeObraModal,
      status: nextStage,
      percentageExecuted: Math.max(activeObraModal.percentageExecuted, calculatedPercent),
      updatedAt: new Date().toISOString(),
    };

    if (onUpdateObra) {
      onUpdateObra(updatedObra);
    }
    onUpdateObraStatus(activeObraModal.id, nextStage);
    setActiveObraModal(updatedObra);

    setStageConfirmBanner({
      stage,
      message: `Etapa "${stage}" confirmada com sucesso! Progresso da obra atualizado para ${calculatedPercent}%. Status avançou para "${nextStage}".`,
    });

    setTimeout(() => {
      setStageConfirmBanner(null);
    }, 5000);
  };

  const handleAddChecklistToStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeObraModal || !newChecklistTitle.trim()) return;
    const newItem: ProtocolChecklistItem = {
      id: `CHK-${Date.now()}`,
      obraId: activeObraModal.id,
      title: newChecklistTitle.trim(),
      category: newChecklistCategory,
      required: true,
      status: 'Pendente',
      updatedAt: new Date().toISOString(),
      stage: selectedStageInChecklist,
    };
    if (onAddChecklistItem) {
      onAddChecklistItem(newItem);
    }
    setNewChecklistTitle('');
    setShowAddChecklistForm(false);
  };

  const handleUploadDocToStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeObraModal || !newDocName.trim()) return;
    const newDoc: ObraDocument = {
      id: `DOC-${Date.now()}`,
      obraId: activeObraModal.id,
      name: newDocName.trim(),
      category: newDocCategory,
      version: newDocVersion.trim() || 'v1.0',
      status: 'Válido',
      responsible: activeObraModal.techResponsible || 'Engenharia VoltGrid',
      fileName: selectedFileName || `${newDocName.toLowerCase().replace(/\s+/g, '_')}.pdf`,
      fileSize: selectedFileSize || '1.5 MB',
      createdAt: new Date().toISOString().split('T')[0],
      stage: selectedStageInChecklist,
    };
    if (onAddDocument) {
      onAddDocument(newDoc);
    }
    setNewDocName('');
    setSelectedFileName('');
    setShowUploadDocForm(false);
  };

  const getStageChecklistItems = (obraId: string, stage: ObraStatus) => {
    const existing = checklists.filter((c) => c.obraId === obraId && c.stage === stage);
    if (existing.length > 0) return existing;

    const defaults = DEFAULT_STAGE_CHECKLISTS[stage] || [];
    return defaults.map((def, idx) => ({
      id: `DEF-${obraId}-${stage}-${idx}`,
      obraId,
      title: def.title,
      category: def.category,
      required: def.required,
      status: 'Pendente' as const,
      updatedAt: new Date().toISOString(),
      stage,
    }));
  };

  const getStageDocuments = (obraId: string, stage: ObraStatus) => {
    return documents.filter((d) => d.obraId === obraId && d.stage === stage);
  };

  const formatDateShort = (dateStr: string) => {
    if (!dateStr) return '--';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}`;
    }
    return dateStr;
  };

  const getObraGanttTasks = (obra: Obra): GanttTask[] => {
    if (localGanttTasks[obra.id]) {
      return localGanttTasks[obra.id];
    }

    const existing = ganttTasks.filter((t) => t.obraId === obra.id);
    if (existing.length > 0) {
      return existing.map((t) => ({
        ...t,
        completed: t.progress === 100 || t.completed === true,
      }));
    }

    let baseDate = new Date(obra.startDate || '2026-08-01');
    if (isNaN(baseDate.getTime())) baseDate = new Date('2026-08-01');

    const currentPhaseIdx = OBRA_PHASES.indexOf(obra.status);

    const generated: GanttTask[] = DEFAULT_OBRA_PROCESS_TEMPLATES.map((tmpl, idx) => {
      const startDateStr = baseDate.toISOString().split('T')[0];
      baseDate.setDate(baseDate.getDate() + tmpl.duration);
      const endDateStr = baseDate.toISOString().split('T')[0];

      const tmplPhaseIdx = OBRA_PHASES.indexOf(tmpl.phase);
      const isCompleted = tmplPhaseIdx <= currentPhaseIdx;

      return {
        id: `GT-${obra.id}-${idx + 1}`,
        obraId: obra.id,
        title: tmpl.title,
        phase: tmpl.phase,
        startDate: startDateStr,
        endDate: endDateStr,
        durationDays: tmpl.duration,
        progress: isCompleted ? 100 : tmplPhaseIdx === currentPhaseIdx ? 50 : 0,
        dependencies: [],
        delayAlert: false,
        completed: isCompleted,
      };
    });

    return generated;
  };

  const handleToggleGanttTask = (obraId: string, taskId: string) => {
    const currentTasks = activeObraModal ? getObraGanttTasks(activeObraModal) : [];
    const updated = currentTasks.map((t) => {
      if (t.id === taskId) {
        const nextCompleted = !t.completed;
        return {
          ...t,
          completed: nextCompleted,
          progress: nextCompleted ? 100 : 0,
        };
      }
      return t;
    });

    setLocalGanttTasks((prev) => ({
      ...prev,
      [obraId]: updated,
    }));
  };

  const handleAddGanttTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeObraModal || !newGanttTitle.trim()) return;

    const currentTasks = getObraGanttTasks(activeObraModal);
    const newTask: GanttTask = {
      id: `GT-${activeObraModal.id}-${Date.now()}`,
      obraId: activeObraModal.id,
      title: newGanttTitle.trim(),
      phase: activeObraModal.status,
      startDate: newGanttStartDate || new Date().toISOString().split('T')[0],
      endDate: newGanttEndDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      durationDays: Number(newGanttDuration) || 3,
      progress: 0,
      dependencies: [],
      delayAlert: false,
      completed: false,
    };

    setLocalGanttTasks((prev) => ({
      ...prev,
      [activeObraModal.id]: [...currentTasks, newTask],
    }));

    setNewGanttTitle('');
    setNewGanttStartDate('');
    setNewGanttEndDate('');
    setShowAddGanttForm(false);
  };

  const getAllObraDocuments = (obra: Obra): ObraDocument[] => {
    if (localObraDocuments[obra.id]) {
      return localObraDocuments[obra.id];
    }

    return documents.filter((d) => d.obraId === obra.id);
  };

  const handleOpenEditDoc = (doc: ObraDocument) => {
    setEditingDoc(doc);
    setEditDocName(doc.name);
    setEditDocCategory(doc.category);
    setEditDocStage(doc.stage || 'Projeto');
    setEditDocVersion(doc.version || 'v1.0');
    setEditDocStatus(doc.status || 'Válido');
    setEditDocResponsible(doc.responsible || '');
    setEditDocValidity(doc.validityDate || '');
  };

  const handleSaveEditDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc || !activeObraModal) return;

    const updatedDoc: ObraDocument = {
      ...editingDoc,
      name: editDocName.trim() || editingDoc.name,
      category: editDocCategory,
      stage: editDocStage,
      version: editDocVersion.trim() || 'v1.0',
      status: editDocStatus,
      responsible: editDocResponsible.trim() || editingDoc.responsible,
      validityDate: editDocValidity || undefined,
    };

    if (onUpdateDocument) {
      onUpdateDocument(updatedDoc);
    }

    const currentDocs = getAllObraDocuments(activeObraModal);
    const updatedList = currentDocs.map((d) => (d.id === updatedDoc.id ? updatedDoc : d));

    setLocalObraDocuments((prev) => ({
      ...prev,
      [activeObraModal.id]: updatedList,
    }));

    setEditingDoc(null);
  };

  const handleDeleteDoc = (docId: string) => {
    if (!activeObraModal) return;
    if (onDeleteDocument) {
      onDeleteDocument(docId);
    }

    const currentDocs = getAllObraDocuments(activeObraModal);
    const updatedList = currentDocs.filter((d) => d.id !== docId);

    setLocalObraDocuments((prev) => ({
      ...prev,
      [activeObraModal.id]: updatedList,
    }));
  };

  const handleExportAllDocumentsZip = async (obra: Obra) => {
    setIsExportingZip(true);
    setZipExportSuccessMessage(null);

    try {
      const zip = new JSZip();
      const docs = getAllObraDocuments(obra);

      const folderProjetos = zip.folder('01_Projetos_e_ART');
      const folderLaudos = zip.folder('02_Laudos_e_Vistorias');
      const folderNFs = zip.folder('03_Notas_Fiscais');
      const folderContratos = zip.folder('04_Contratos_e_Procuracoes');
      const folderOutros = zip.folder('05_Outros_Documentos');

      const manifestContent = `================================================
Dossie Digital de Obra Eletrica - VoltGrid ERP
================================================
Codigo da Obra: ${obra.code}
Projeto: ${obra.projectName}
Cliente: ${obra.clientName}
Responsavel Tecnico: ${obra.techResponsible} (ART: ${obra.artNumber})
Concessionaria: ${obra.concessionaria}
Potencia: ${obra.powerKva} kVA
Status Atual: ${obra.status}
Data de Exportacao: ${new Date().toLocaleString('pt-BR')}
Total de Documentos: ${docs.length}
================================================
Relação de Documentos Inclusos na Pasta ZIP:
${docs.map((d, i) => `${i + 1}. [${d.category}] ${d.name} (${d.fileName}) - Versao ${d.version}`).join('\n')}
`;
      zip.file('00_MANIFESTO_E_RELACAO_DE_DOCUMENTOS.txt', manifestContent);

      docs.forEach((doc) => {
        let targetFolder = folderOutros;
        if (doc.category === 'Projeto Elétrico' || doc.category === 'ART' || doc.category === 'Memorial Descritivo') {
          targetFolder = folderProjetos;
        } else if (doc.category === 'Laudo Transformador' || doc.category === 'Licença Ambiental') {
          targetFolder = folderLaudos;
        } else if (doc.category === 'Nota Fiscal') {
          targetFolder = folderNFs;
        } else if (doc.category === 'Contrato' || doc.category === 'Procuração') {
          targetFolder = folderContratos;
        }

        const sampleDocContent = `%PDF-1.5 / DWG Document Spec
% VoltGrid ERP - Documento Homologado
% ID: ${doc.id}
% Nome: ${doc.name}
% Categoria: ${doc.category}
% Etapa: ${doc.stage || 'Geral'}
% Responsável: ${doc.responsible}
% Data de Registro: ${doc.createdAt}
`;
        targetFolder?.file(doc.fileName || `${doc.name.replace(/\s+/g, '_')}.pdf`, sampleDocContent);
      });

      const content = await zip.generateAsync({ type: 'blob' });
      const safeProjectName = obra.projectName.replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `Dossie_Obra_${obra.code}_${safeProjectName}.zip`;

      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setZipExportSuccessMessage(`Pasta ZIP "${filename}" gerada com sucesso contendo todos os ${docs.length} documentos da obra!`);
      setTimeout(() => setZipExportSuccessMessage(null), 6000);
    } catch (err) {
      console.error('Error generating ZIP:', err);
      alert('Ocorreu um erro ao gerar o arquivo ZIP dos documentos.');
    } finally {
      setIsExportingZip(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-base font-semibold text-zinc-100 flex items-center space-x-2 font-mono">
            <HardHat className="w-5 h-5 text-blue-500" />
            <span>Módulo de Obras de Distribuição de Energia (RDU/RDR)</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Controle de etapas, subestações, ordens de serviço, diários de obra e protocolo concessionária.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center space-x-2 shadow-sm transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nova Obra Elétrica</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar por código, projeto, cliente ou ART..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-sans"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto text-xs">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 font-medium focus:outline-none focus:border-blue-500"
          >
            <option value="TODOS">Todos os Status</option>
            {OBRA_PHASES.map((phase) => (
              <option key={phase} value={phase}>
                {phase}
              </option>
            ))}
          </select>

          <select
            value={selectedConcessionaria}
            onChange={(e) => setSelectedConcessionaria(e.target.value)}
            className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 font-medium focus:outline-none focus:border-blue-500"
          >
            <option value="TODAS">Todas Concessionárias</option>
            <option value="CPFL Paulista">CPFL Paulista</option>
            <option value="Enel SP">Enel SP</option>
            <option value="Cemig">Cemig</option>
            <option value="Copel">Copel</option>
          </select>
        </div>
      </div>

      {/* Obras Grid */}
      {filteredObras.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 my-4">
          <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
            <HardHat className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-zinc-100">Nenhuma Obra Encontrada</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Não há obras cadastradas ou que correspondam aos filtros selecionados. Clique no botão abaixo para cadastrar sua primeira obra e acompanhar todos os custos e lucros em tempo real.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition-all inline-flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Nova Obra</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredObras.map((obra) => {
            const fin = calculateObraFinancials(obra, expenses, fuelLogs, financials, movements);
            return (
              <div
                key={obra.id}
                onClick={() => setActiveObraModal(obra)}
                className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm space-y-4 hover:border-zinc-700 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] text-blue-400 font-bold">
                      {obra.projectNumber || obra.code}
                    </span>
                    <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-blue-400 transition-colors mt-0.5">
                      {obra.projectName}
                    </h3>
                    <p className="text-xs text-zinc-400">{obra.clientName}</p>
                  </div>

                  <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                      {obra.powerKva} kVA
                    </span>
                    <button
                      type="button"
                      title="Editar Obra"
                      onClick={() => handleOpenEditModal(obra)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-blue-600 text-zinc-400 hover:text-white transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Excluir Obra"
                      onClick={() => setDeletingObra(obra)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-600 text-zinc-400 hover:text-white transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress & Specs */}
                <div className="space-y-2 bg-zinc-950 p-3.5 rounded-xl border border-zinc-800/80 text-xs">
                  <div className="flex items-center justify-between text-zinc-300 font-mono text-[11px]">
                    <span>Etapa Atual:</span>
                    <span className="font-bold text-blue-400">{obra.status}</span>
                  </div>

                  <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full transition-all"
                      style={{ width: `${obra.percentageExecuted}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono pt-1">
                    <span>{obra.concessionaria} • {obra.municipality}</span>
                    <span>{obra.percentageExecuted}% Concluído</span>
                  </div>

                  {fin.contractValue > 0 && ((fin.totalCostsSpent / fin.contractValue) * 100) > 85 && (
                    <div className="mt-2 p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-[10px] font-bold flex items-center justify-between animate-pulse">
                      <span>⚠️ ALERTA DE ORÇAMENTO ESTOURANDO</span>
                      <span>{(((fin.totalCostsSpent / fin.contractValue) * 100)).toFixed(0)}% GASTO</span>
                    </div>
                  )}
                </div>

                {/* Dynamic Financial Summary Footer */}
                <div className="pt-2 border-t border-zinc-800 space-y-2 text-xs font-mono">
                  <div className="grid grid-cols-3 gap-2 text-center bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-800/60">
                    <div>
                      <span className="text-zinc-500 text-[10px] block font-sans">Valor da Obra</span>
                      <span className="font-bold text-zinc-100 text-[11px]">
                        R$ {fin.contractValue.toLocaleString('pt-BR')}
                      </span>
                    </div>

                    <div>
                      <span className="text-zinc-500 text-[10px] block font-sans">Total Gasto</span>
                      <span className="font-bold text-amber-400 text-[11px]">
                        R$ {fin.totalCostsSpent.toLocaleString('pt-BR')}
                      </span>
                    </div>

                    <div>
                      <span className="text-zinc-500 text-[10px] block font-sans">Lucro Real</span>
                      <span className={`font-bold text-[11px] ${fin.calculatedProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        R$ {fin.calculatedProfit.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Obra Detailed Drawer Modal */}
      {activeObraModal && (
        <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-5xl rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-base font-bold text-zinc-100">{activeObraModal.code}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 font-sans">
                    {activeObraModal.type}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 font-sans">
                    {activeObraModal.status}
                  </span>
                </div>
                <h2 className="text-xs font-medium text-zinc-400 mt-1">{activeObraModal.projectName}</h2>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(activeObraModal)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600 hover:text-white transition-all text-xs font-semibold flex items-center space-x-1.5"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Editar Obra</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingObra(activeObraModal)}
                  className="px-3 py-1.5 rounded-lg bg-rose-600/20 text-rose-400 border border-rose-500/30 hover:bg-rose-600 hover:text-white transition-all text-xs font-semibold flex items-center space-x-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveObraModal(null)}
                  className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 transition-colors ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex items-center space-x-1 p-2 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 overflow-x-auto text-xs font-bold">
              {[
                { id: 'geral', label: 'Visão Geral & Dados' },
                { id: 'fases', label: 'Checklist & Protocolo' },
                { id: 'docs', label: 'Documentos' },
                { id: 'custos', label: 'Lançador de Custos' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setDetailTab(tab.id as any)}
                  className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all ${
                    detailTab === tab.id
                      ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Content Area */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* TAB 1: GERAL */}
              {detailTab === 'geral' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Cliente & Local</span>
                      <p className="font-bold text-slate-900 dark:text-white text-xs">{activeObraModal.clientName}</p>
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                        {activeObraModal.municipality} / {activeObraModal.state} ({activeObraModal.concessionaria})
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Responsável Técnico & ART</span>
                      <p className="font-bold text-slate-900 dark:text-white text-xs">{activeObraModal.techResponsible}</p>
                      <p className="text-xs font-mono text-slate-500">{activeObraModal.artNumber}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Datas & Potência</span>
                      <p className="font-bold text-slate-900 dark:text-white text-xs">{activeObraModal.powerKva} kVA Instalados</p>
                      <p className="text-xs text-slate-500">
                        Início: {activeObraModal.startDate} • Fim: {activeObraModal.expectedEndDate}
                      </p>
                    </div>
                  </div>

                  {/* Financial Metrics Box */}
                  {(() => {
                    const fin = calculateObraFinancials(activeObraModal, expenses, fuelLogs, financials, movements);
                    return (
                      <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 text-white space-y-4">
                        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
                          <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider font-mono">
                            Resumo Financeiro & Lucro Calculado Automático
                          </h3>
                          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                            Margem Real: {fin.profitMarginPercent.toFixed(1)}%
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                          <div>
                            <span className="text-zinc-400 text-[10px] block font-sans">Valor Contratual</span>
                            <span className="font-bold text-zinc-100 text-sm">
                              R$ {fin.contractValue.toLocaleString('pt-BR')}
                            </span>
                          </div>

                          <div>
                            <span className="text-zinc-400 text-[10px] block font-sans">Total de Custos Gasto</span>
                            <span className="font-bold text-amber-400 text-sm">
                              R$ {fin.totalCostsSpent.toLocaleString('pt-BR')}
                            </span>
                          </div>

                          <div>
                            <span className="text-zinc-400 text-[10px] block font-sans">Lucro Orçado Inicial</span>
                            <span className="font-bold text-zinc-300 text-sm">
                              R$ {activeObraModal.expectedProfit.toLocaleString('pt-BR')}
                            </span>
                          </div>

                          <div>
                            <span className="text-zinc-400 text-[10px] block font-sans">Lucro Real Calculado</span>
                            <span className={`font-bold text-sm ${fin.calculatedProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              R$ {fin.calculatedProfit.toLocaleString('pt-BR')}
                            </span>
                          </div>
                        </div>

                        {/* Detailed Cost Breakdown subpanel */}
                        <div className="pt-3 border-t border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-zinc-400 font-mono">
                          <div>Despesas Diretas: <span className="text-zinc-200 font-semibold">R$ {fin.directExpensesSum.toLocaleString('pt-BR')}</span></div>
                          <div>Combustível & Frota: <span className="text-zinc-200 font-semibold">R$ {fin.fuelCostsSum.toLocaleString('pt-BR')}</span></div>
                          <div>Contas a Pagar: <span className="text-zinc-200 font-semibold">R$ {fin.financialPayableSum.toLocaleString('pt-BR')}</span></div>
                          <div>Saídas Estoque: <span className="text-zinc-200 font-semibold">R$ {fin.stockExitsSum.toLocaleString('pt-BR')}</span></div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* TAB 2: FASES & PROTOCOLO CHECKLIST */}
              {detailTab === 'fases' && (
                <div className="space-y-6">
                  {/* Banner Notification for Stage Confirmation */}
                  {stageConfirmBanner && (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-between shadow-lg animate-pulse">
                      <div className="flex items-center space-x-2.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        <span>{stageConfirmBanner.message}</span>
                      </div>
                      <button
                        onClick={() => setStageConfirmBanner(null)}
                        className="p-1 hover:bg-emerald-500/20 rounded-lg text-emerald-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Stage Pipeline Tabs Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono flex items-center space-x-2">
                        <Layers className="w-4 h-4 text-blue-400" />
                        <span>Pipeline de Etapas da Obra</span>
                      </h3>
                      <span className="text-[11px] font-mono text-zinc-400">
                        Etapa Atual: <strong className="text-blue-400 font-bold">{activeObraModal.status}</strong> ({activeObraModal.percentageExecuted}% Concluído)
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                      {OBRA_PHASES.map((phase, pIdx) => {
                        const currentStatusIdx = OBRA_PHASES.indexOf(activeObraModal.status);
                        const isCompleted = pIdx < currentStatusIdx;
                        const isCurrentStatus = phase === activeObraModal.status;
                        const isSelectedStage = phase === selectedStageInChecklist;

                        return (
                          <button
                            key={phase}
                            onClick={() => setSelectedStageInChecklist(phase)}
                            className={`p-3 rounded-xl border text-left text-xs font-medium transition-all relative overflow-hidden flex flex-col justify-between space-y-1.5 ${
                              isSelectedStage
                                ? 'bg-blue-600/20 border-blue-500 text-white shadow-md ring-2 ring-blue-500/50'
                                : isCurrentStatus
                                ? 'bg-amber-500/10 border-amber-500/50 text-amber-300 hover:border-amber-500'
                                : isCompleted
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:border-emerald-500/60'
                                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="font-mono text-[10px] opacity-60">0{pIdx + 1}</span>
                              {isCompleted && (
                                <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                  ✓ Concluída
                                </span>
                              )}
                              {isCurrentStatus && (
                                <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse">
                                  ● Em Andamento
                                </span>
                              )}
                              {!isCompleted && !isCurrentStatus && (
                                <span className="text-[9px] text-zinc-500">○ Pendente</span>
                              )}
                            </div>
                            <span className="font-semibold text-xs truncate block">{phase}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active Stage Management Section */}
                  {(() => {
                    const stageItems = getStageChecklistItems(activeObraModal.id, selectedStageInChecklist);
                    const stageDocs = getStageDocuments(activeObraModal.id, selectedStageInChecklist);
                    const approvedCount = stageItems.filter((i) => i.status === 'Aprovado').length;
                    const totalCount = stageItems.length;
                    const percentApproved = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;
                    const currentStatusIdx = OBRA_PHASES.indexOf(activeObraModal.status);
                    const stageIdx = OBRA_PHASES.indexOf(selectedStageInChecklist);
                    const isStageCompleted = stageIdx < currentStatusIdx;

                    return (
                      <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-6">
                        {/* Selected Stage Header & Confirmation Button */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                          <div>
                            <div className="flex items-center space-x-2">
                              <h2 className="text-base font-bold text-zinc-100 font-mono flex items-center space-x-2">
                                <Sparkles className="w-5 h-5 text-amber-400" />
                                <span>Etapa: {selectedStageInChecklist}</span>
                              </h2>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                                  isStageCompleted
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : stageIdx === currentStatusIdx
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    : 'bg-zinc-800 text-zinc-400'
                                }`}
                              >
                                {isStageCompleted ? '✓ Etapa Concluída' : stageIdx === currentStatusIdx ? '● Em Andamento' : '○ Planejada'}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-400 mt-1">
                              Gerencie o checklist técnico obrigatório e anexe a documentação referente à etapa <strong className="text-zinc-200">{selectedStageInChecklist}</strong>.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleConfirmStageCompletion(selectedStageInChecklist)}
                            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950 transition-all flex items-center space-x-2 self-start md:self-auto cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                            <span>Confirmar Conclusão da Etapa ({selectedStageInChecklist})</span>
                          </button>
                        </div>

                        {/* Two Columns: Checklist & File Attachments */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Column 1: Checklist da Etapa */}
                          <div className="space-y-4 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80">
                            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                              <div>
                                <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center space-x-2 font-mono">
                                  <CheckSquare className="w-4 h-4 text-blue-400" />
                                  <span>Checklist da Etapa ({approvedCount}/{totalCount})</span>
                                </h4>
                                <div className="w-44 bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                                  <div
                                    className="bg-emerald-500 h-full rounded-full transition-all"
                                    style={{ width: `${percentApproved}%` }}
                                  ></div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => setShowAddChecklistForm(!showAddChecklistForm)}
                                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-blue-400 hover:text-white font-semibold text-xs flex items-center space-x-1 transition-all"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Item ao Checklist</span>
                              </button>
                            </div>

                            {/* Inline Form to Add Checklist Item */}
                            {showAddChecklistForm && (
                              <form onSubmit={handleAddChecklistToStage} className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3 text-xs">
                                <span className="font-semibold text-zinc-200 block font-mono">Novo Item no Checklist ({selectedStageInChecklist})</span>
                                <input
                                  type="text"
                                  required
                                  placeholder="Ex: Diagrama Unifilar Aprovado / Laudo de Ensaio..."
                                  value={newChecklistTitle}
                                  onChange={(e) => setNewChecklistTitle(e.target.value)}
                                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-blue-500"
                                />
                                <div className="flex items-center justify-between gap-2">
                                  <select
                                    value={newChecklistCategory}
                                    onChange={(e) => setNewChecklistCategory(e.target.value as any)}
                                    className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs"
                                  >
                                    <option value="Técnico">Técnico</option>
                                    <option value="Legal">Legal</option>
                                    <option value="Nota Fiscal">Nota Fiscal</option>
                                    <option value="Laudo">Laudo</option>
                                    <option value="Cliente">Cliente</option>
                                  </select>

                                  <div className="flex items-center space-x-2">
                                    <button
                                      type="button"
                                      onClick={() => setShowAddChecklistForm(false)}
                                      className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 text-xs"
                                    >
                                      Cancelar
                                    </button>
                                    <button
                                      type="submit"
                                      className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs"
                                    >
                                      Salvar Item
                                    </button>
                                  </div>
                                </div>
                              </form>
                            )}

                            {/* Checklist Items List */}
                            <div className="space-y-2">
                              {stageItems.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs hover:border-zinc-700 transition-all"
                                >
                                  <div className="flex items-center space-x-3">
                                    <button
                                      type="button"
                                      onClick={() => onToggleChecklist(item.id)}
                                      className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                                        item.status === 'Aprovado'
                                          ? 'bg-emerald-500 border-emerald-500 text-white'
                                          : 'border-zinc-700 hover:border-blue-500 text-transparent'
                                      }`}
                                    >
                                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    </button>
                                    <div>
                                      <p className={`font-semibold ${item.status === 'Aprovado' ? 'text-zinc-300 line-through' : 'text-zinc-100'}`}>
                                        {item.title}
                                      </p>
                                      <span className="text-[10px] text-zinc-500 font-mono">{item.category}</span>
                                    </div>
                                  </div>

                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                                      item.status === 'Aprovado'
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    }`}
                                  >
                                    {item.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Column 2: Arquivos & Documentos da Etapa */}
                          <div className="space-y-4 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80">
                            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                              <div>
                                <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center space-x-2 font-mono">
                                  <Paperclip className="w-4 h-4 text-amber-400" />
                                  <span>Arquivos & Documentos da Etapa ({stageDocs.length})</span>
                                </h4>
                                <p className="text-[11px] text-zinc-400 mt-0.5">Anexos e comprovantes desta fase</p>
                              </div>

                              <button
                                type="button"
                                onClick={() => setShowUploadDocForm(!showUploadDocForm)}
                                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center space-x-1 shadow-sm transition-all"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                <span>Anexar Arquivo</span>
                              </button>
                            </div>

                            {/* Inline Form to Upload/Attach Document to Stage */}
                            {showUploadDocForm && (
                              <form onSubmit={handleUploadDocToStage} className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3 text-xs">
                                <span className="font-semibold text-zinc-200 block font-mono">Anexar Documento para Etapa ({selectedStageInChecklist})</span>
                                
                                <input
                                  type="text"
                                  required
                                  placeholder="Nome do Documento / Descrição..."
                                  value={newDocName}
                                  onChange={(e) => setNewDocName(e.target.value)}
                                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-blue-500"
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <select
                                    value={newDocCategory}
                                    onChange={(e) => setNewDocCategory(e.target.value as any)}
                                    className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs"
                                  >
                                    <option value="Projeto Elétrico">Projeto Elétrico</option>
                                    <option value="ART">ART</option>
                                    <option value="Memorial Descritivo">Memorial Descritivo</option>
                                    <option value="Contrato">Contrato</option>
                                    <option value="Laudo Transformador">Laudo Transformador</option>
                                    <option value="Nota Fiscal">Nota Fiscal</option>
                                    <option value="Licença Ambiental">Licença Ambiental</option>
                                    <option value="Procuração">Procuração</option>
                                    <option value="Outros">Outros</option>
                                  </select>

                                  <input
                                    type="text"
                                    placeholder="Versão (Ex: v1.0)"
                                    value={newDocVersion}
                                    onChange={(e) => setNewDocVersion(e.target.value)}
                                    className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs font-mono"
                                  />
                                </div>

                                {/* File Picker Input */}
                                <div className="p-3 rounded-lg border border-dashed border-zinc-700 bg-zinc-900 text-center space-y-1">
                                  <input
                                    type="file"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        setSelectedFileName(file.name);
                                        setSelectedFileSize(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);
                                        if (!newDocName) setNewDocName(file.name.replace(/\.[^/.]+$/, ""));
                                      }
                                    }}
                                    className="hidden"
                                    id="stage-file-upload-input"
                                  />
                                  <label
                                    htmlFor="stage-file-upload-input"
                                    className="cursor-pointer text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center space-x-1.5"
                                  >
                                    <Paperclip className="w-3.5 h-3.5" />
                                    <span>{selectedFileName ? selectedFileName : 'Clique aqui para selecionar arquivo no computador'}</span>
                                  </label>
                                  {selectedFileName && (
                                    <p className="text-[10px] text-zinc-500 font-mono">Tamanho: {selectedFileSize}</p>
                                  )}
                                </div>

                                <div className="flex items-center justify-end space-x-2 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => setShowUploadDocForm(false)}
                                    className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 text-xs"
                                  >
                                    Cancelar
                                  </button>
                                  <button
                                    type="submit"
                                    className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs shadow-md"
                                  >
                                    Confirmar Anexo
                                  </button>
                                </div>
                              </form>
                            )}

                            {/* Documents List */}
                            {stageDocs.length === 0 ? (
                              <div className="p-6 text-center rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-2">
                                <FileText className="w-8 h-8 text-zinc-600 mx-auto" />
                                <p className="text-xs text-zinc-400">Nenhum arquivo anexado para a etapa <strong className="text-zinc-200">{selectedStageInChecklist}</strong>.</p>
                                <button
                                  type="button"
                                  onClick={() => setShowUploadDocForm(true)}
                                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs inline-flex items-center space-x-1"
                                >
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>Anexar Primeiro Arquivo</span>
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {stageDocs.map((doc) => (
                                  <div
                                    key={doc.id}
                                    className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs hover:border-zinc-700 transition-all"
                                  >
                                    <div className="flex items-center space-x-3">
                                      <FileText className="w-5 h-5 text-amber-400 shrink-0" />
                                      <div>
                                        <p className="font-semibold text-zinc-100">{doc.name}</p>
                                        <div className="flex items-center space-x-2 text-[10px] text-zinc-400 font-mono">
                                          <span>{doc.fileName}</span>
                                          <span>•</span>
                                          <span>{doc.fileSize}</span>
                                          <span>•</span>
                                          <span>{doc.createdAt}</span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[10px] font-mono border border-emerald-500/20">
                                        {doc.status}
                                      </span>
                                      <button
                                        type="button"
                                        title="Baixar / Visualizar Arquivo"
                                        onClick={() => alert(`Download simulado do documento "${doc.name}" (${doc.fileName})`)}
                                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-blue-600 text-zinc-400 hover:text-white transition-colors"
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}



              {/* TAB 4: REPOSITÓRIO CENTRAL DE DOCUMENTOS & EXPORTAÇÃO ZIP */}
              {detailTab === 'docs' && (
                <div className="space-y-6">
                  {(() => {
                    const allDocs = getAllObraDocuments(activeObraModal);
                    const filteredDocs = docFilterCategory === 'TODAS'
                      ? allDocs
                      : allDocs.filter((d) => d.category === docFilterCategory);

                    return (
                      <div className="space-y-6">
                        {/* Zip Banner Notification */}
                        {zipExportSuccessMessage && (
                          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-between shadow-lg animate-pulse">
                            <div className="flex items-center space-x-2.5">
                              <Package className="w-5 h-5 text-emerald-400 shrink-0" />
                              <span>{zipExportSuccessMessage}</span>
                            </div>
                            <button
                              onClick={() => setZipExportSuccessMessage(null)}
                              className="p-1 hover:bg-emerald-500/20 rounded-lg text-emerald-400"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        {/* Top Header & Export Controls */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-950 border border-zinc-800">
                          <div>
                            <h3 className="text-sm font-bold text-zinc-100 font-mono flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-amber-400" />
                              <span>Dossiê Digital & Repositório da Obra ({allDocs.length} Arquivos)</span>
                            </h3>
                            <p className="text-xs text-zinc-400 mt-1">
                              Todos os arquivos inseridos na obra organizados por especificação técnica, etapa e categoria.
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              disabled={isExportingZip || allDocs.length === 0}
                              onClick={() => handleExportAllDocumentsZip(activeObraModal)}
                              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-black text-xs shadow-lg shadow-amber-950 transition-all flex items-center space-x-2 cursor-pointer"
                            >
                              {isExportingZip ? (
                                <>
                                  <Package className="w-4 h-4 animate-spin" />
                                  <span>Gerando Pasta ZIP...</span>
                                </>
                              ) : (
                                <>
                                  <FolderDown className="w-4 h-4 stroke-[2.5]" />
                                  <span>Exportar Dossiê Completo (ZIP)</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => setShowUploadDocForm(!showUploadDocForm)}
                              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
                            >
                              <Upload className="w-4 h-4" />
                              <span>Anexar Novo Documento</span>
                            </button>
                          </div>
                        </div>

                        {/* Form to Upload New Document to Obra */}
                        {showUploadDocForm && (
                          <form onSubmit={handleUploadDocToStage} className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3.5 text-xs">
                            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                              <span className="font-bold text-zinc-100 font-mono text-xs">Anexar Novo Arquivo à Obra ({activeObraModal.code})</span>
                              <button
                                type="button"
                                onClick={() => setShowUploadDocForm(false)}
                                className="text-zinc-400 hover:text-zinc-100"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            <input
                              type="text"
                              required
                              placeholder="Nome do Documento / Especificação Técnica (Ex: Diagrama Unifilar RDU 13.8kV)..."
                              value={newDocName}
                              onChange={(e) => setNewDocName(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-blue-500 font-sans"
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <div>
                                <label className="text-[10px] text-zinc-400 block mb-1">Categoria do Documento</label>
                                <select
                                  value={newDocCategory}
                                  onChange={(e) => setNewDocCategory(e.target.value as any)}
                                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs"
                                >
                                  <option value="Projeto Elétrico">Projeto Elétrico</option>
                                  <option value="ART">ART</option>
                                  <option value="Memorial Descritivo">Memorial Descritivo</option>
                                  <option value="Contrato">Contrato</option>
                                  <option value="Laudo Transformador">Laudo Transformador</option>
                                  <option value="Nota Fiscal">Nota Fiscal</option>
                                  <option value="Licença Ambiental">Licença Ambiental</option>
                                  <option value="Procuração">Procuração</option>
                                  <option value="Outros">Outros</option>
                                </select>
                              </div>

                              <div>
                                <label className="text-[10px] text-zinc-400 block mb-1">Etapa Correspondente</label>
                                <select
                                  value={selectedStageInChecklist}
                                  onChange={(e) => setSelectedStageInChecklist(e.target.value as any)}
                                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs"
                                >
                                  {OBRA_PHASES.map((p) => (
                                    <option key={p} value={p}>{p}</option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="text-[10px] text-zinc-400 block mb-1">Versão</label>
                                <input
                                  type="text"
                                  placeholder="v1.0"
                                  value={newDocVersion}
                                  onChange={(e) => setNewDocVersion(e.target.value)}
                                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs font-mono"
                                />
                              </div>
                            </div>

                            {/* File Selection Box */}
                            <div className="p-3.5 rounded-xl border border-dashed border-zinc-700 bg-zinc-900 text-center space-y-1">
                              <input
                                type="file"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setSelectedFileName(file.name);
                                    setSelectedFileSize(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);
                                    if (!newDocName) setNewDocName(file.name.replace(/\.[^/.]+$/, ""));
                                  }
                                }}
                                className="hidden"
                                id="general-doc-upload-input"
                              />
                              <label
                                htmlFor="general-doc-upload-input"
                                className="cursor-pointer text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center space-x-1.5 text-xs"
                              >
                                <Paperclip className="w-4 h-4" />
                                <span>{selectedFileName ? selectedFileName : 'Clique para selecionar o arquivo no computador (.pdf, .dwg, .png, .xlsx)'}</span>
                              </label>
                              {selectedFileName && (
                                <p className="text-[10px] text-zinc-500 font-mono">Tamanho detectado: {selectedFileSize}</p>
                              )}
                            </div>

                            <div className="flex items-center justify-end space-x-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setShowUploadDocForm(false)}
                                className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 text-xs font-semibold"
                              >
                                Cancelar
                              </button>
                              <button
                                type="submit"
                                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md"
                              >
                                Salvar Documento
                              </button>
                            </div>
                          </form>
                        )}

                        {/* Modal to Edit Document Specification */}
                        {editingDoc && (
                          <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                            <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-5 space-y-4">
                              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                                <h3 className="text-xs font-bold text-zinc-100 font-mono uppercase tracking-wider flex items-center space-x-2">
                                  <Edit className="w-4 h-4 text-blue-400" />
                                  <span>Editar Especificação do Documento</span>
                                </h3>
                                <button onClick={() => setEditingDoc(null)} className="text-zinc-400 hover:text-zinc-100">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>

                              <form onSubmit={handleSaveEditDoc} className="space-y-3 text-xs">
                                <div>
                                  <label className="text-zinc-300 font-semibold block mb-1">Nome / Especificação Técnica</label>
                                  <input
                                    type="text"
                                    required
                                    value={editDocName}
                                    onChange={(e) => setEditDocName(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-blue-500"
                                  />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-zinc-400 text-[10px] block mb-1">Categoria</label>
                                    <select
                                      value={editDocCategory}
                                      onChange={(e) => setEditDocCategory(e.target.value as any)}
                                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs"
                                    >
                                      <option value="Projeto Elétrico">Projeto Elétrico</option>
                                      <option value="ART">ART</option>
                                      <option value="Memorial Descritivo">Memorial Descritivo</option>
                                      <option value="Contrato">Contrato</option>
                                      <option value="Laudo Transformador">Laudo Transformador</option>
                                      <option value="Nota Fiscal">Nota Fiscal</option>
                                      <option value="Licença Ambiental">Licença Ambiental</option>
                                      <option value="Procuração">Procuração</option>
                                      <option value="Outros">Outros</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="text-zinc-400 text-[10px] block mb-1">Etapa Vinculada</label>
                                    <select
                                      value={editDocStage}
                                      onChange={(e) => setEditDocStage(e.target.value as any)}
                                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs"
                                    >
                                      {OBRA_PHASES.map((p) => (
                                        <option key={p} value={p}>{p}</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                  <div>
                                    <label className="text-zinc-400 text-[10px] block mb-1">Versão</label>
                                    <input
                                      type="text"
                                      value={editDocVersion}
                                      onChange={(e) => setEditDocVersion(e.target.value)}
                                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs font-mono"
                                    />
                                  </div>

                                  <div>
                                    <label className="text-zinc-400 text-[10px] block mb-1">Status</label>
                                    <select
                                      value={editDocStatus}
                                      onChange={(e) => setEditDocStatus(e.target.value as any)}
                                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs"
                                    >
                                      <option value="Válido">Válido</option>
                                      <option value="Em Análise">Em Análise</option>
                                      <option value="Pendente">Pendente</option>
                                      <option value="Expirado">Expirado</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="text-zinc-400 text-[10px] block mb-1">Data Validade</label>
                                    <input
                                      type="date"
                                      value={editDocValidity}
                                      onChange={(e) => setEditDocValidity(e.target.value)}
                                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs font-mono"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="text-zinc-400 text-[10px] block mb-1">Responsável Técnico / Emissor</label>
                                  <input
                                    type="text"
                                    value={editDocResponsible}
                                    onChange={(e) => setEditDocResponsible(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs font-sans"
                                  />
                                </div>

                                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-zinc-800">
                                  <button
                                    type="button"
                                    onClick={() => setEditingDoc(null)}
                                    className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 font-semibold text-xs"
                                  >
                                    Cancelar
                                  </button>
                                  <button
                                    type="submit"
                                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md"
                                  >
                                    Salvar Alterações
                                  </button>
                                </div>
                              </form>
                            </div>
                          </div>
                        )}

                        {/* Document Category Filters */}
                        <div className="flex items-center space-x-2 overflow-x-auto text-xs pb-1">
                          <span className="text-[11px] text-zinc-400 font-mono uppercase font-bold shrink-0">Filtrar por Categoria:</span>
                          {[
                            'TODAS',
                            'Projeto Elétrico',
                            'ART',
                            'Memorial Descritivo',
                            'Contrato',
                            'Laudo Transformador',
                            'Nota Fiscal',
                            'Procuração',
                            'Outros',
                          ].map((cat) => (
                            <button
                              key={cat}
                              onClick={() => setDocFilterCategory(cat)}
                              className={`px-3 py-1.5 rounded-xl whitespace-nowrap text-xs font-semibold transition-all ${
                                docFilterCategory === cat
                                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                                  : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:border-zinc-700'
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>

                        {/* Empty State when no documents attached */}
                        {filteredDocs.length === 0 && (
                          <div className="p-8 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-3">
                            <FileText className="w-10 h-10 text-zinc-600 mx-auto" />
                            <h4 className="text-xs font-bold text-zinc-300 uppercase font-mono">Nenhum Documento Anexado à Obra</h4>
                            <p className="text-xs text-zinc-500 max-w-md mx-auto">
                              Os documentos anexados nas etapas da aba <strong className="text-amber-400">Checklist & Protocolo</strong> ou adicionados diretamente nesta aba aparecerão automaticamente aqui para consulta e exportação em ZIP.
                            </p>
                            <button
                              type="button"
                              onClick={() => setShowUploadDocForm(true)}
                              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs inline-flex items-center space-x-1.5 shadow-md"
                            >
                              <Upload className="w-4 h-4" />
                              <span>Anexar Documento Agora</span>
                            </button>
                          </div>
                        )}

                        {/* Documents Grid List */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {filteredDocs.map((doc) => (
                            <div
                              key={doc.id}
                              className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3 hover:border-zinc-700 transition-all group flex flex-col justify-between"
                            >
                              <div className="space-y-2">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                                      <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-zinc-100 text-xs group-hover:text-amber-400 transition-colors">
                                        {doc.name}
                                      </h4>
                                      <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{doc.fileName}</p>
                                    </div>
                                  </div>

                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                                      doc.status === 'Válido'
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    }`}
                                  >
                                    {doc.status}
                                  </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono pt-1">
                                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                    {doc.category}
                                  </span>
                                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                                    Etapa: {doc.stage || 'Geral'}
                                  </span>
                                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                                    Versão: {doc.version || 'v1.0'}
                                  </span>
                                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                                    {doc.fileSize}
                                  </span>
                                </div>

                                <div className="text-[11px] text-zinc-400 font-mono pt-1 border-t border-zinc-900 flex items-center justify-between">
                                  <span>Resp: <strong className="text-zinc-200 font-semibold">{doc.responsible}</strong></span>
                                  <span>{doc.createdAt}</span>
                                </div>
                              </div>

                              {/* Card Action Buttons */}
                              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditDoc(doc)}
                                  className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-blue-600/20 text-zinc-400 hover:text-blue-400 border border-zinc-800 hover:border-blue-500/40 text-[11px] font-semibold transition-all flex items-center space-x-1"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                  <span>Editar Especificação</span>
                                </button>

                                <div className="flex items-center space-x-1">
                                  <button
                                    type="button"
                                    title="Baixar Arquivo Individual"
                                    onClick={() => alert(`Download individual do arquivo "${doc.fileName}"`)}
                                    className="p-1.5 rounded-lg bg-zinc-900 hover:bg-blue-600 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    title="Excluir Documento"
                                    onClick={() => handleDeleteDoc(doc.id)}
                                    className="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-600 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* TAB 5: CUSTOS & DESPESAS */}
              {detailTab === 'custos' && (
                <div className="space-y-4">
                  {/* Financial Summary for Custos */}
                  {(() => {
                    const fin = calculateObraFinancials(activeObraModal, expenses, fuelLogs, financials, movements);
                    return (
                      <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3 text-xs font-mono">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                          <span className="text-xs font-bold text-zinc-200 uppercase font-sans">
                            Consolidação de Todos os Custos Adicionados
                          </span>
                          <span className="text-zinc-400 text-[11px]">
                            Valor Contratual: <strong className="text-zinc-100 font-bold">R$ {fin.contractValue.toLocaleString('pt-BR')}</strong>
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                          <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
                            <span className="text-[10px] text-zinc-500 block font-sans">Despesas Diretas</span>
                            <span className="font-bold text-rose-400">R$ {fin.directExpensesSum.toLocaleString('pt-BR')}</span>
                          </div>
                          <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
                            <span className="text-[10px] text-zinc-500 block font-sans">Combustível & Frota</span>
                            <span className="font-bold text-rose-400">R$ {fin.fuelCostsSum.toLocaleString('pt-BR')}</span>
                          </div>
                          <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
                            <span className="text-[10px] text-zinc-500 block font-sans">Contas a Pagar</span>
                            <span className="font-bold text-rose-400">R$ {fin.financialPayableSum.toLocaleString('pt-BR')}</span>
                          </div>
                          <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
                            <span className="text-[10px] text-zinc-500 block font-sans">Saídas Estoque</span>
                            <span className="font-bold text-rose-400">R$ {fin.stockExitsSum.toLocaleString('pt-BR')}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                          <div>
                            <span className="text-zinc-400 text-[11px]">Total Gasto Lançado: </span>
                            <span className="font-bold text-amber-400 text-sm">R$ {fin.totalCostsSpent.toLocaleString('pt-BR')}</span>
                          </div>
                          <div>
                            <span className="text-zinc-400 text-[11px]">Lucro Resultante: </span>
                            <span className={`font-bold text-sm ${fin.calculatedProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              R$ {fin.calculatedProfit.toLocaleString('pt-BR')} ({fin.profitMarginPercent.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold text-zinc-100 uppercase tracking-wider font-mono">
                      Despesas & Lançamentos Diretos
                    </h3>

                    <button
                      onClick={() => setShowNewExpenseForm(true)}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Lançar Nova Despesa</span>
                    </button>
                  </div>

                  {showNewExpenseForm && (
                    <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                        <span className="font-bold text-zinc-200 text-xs font-mono">Novo Lançamento de Custo Direto</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="font-semibold text-zinc-400 block mb-1 text-[10px]">Categoria do Custo</label>
                          <select
                            value={expCategory}
                            onChange={(e) => setExpCategory(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500 text-xs"
                          >
                            <option value="Combustível">⛽ Combustível / Frota</option>
                            <option value="Funcionários">👷 Funcionários / Diárias</option>
                            <option value="Fornecedores">🏢 Fornecedores</option>
                            <option value="Fretes">🚚 Fretes & Logística</option>
                            <option value="Hotel">🏨 Hotel / Hospedagem</option>
                            <option value="Ferramentas">🔧 Ferramentas / Linha Viva</option>
                            <option value="Equipamentos">🚜 Equipamentos & Máquinas</option>
                            <option value="Alimentação">🍽️ Alimentação</option>
                            <option value="Pedágio">🛣️ Pedágio</option>
                            <option value="Diversos">📦 Diversos</option>
                          </select>
                        </div>

                        {/* Conditional Dropdown 1: Veículos / Frota */}
                        {(expCategory === 'Combustível' || expCategory === 'Veículos') && (
                          <div className="sm:col-span-2">
                            <label className="font-semibold text-amber-400 block mb-1 text-[10px]">Veículo Cadastrado na Frota</label>
                            <select
                              value={expVehicleId}
                              onChange={(e) => {
                                const vehId = e.target.value;
                                setExpVehicleId(vehId);
                                const veh = (vehicles || []).find((v) => v.id === vehId);
                                if (veh) {
                                  setExpDesc(`Abastecimento: ${veh.model} (${veh.plate})`);
                                }
                              }}
                              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-amber-500/30 text-zinc-100 focus:outline-none focus:border-amber-500 text-xs font-mono"
                            >
                              <option value="">Selecione o Veículo / Máquina da Frota...</option>
                              {(vehicles || []).map((v) => (
                                <option key={v.id} value={v.id}>
                                  {v.model} ({v.plate}) • Driver: {v.assignedDriver || 'N/A'}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Conditional Dropdown 2: Funcionários */}
                        {expCategory === 'Funcionários' && (
                          <div className="sm:col-span-2">
                            <label className="font-semibold text-blue-400 block mb-1 text-[10px]">Colaborador / Funcionário Cadastrado</label>
                            <select
                              value={expEmployeeId}
                              onChange={(e) => {
                                const empId = e.target.value;
                                setExpEmployeeId(empId);
                                const emp = (employees || []).find((x) => x.id === empId);
                                if (emp) {
                                  setExpDesc(`Diária / Pagamento: ${emp.name} (${emp.role})`);
                                }
                              }}
                              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-blue-500/30 text-zinc-100 focus:outline-none focus:border-blue-500 text-xs font-sans"
                            >
                              <option value="">Selecione o Colaborador Cadastrado...</option>
                              {(employees || []).map((emp) => (
                                <option key={emp.id} value={emp.id}>
                                  {emp.name} ({emp.role}) - R$ {emp.dailyRate || 150}/dia
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Conditional Dropdown 3: Fornecedores */}
                        {expCategory === 'Fornecedores' && (
                          <div className="sm:col-span-2">
                            <label className="font-semibold text-emerald-400 block mb-1 text-[10px]">Fornecedor Cadastrado</label>
                            <select
                              value={expSupplierName}
                              onChange={(e) => {
                                const supplierName = e.target.value;
                                setExpSupplierName(supplierName);
                                if (supplierName) {
                                  setExpDesc(`Compra / Serviço: ${supplierName}`);
                                }
                              }}
                              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-emerald-500/30 text-zinc-100 focus:outline-none focus:border-emerald-500 text-xs font-sans"
                            >
                              <option value="">Selecione o Fornecedor...</option>
                              {defaultSuppliersList.map((sup) => (
                                <option key={sup} value={sup}>
                                  🏢 {sup}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Fallback for general categories */}
                        {expCategory !== 'Combustível' && expCategory !== 'Veículos' && expCategory !== 'Funcionários' && expCategory !== 'Fornecedores' && (
                          <div className="sm:col-span-2">
                            <label className="font-semibold text-zinc-400 block mb-1 text-[10px]">Descrição da Despesa</label>
                            <input
                              type="text"
                              placeholder="Descrição detalhada..."
                              value={expDesc}
                              onChange={(e) => setExpDesc(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 text-xs"
                            />
                          </div>
                        )}
                      </div>

                      {/* Custom Description if linked dropdown is selected */}
                      {(expCategory === 'Combustível' || expCategory === 'Veículos' || expCategory === 'Funcionários' || expCategory === 'Fornecedores') && (
                        <div>
                          <label className="font-semibold text-zinc-400 block mb-1 text-[10px]">Descrição Personalizada do Lançamento</label>
                          <input
                            type="text"
                            placeholder="Descrição detalhada da despesa..."
                            value={expDesc}
                            onChange={(e) => setExpDesc(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 text-xs"
                          />
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                        <input
                          type="number"
                          placeholder="Valor do Custo (R$)"
                          value={expVal || ''}
                          onChange={(e) => setExpVal(Number(e.target.value))}
                          className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 text-xs w-full sm:w-44 font-mono font-bold"
                        />

                        <div className="flex items-center space-x-2 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={() => setShowNewExpenseForm(false)}
                            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveExpense}
                            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                          >
                            Salvar Lançamento
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {expenses.filter((e) => e.obraId === activeObraModal.id).length === 0 ? (
                      <div className="p-8 text-center rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                        <p className="text-xs text-zinc-400">Nenhum lançamento de custo direto registrado para esta obra.</p>
                        <button
                          type="button"
                          onClick={() => setShowNewExpenseForm(true)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs inline-flex items-center space-x-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Lançar Nova Despesa</span>
                        </button>
                      </div>
                    ) : (
                      expenses
                        .filter((e) => e.obraId === activeObraModal.id)
                        .map((exp) => (
                          <div
                            key={exp.id}
                            className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs hover:border-zinc-700 transition-all"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold text-[10px] font-mono">
                                  {exp.category}
                                </span>
                                <span className="font-semibold text-zinc-100">{exp.description}</span>
                              </div>
                              <div className="flex items-center space-x-3 text-[10px] text-zinc-500 font-mono">
                                <span>Data: {exp.date || 'Hoje'}</span>
                                <span>•</span>
                                <span>Resp: {exp.responsible || 'Gestor'}</span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              <span className="font-bold font-mono text-rose-400 text-sm">
                                - R$ {exp.value.toLocaleString('pt-BR')}
                              </span>

                              <div className="flex items-center space-x-1">
                                <button
                                  type="button"
                                  title="Editar Lançamento"
                                  onClick={() => handleOpenEditExpense(exp)}
                                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-blue-600 text-zinc-400 hover:text-white transition-colors"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  title="Excluir Lançamento"
                                  onClick={() => setDeletingExpense(exp)}
                                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-600 text-zinc-400 hover:text-white transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              )}


            </div>
          </div>
        </div>
      )}

      {/* New Obra Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider font-mono">
                Cadastrar Nova Obra Elétrica
              </h2>
              <button
                onClick={() => setShowNewModal(false)}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateObra} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-zinc-300 block mb-1">Nome do Projeto</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Extensão RDU 13.8kV Bairro Industrial"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Cliente</label>
                  {clients.length > 0 ? (
                    <select
                      value={newClientId}
                      onChange={(e) => setNewClientId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500 font-sans"
                    >
                      <option value="">Selecione um cliente...</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      placeholder="Razão Social / Nome do Cliente"
                      value={newClientCustomName}
                      onChange={(e) => setNewClientCustomName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-sans"
                    />
                  )}
                </div>

                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Número do Projeto</label>
                  <input
                    type="text"
                    placeholder="Ex: PRJ-2026/014"
                    value={newProjectNumber}
                    onChange={(e) => setNewProjectNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Materiais (R$)</label>
                  <input
                    type="number"
                    value={newMaterialVal}
                    onChange={(e) => setNewMaterialVal(Number(e.target.value))}
                    className="w-full px-2.5 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 font-sans focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Mão de Obra (R$)</label>
                  <input
                    type="number"
                    value={newLaborVal}
                    onChange={(e) => setNewLaborVal(Number(e.target.value))}
                    className="w-full px-2.5 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 font-sans focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Lucro Orçado (R$)</label>
                  <input
                    type="number"
                    value={newExpectedProfit}
                    onChange={(e) => setNewExpectedProfit(Number(e.target.value))}
                    className="w-full px-2.5 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 font-sans focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm transition-colors"
                >
                  Cadastrar e Gerar Código da Obra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Obra Modal */}
      {editingObra && (
        <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 shrink-0">
              <div className="flex items-center space-x-2">
                <Edit className="w-4 h-4 text-blue-400" />
                <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider font-mono">
                  Editar Obra — {editingObra.code}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEditingObra(null)}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditObra} className="space-y-4 text-xs overflow-y-auto pr-1">
              {/* Nome e Cliente */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Nome do Projeto</label>
                  <input
                    type="text"
                    required
                    value={editProjectName}
                    onChange={(e) => setEditProjectName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Cliente</label>
                  <select
                    value={editClientId}
                    onChange={(e) => setEditClientId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tipo e Concessionária */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Tipo de Obra</label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as ObraType)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Extensão RDU Urbana">Extensão RDU Urbana</option>
                    <option value="Extensão RDR Rural">Extensão RDR Rural</option>
                    <option value="Reforma/Manutenção RDR">Reforma/Manutenção RDR</option>
                    <option value="Subestação Abrigada">Subestação Abrigada</option>
                    <option value="Subestação Aérea">Subestação Aérea</option>
                    <option value="Padrão de Entrada Agrupado">Padrão de Entrada Agrupado</option>
                    <option value="Rede de Linha Viva 13.8kV">Rede de Linha Viva 13.8kV</option>
                    <option value="Iluminação Pública LED">Iluminação Pública LED</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Número do Projeto</label>
                  <input
                    type="text"
                    placeholder="Ex: PRJ-2026/014"
                    value={editProjectNumber}
                    onChange={(e) => setEditProjectNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* Potência, Município e Estado */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Potência (kVA)</label>
                  <input
                    type="number"
                    required
                    value={editPowerKva}
                    onChange={(e) => setEditPowerKva(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Município</label>
                  <input
                    type="text"
                    required
                    value={editMunicipality}
                    onChange={(e) => setEditMunicipality(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Estado</label>
                  <input
                    type="text"
                    required
                    value={editState}
                    onChange={(e) => setEditState(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Responsável Técnico e ART */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Responsável Técnico</label>
                  <input
                    type="text"
                    required
                    value={editTechResponsible}
                    onChange={(e) => setEditTechResponsible(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Número ART CREA</label>
                  <input
                    type="text"
                    required
                    value={editArtNumber}
                    onChange={(e) => setEditArtNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Status e Execução % */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Status Fásico</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as ObraStatus)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500"
                  >
                    {OBRA_PHASES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Progresso Executado (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editPercentageExecuted}
                    onChange={(e) => setEditPercentageExecuted(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Datas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Data Início</label>
                  <input
                    type="date"
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Previsão Término</label>
                  <input
                    type="date"
                    value={editExpectedEndDate}
                    onChange={(e) => setEditExpectedEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Valores Financeiros */}
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                <span className="font-mono text-zinc-400 font-bold text-[11px] uppercase block">
                  Valores e Orçamento
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="font-semibold text-zinc-400 text-[11px] block mb-1">Materiais (R$)</label>
                    <input
                      type="number"
                      value={editMaterialVal}
                      onChange={(e) => setEditMaterialVal(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-zinc-400 text-[11px] block mb-1">Mão de Obra (R$)</label>
                    <input
                      type="number"
                      value={editLaborVal}
                      onChange={(e) => setEditLaborVal(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-zinc-400 text-[11px] block mb-1">Lucro Orçado (R$)</label>
                    <input
                      type="number"
                      value={editExpectedProfit}
                      onChange={(e) => setEditExpectedProfit(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingObra(null)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm transition-colors flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Obra Confirmation Modal */}
      {deletingObra && (
        <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center space-x-3 text-rose-500">
              <div className="p-3 rounded-full bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-100">Excluir Obra Permanentemente</h3>
                <p className="text-xs text-zinc-400 font-mono">{deletingObra.code}</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Tem certeza que deseja excluir a obra <span className="font-bold text-zinc-100">{deletingObra.projectName}</span>? Esta ação removerá o registro e não poderá ser desfeita.
            </p>

            <div className="pt-3 border-t border-zinc-800 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setDeletingObra(null)}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteObra}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-sm transition-colors flex items-center space-x-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sim, Excluir Obra</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Expense Modal */}
      {editingExpense && (
        <div className="fixed inset-0 z-[60] bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center space-x-2">
                <Edit className="w-5 h-5 text-blue-500" />
                <h3 className="text-sm font-bold text-zinc-100 font-mono">Editar Lançamento de Custo</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingExpense(null)}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditExpense} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Categoria do Custo</label>
                  <select
                    value={editExpCategory}
                    onChange={(e) => setEditExpCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500 font-sans text-xs"
                  >
                    <option value="Combustível">⛽ Combustível / Frota</option>
                    <option value="Funcionários">👷 Funcionários / Diárias</option>
                    <option value="Fornecedores">🏢 Fornecedores</option>
                    <option value="Fretes">🚚 Fretes & Logística</option>
                    <option value="Hotel">🏨 Hotel / Hospedagem</option>
                    <option value="Ferramentas">🔧 Ferramentas / Linha Viva</option>
                    <option value="Equipamentos">🚜 Equipamentos & Máquinas</option>
                    <option value="Alimentação">🍽️ Alimentação</option>
                    <option value="Pedágio">🛣️ Pedágio</option>
                    <option value="Diversos">📦 Diversos</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editExpVal}
                    onChange={(e) => setEditExpVal(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* Conditional Dropdown 1: Veículos / Frota */}
              {(editExpCategory === 'Combustível' || editExpCategory === 'Veículos') && (
                <div>
                  <label className="font-semibold text-amber-400 block mb-1 text-[11px]">Veículo Cadastrado na Frota</label>
                  <select
                    value={editVehicleId}
                    onChange={(e) => {
                      const vehId = e.target.value;
                      setEditVehicleId(vehId);
                      const veh = (vehicles || []).find((v) => v.id === vehId);
                      if (veh) {
                        setEditExpDesc(`Abastecimento: ${veh.model} (${veh.plate})`);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-amber-500/30 text-zinc-100 focus:outline-none focus:border-amber-500 font-mono text-xs"
                  >
                    <option value="">Selecione o Veículo / Máquina da Frota...</option>
                    {(vehicles || []).map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.model} ({v.plate}) • Driver: {v.assignedDriver || 'N/A'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Conditional Dropdown 2: Funcionários */}
              {editExpCategory === 'Funcionários' && (
                <div>
                  <label className="font-semibold text-blue-400 block mb-1 text-[11px]">Colaborador / Funcionário Cadastrado</label>
                  <select
                    value={editEmployeeId}
                    onChange={(e) => {
                      const empId = e.target.value;
                      setEditEmployeeId(empId);
                      const emp = (employees || []).find((x) => x.id === empId);
                      if (emp) {
                        setEditExpDesc(`Diária / Pagamento: ${emp.name} (${emp.role})`);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-blue-500/30 text-zinc-100 focus:outline-none focus:border-blue-500 font-sans text-xs"
                  >
                    <option value="">Selecione o Colaborador Cadastrado...</option>
                    {(employees || []).map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.role}) - R$ {emp.dailyRate || 150}/dia
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Conditional Dropdown 3: Fornecedores */}
              {editExpCategory === 'Fornecedores' && (
                <div>
                  <label className="font-semibold text-emerald-400 block mb-1 text-[11px]">Fornecedor Cadastrado</label>
                  <select
                    value={editSupplierName}
                    onChange={(e) => {
                      const supplierName = e.target.value;
                      setEditSupplierName(supplierName);
                      if (supplierName) {
                        setEditExpDesc(`Compra / Serviço: ${supplierName}`);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-emerald-500/30 text-zinc-100 focus:outline-none focus:border-emerald-500 font-sans text-xs"
                  >
                    <option value="">Selecione o Fornecedor...</option>
                    {defaultSuppliersList.map((sup) => (
                      <option key={sup} value={sup}>
                        🏢 {sup}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="font-semibold text-zinc-300 block mb-1">Descrição do Lançamento</label>
                <input
                  type="text"
                  required
                  value={editExpDesc}
                  onChange={(e) => setEditExpDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Data</label>
                  <input
                    type="date"
                    value={editExpDate}
                    onChange={(e) => setEditExpDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Responsável pelo Lançamento</label>
                  <input
                    type="text"
                    value={editExpResponsible}
                    onChange={(e) => setEditExpResponsible(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500 font-sans"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingExpense(null)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm transition-colors flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Expense Confirmation Modal */}
      {deletingExpense && (
        <div className="fixed inset-0 z-[60] bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center space-x-3 text-rose-500">
              <div className="p-3 rounded-full bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-100">Excluir Lançamento de Custo</h3>
                <p className="text-xs text-zinc-400 font-mono">{deletingExpense.category}</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Tem certeza que deseja excluir o lançamento <span className="font-bold text-zinc-100">"{deletingExpense.description}"</span> no valor de <span className="font-bold text-rose-400">R$ {deletingExpense.value.toLocaleString('pt-BR')}</span>? O total gasto e o lucro da obra serão recalculados automaticamente.
            </p>

            <div className="pt-3 border-t border-zinc-800 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setDeletingExpense(null)}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteExpense}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-sm transition-colors flex items-center space-x-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir Lançamento</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
