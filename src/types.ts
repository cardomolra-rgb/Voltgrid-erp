/**
 * Types for ProObras ERP - Gestão de Obras de Energia Elétrica
 */

export type UserRole =
  | 'Administrador'
  | 'Diretor'
  | 'Financeiro'
  | 'Compras'
  | 'Engenharia'
  | 'Almoxarifado'
  | 'Motorista'
  | 'Equipe de Campo'
  | 'Cliente'
  | 'Engenheiro Responsável'
  | 'Contador';

export interface SystemUserItem {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  role: UserRole;
  password?: string;
  status: 'Ativo' | 'Inativo';
  createdAt: string;
  allowedModules: string[];
}

export type ObraStatus =
  | 'Orçamento'
  | 'Aprovada'
  | 'Cotação'
  | 'Proposta'
  | 'Contrato'
  | 'Notas Fiscais'
  | 'Laudos'
  | 'Execução'
  | 'Fiscalização'
  | 'Ligação'
  | 'Finalizada'
  | 'Recebida'
  | 'Cancelada';

export type ObraType =
  | 'Extensão RDU Urbana'
  | 'Extensão RDR Rural'
  | 'Reforma/Manutenção RDR'
  | 'Subestação Abrigada'
  | 'Subestação Aérea'
  | 'Padrão de Entrada Agrupado'
  | 'Rede de Linha Viva 13.8kV'
  | 'Iluminação Pública LED';

export interface SystemCompanyConfig {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstadual: string;
  creaJuridico: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone: string;
  email: string;
  website: string;
  techResponsibleMain: string;
  logoUrl?: string;
  primaryColor?: string;
  aliquotaImpostoPercent?: number;
}

export interface TechnicalEngineer {
  id: string;
  name: string;
  crea: string;
  title: string;
  email: string;
  phone: string;
  status: 'Ativo' | 'Inativo';
}

export interface FinancialAccountConfig {
  id: string;
  name: string;
  bankName: string;
  accountType: 'Conta Corrente' | 'Conta Poupança' | 'Investimento' | 'Caixa Físico / Espécie';
  agency: string;
  accountNumber: string;
  initialBalance: number;
  status: 'Ativo' | 'Inativo';
}

export interface ExpenseCategoryConfig {
  id: string;
  name: string;
  code: string;
  costType: 'Direto de Obra' | 'Administrativo / Fixo' | 'Operacional / Campo';
  status: 'Ativo' | 'Inativo';
}

export interface ObraTypeConfig {
  id: string;
  name: string;
  description: string;
  status: 'Ativo' | 'Inativo';
}

export interface ConcessionariaConfig {
  id: string;
  name: string;
  region: string;
  normaTecnica: string;
  status: 'Ativo' | 'Inativo';
}

export interface DocumentCategoryConfig {
  id: string;
  name: string;
  required: boolean;
  validityDays: number;
  status: 'Ativo' | 'Inativo';
}

export interface MaterialCategoryConfig {
  id: string;
  name: string;
  ncm: string;
  unit: string;
  status: 'Ativo' | 'Inativo';
}

export type ProposalStatus =
  | 'Rascunho'
  | 'Enviada'
  | 'Em negociação'
  | 'Aprovada'
  | 'Reprovada'
  | 'Cancelada';

export interface ProposalItem {
  id: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
}

export interface ProposalCondition {
  executionTerm: string;
  deliveryTerm: string;
  paymentMethod: string;
  warranty: string;
  validityDays: number;
  companyResponsibilities: string;
  clientResponsibilities: string;
}

export interface ProposalHistoryLog {
  id: string;
  date: string;
  user: string;
  action: string;
  version: string;
}

export interface CommercialProposal {
  id: string;
  proposalNumber: string;
  clientId: string;
  clientName: string;
  clientCpfCnpj: string;
  clientPhone: string;
  clientEmail: string;
  clientAddress: string;
  clientCity: string;
  clientState: string;
  date: string;
  validityDate: string;
  sellerName: string;
  proposalType: string;
  items: ProposalItem[];
  subtotal: number;
  discountTotal: number;
  freight: number;
  otherExpenses: number;
  taxes: number;
  totalValue: number;
  totalValueInWords: string;
  conditions: ProposalCondition;
  notes: string;
  attachments: Array<{ id: string; name: string; url?: string; type: string }>;
  status: ProposalStatus;
  history: ProposalHistoryLog[];
  currentVersion: string;
  contractId?: string;
  createdAt: string;
  updatedAt: string;
}

export type Concessionaria =
  | 'CPFL Paulista'
  | 'Enel SP'
  | 'Cemig'
  | 'Copel'
  | 'Light'
  | 'Energisa'
  | 'Celesc'
  | 'Equatorial'
  | 'Neoenergia';

export interface Client {
  id: string;
  name: string;
  cpfCnpj: string;
  rgIe: string;
  contactPerson: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  lat: number;
  lng: number;
  createdAt: string;
  notes?: string;
  activeProjectsCount: number;
}

