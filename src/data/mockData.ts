import {
  Client,
  Obra,
  ProtocolChecklistItem,
  ObraDocument,
  ObraExpense,
  DiarioObraRDO,
  GanttTask,
  InventoryItem,
  StockMovement,
  PurchaseOrder,
  FinancialAccount,
  Employee,
  Vehicle,
  FuelLog,
  TechnicalEngineer,
  FinancialAccountConfig,
  ExpenseCategoryConfig,
  ObraTypeConfig,
  ConcessionariaConfig,
  DocumentCategoryConfig,
  MaterialCategoryConfig,
} from '../types';

export const INITIAL_CLIENTS: Client[] = [];
export const INITIAL_OBRAS: Obra[] = [];
export const INITIAL_PROTOCOL_CHECKLISTS: ProtocolChecklistItem[] = [];
export const INITIAL_DOCUMENTS: ObraDocument[] = [];
export const INITIAL_EXPENSES: ObraExpense[] = [];
export const INITIAL_RDOS: DiarioObraRDO[] = [];
export const INITIAL_GANTT_TASKS: GanttTask[] = [];
export const INITIAL_INVENTORY: InventoryItem[] = [];
export const INITIAL_STOCK_MOVEMENTS: StockMovement[] = [];
export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [];
export const INITIAL_FINANCIAL_ACCOUNTS: FinancialAccount[] = [];
export const INITIAL_EMPLOYEES: Employee[] = [];
export const INITIAL_VEHICLES: Vehicle[] = [];
export const INITIAL_FUEL_LOGS: FuelLog[] = [];
export const INITIAL_ENGINEERS: TechnicalEngineer[] = [];
export const INITIAL_FINANCIAL_ACCOUNT_CONFIGS: FinancialAccountConfig[] = [];
export const INITIAL_EXPENSE_CATEGORIES: ExpenseCategoryConfig[] = [];
export const INITIAL_OBRA_TYPES: ObraTypeConfig[] = [];
export const INITIAL_CONCESSIONARIAS: ConcessionariaConfig[] = [];
export const INITIAL_DOCUMENT_CATEGORIES: DocumentCategoryConfig[] = [];
export const INITIAL_MATERIAL_CATEGORIES: MaterialCategoryConfig[] = [];

export const INITIAL_SYSTEM_USERS = [
  {
    id: 'USR-ADMIN',
    name: 'Administrador Master',
    email: 'admin@proobras.com.br',
    cpf: '000.000.000-00',
    phone: '(63) 99999-9999',
    role: 'Administrador' as const,
    password: 'admin123',
    status: 'Ativo' as const,
    createdAt: '2026-01-01',
    allowedModules: [
      'painel',
      'obras',
      'crm',
      'clientes',
      'financeiro',
      'frota',
      'rh',
      'relatorios',
      'documentacao',
      'cadastros',
    ],
  },
];

export const INITIAL_COMPANY_CONFIG = {
  razaoSocial: 'MOURA SOLUÇÕES ELÉTRICAS LTDA',
  nomeFantasia: 'ProObras ERP - Gestão de Obras de Energia',
  cnpj: '54.729.118/0001-84',
  inscricaoEstadual: '',
  creaJuridico: 'CREA-TO 5069821-X',
  endereco: 'Quadra 812 Sul, QI 06, Lote 01, Sala 05',
  cidade: 'Palmas',
  estado: 'TO',
  cep: '77.023-120',
  telefone: '',
  email: '',
  website: '',
  techResponsibleMain: 'Ricardo Damacena de Moura',
  logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
  primaryColor: '#2563eb',
  aliquotaImpostoPercent: 9.0,
};