export interface ProtocolChecklistItem {
  id: string;
  obraId: string;
  title: string;
  category: 'Legal' | 'Técnico' | 'Nota Fiscal' | 'Laudo' | 'Cliente';
  required: boolean;
  status: 'Pendente' | 'Aprovado' | 'Rejeitado';
  fileName?: string;
  updatedAt: string;
  notes?: string;
  stage?: ObraStatus;
}

export interface ObraDocument {
  id: string;
  obraId: string;
  name: string;
  category:
    | 'Projeto Elétrico'
    | 'ART'
    | 'Memorial Descritivo'
    | 'Contrato'
    | 'Laudo Transformador'
    | 'Nota Fiscal'
    | 'Licença Ambiental'
    | 'Procuração'
    | 'Outros';
  version: string;
  status: 'Válido' | 'Expirado' | 'Pendente' | 'Em Análise';
  validityDate?: string;
  responsible: string;
  fileName: string;
  fileSize: string;
  createdAt: string;
  stage?: ObraStatus;
}

export interface ObraExpense {
  id: string;
  obraId: string;
  category:
    | 'Combustível'
    | 'Funcionários'
    | 'Fornecedores'
    | 'Fretes'
    | 'Hotel'
    | 'Alimentação'
    | 'Pedágio'
    | 'Veículos'
    | 'Ferramentas'
    | 'Equipamentos'
    | 'Linha Viva'
    | 'Materiais'
    | 'Diversos';
  description: string;
  value: number;
  date: string;
  responsible: string;
  status: 'Pendente' | 'Pago';
  vehicleId?: string;
  employeeId?: string;
  supplierName?: string;
  receiptUrl?: string;
  receiptFileName?: string;
}

export interface RDOPhoto {
  id: string;
  url: string;
  caption: string;
  phase: 'Antes' | 'Durante' | 'Depois';
  timestamp: string;
  lat: number;
  lng: number;
}

export interface RDOMaterialUsed {
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
}

export interface DiarioObraRDO {
  id: string;
  obraId: string;
  obraCode: string;
  date: string;
  weather: 'Ensolarado' | 'Nublado' | 'Chuva Leve' | 'Chuva Forte';
  teamCount: number;
  hoursWorked: number;
  servicesExecuted: string;
  occurrences: string;
  materialsUsed: RDOMaterialUsed[];
  photos: RDOPhoto[];
  gpsLocation: { lat: number; lng: number; address: string };
  engineerSignature?: string;
  inspectorSignature?: string;
  status: 'Rascunho' | 'Enviado' | 'Aprovado';
}

export interface GanttTask {
  id: string;
  obraId: string;
  title: string;
  phase: ObraStatus;
  startDate: string;
  endDate: string;
  durationDays: number;
  progress: number;
  dependencies: string[];
  delayAlert: boolean;
  completed?: boolean;
}

export interface Obra {
  id: string; // e.g., OBR-2026-089
  code: string;
  projectNumber?: string;
  clientId: string;
  clientName: string;
  projectName: string;
  powerKva: number;
  type: ObraType;
  municipality: string;
  state: string;
  concessionaria?: Concessionaria;
  techResponsible: string;
  artNumber: string;
  startDate: string;
  expectedEndDate: string;
  actualEndDate?: string;
  status: ObraStatus;
  percentageExecuted: number;
  materialValue: number;
  laborValue: number;
  totalValue: number;
  expectedProfit: number;
  actualProfit: number;
  lat: number;
  lng: number;
  observations?: string;
  protocolBlocked: boolean;
  missingProtocolItemsCount: number;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  unit: string;
  category:
    | 'Postes'
    | 'Transformadores'
    | 'Cabos/Condutores'
    | 'Isoladores'
    | 'Chaves Fusível'
    | 'Para-raios'
    | 'Ferragens'
    | 'Conectores'
    | 'EPI/EPC'
    | 'Ferramental';
  currentQuantity: number;
  minQuantity: number;
  reservedQuantity: number;
  unitCost: number;
  avgCost: number;
  supplier: string;
  barcodeQr: string;
  storageLocation: string;
}

export interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: 'Entrada' | 'Saída Obra' | 'Transferência' | 'Ajuste';
  quantity: number;
  unit: string;
  obraId?: string;
  obraCode?: string;
  unitCost: number;
  totalValue: number;
  date: string;
  responsible: string;
  notes?: string;
}

export interface PurchaseItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PurchaseOrder {
  id: string;
  number: string;
  requester: string;
  status:
    | 'Solicitação'
    | 'Cotação'
    | 'Aprovado'
    | 'Pedido Emitido'
    | 'Recebido Total'
    | 'Recebido Parcial'
    | 'Cancelado';
  supplierName: string;
  totalValue: number;
  createdAt: string;
  deliveryDate: string;
  obraId?: string;
  obraCode?: string;
  items: PurchaseItem[];
}

export interface FinancialAccount {
  id: string;
  type: 'Pagar' | 'Receber';
  description: string;
  obraId?: string;
  obraCode?: string;
  category:
    | 'Material'
    | 'Mão de Obra'
    | 'Frota/Combustível'
    | 'Diárias/Hospedagem'
    | 'Equipamentos/Linha Viva'
    | 'Projetos/ART'
    | 'Impostos'
    | 'Faturamento Obra';
  totalValue: number;
  paidValue: number;
  dueDate: string;
  paymentDate?: string;
  status: 'Pendente' | 'Pago' | 'Atrasado' | 'Cancelado';
  supplierClient: string;
  costCenter: string;
  paymentMethod: 'PIX' | 'Boleto' | 'Transferência' | 'Cartão';
  installmentsInfo?: string;
  recurrenceType?: 'Unica' | 'Recorrente' | 'Parcelada';
  installmentCount?: number;
  installmentIndex?: number;
  isObraExpense?: boolean;
  originalExpenseId?: string;
  notes?: string;
  receiptUrl?: string;
  receiptFileName?: string;
}

export interface EmployeeCertification {
  title: string; // e.g. NR-10, NR-35, Linha Viva, SEP
  validUntil: string;
  status: 'Ativo' | 'Vencendo' | 'Vencido';
}

export interface EmployeeDocument {
  id: string;
  fileName: string;
  fileType: string;
  fileSize?: string;
  fileUrl: string;
  uploadedAt: string;
}

export interface Employee {
  id: string;
  name: string;
  phone?: string;
  cpf?: string;
  address?: string;
  role:
    | 'Engenheiro Eletricista'
    | 'Linheiro de Linha Viva'
    | 'Eletricista Montador'
    | 'Encarregado de Turma'
    | 'Operador de Munck'
    | 'Almoxarife'
    | 'Motorista'
    | 'Técnico em Eletrotécnica'
    | 'Auxiliar de Campo';
  salary: number;
  dailyRate: number; // Diária
  pixKey: string;
  bankInfo: string;
  paymentDetails?: {
    pixKey?: string;
    pixType?: string;
    bankName?: string;
    agency?: string;
    account?: string;
    accountType?: string;
  };
  status: 'Ativo' | 'Em Férias' | 'Inativo';
  certifications: EmployeeCertification[];
  epiIssued: string[];
  totalOvertimeHours: number;
  documents: string[];
  attachedDocs?: EmployeeDocument[];
}

export interface EmployeePaymentLog {
  id: string;
  employeeId: string;
  employeeName: string;
  obraId?: string;
  obraCode?: string;
  paymentDate: string;
  daysWorked: number;
  dailyRate: number;
  grossAmount: number;
  advancesValue: number;
  netAmount: number;
  description?: string;
  status: 'Pago' | 'Pendente';
}

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  type:
    | 'Munck'
    | 'Retroescavadeira'
    | 'Caminhão Cesto Linha Viva'
    | 'Picape Cesta'
    | 'Utilitário 4x4'
    | 'Moto';
  year: number;
  status: 'Em Operação' | 'Em Manutenção' | 'Reservado';
  currentKm: number;
  lastOilChangeKm: number;
  ipvaStatus: 'Pago' | 'Pendente' | 'Atrasado';
  insuranceValidity: string;
  assignedDriver: string;
  avgKmLiter: number;
}

export interface FuelLog {
  id: string;
  date: string;
  driverName: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleModel: string;
  obraId: string;
  obraCode: string;
  stationName: string;
  liters: number;
  totalValue: number;
  pricePerLiter: number;
  initialKm: number;
  finalKm: number;
  calculatedKm: number;
  avgConsumptionKml: number;
  costPerKm: number;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  dataSummary?: {
    metric?: string;
    value?: string;
    recommendation?: string;
  };
}

export function maskCpfCnpj(val: string): string {
  if (!val) return '';
  const clean = val.replace(/\D/g, '');
  if (clean.length <= 11) {
    return clean
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  return clean
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

export function maskPhone(val: string): string {
  if (!val) return '';
  const clean = val.replace(/\D/g, '').slice(0, 11);
  if (clean.length <= 10) {
    return clean
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  return clean
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

export interface ApprovedContract {
  id: string;
  contractNumber: string;
  clientName: string;
  clientId: string;
  obraId?: string;
  obraCode?: string;
  projectName?: string;
  contractValue: number;
  paymentMethod: string;
  approvedAt: string;
  approvedBy: string;
  status: 'Aprovado' | 'Assinado' | 'Em Execução';
  documentType: 'contrato' | 'procuracao';
  fileName: string;
}

export interface SupplierItem {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  category: string;
  contactPerson: string;
  phone: string;
  email: string;
  cityState: string;
  status: 'Ativo' | 'Inativo';
}

