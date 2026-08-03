import React, { useState } from 'react';
import {
  Building2,
  HardHat,
  CreditCard,
  DollarSign,
  Zap,
  Plug,
  FileText,
  Package,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  Save,
  Check,
  X,
  SlidersHorizontal,
  FolderCheck,
  AlertTriangle,
  Clock,
  Eye,
  Upload,
  ExternalLink,
  FileCheck,
  ShieldAlert,
  RefreshCw,
  Download,
  Share2,
  MessageSquare,
  Globe,
  Users,
  UserCheck,
  ShieldCheck,
  KeyRound,
  Lock,
} from 'lucide-react';
import {
  SystemCompanyConfig,
  TechnicalEngineer,
  FinancialAccountConfig,
  ExpenseCategoryConfig,
  ObraTypeConfig,
  ConcessionariaConfig,
  DocumentCategoryConfig,
  MaterialCategoryConfig,
  UserRole,
  SystemUserItem,
  maskCpfCnpj,
  maskPhone,
} from '../types';

const ALL_SYSTEM_MODULES = [
  { id: 'obras', label: '🏗️ Obras Ativas' },
  { id: 'frota', label: '🚚 Gestão de Frota' },
  { id: 'rh', label: '👷 Gestão de Equipes (RH)' },
  { id: 'crm', label: '🤝 Proposta Comercial / CRM' },
  { id: 'financeiro', label: '💰 Financeiro & DRE' },
  { id: 'relatorios', label: '📊 Relatórios Financeiros' },
  { id: 'documentacao', label: '📄 Gerador de Documentos & ARTs' },
  { id: 'cadastros', label: '⚙️ Cadastros Gerais & Configurações' },
];

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

interface CadastrosModuleProps {
  initialSubTab?: string;
  onRoleChange?: (role: UserRole) => void;
  systemUsers?: SystemUserItem[];
  onSaveUsers?: (users: SystemUserItem[]) => void;
  onSelectUser?: (user: SystemUserItem) => void;
  companyConfig: SystemCompanyConfig;
  onUpdateCompanyConfig: (config: SystemCompanyConfig) => void;

  engineers: TechnicalEngineer[];
  onAddEngineer: (eng: TechnicalEngineer) => void;
  onUpdateEngineer: (eng: TechnicalEngineer) => void;
  onDeleteEngineer: (id: string) => void;

  financialAccountConfigs: FinancialAccountConfig[];
  onAddFinancialAccountConfig: (acc: FinancialAccountConfig) => void;
  onUpdateFinancialAccountConfig: (acc: FinancialAccountConfig) => void;
  onDeleteFinancialAccountConfig: (id: string) => void;

  expenseCategories: ExpenseCategoryConfig[];
  onAddExpenseCategory: (cat: ExpenseCategoryConfig) => void;
  onUpdateExpenseCategory: (cat: ExpenseCategoryConfig) => void;
  onDeleteExpenseCategory: (id: string) => void;

  obraTypes: ObraTypeConfig[];
  onAddObraType: (ot: ObraTypeConfig) => void;
  onUpdateObraType: (ot: ObraTypeConfig) => void;
  onDeleteObraType: (id: string) => void;

  concessionarias: ConcessionariaConfig[];
  onAddConcessionaria: (con: ConcessionariaConfig) => void;
  onUpdateConcessionaria: (con: ConcessionariaConfig) => void;
  onDeleteConcessionaria: (id: string) => void;

  documentCategories: DocumentCategoryConfig[];
  onAddDocumentCategory: (dc: DocumentCategoryConfig) => void;
  onUpdateDocumentCategory: (dc: DocumentCategoryConfig) => void;
  onDeleteDocumentCategory: (id: string) => void;

  materialCategories: MaterialCategoryConfig[];
  onAddMaterialCategory: (mc: MaterialCategoryConfig) => void;
  onUpdateMaterialCategory: (mc: MaterialCategoryConfig) => void;
  onDeleteMaterialCategory: (id: string) => void;
}

export const CadastrosModule: React.FC<CadastrosModuleProps> = ({
  initialSubTab,
  onRoleChange,
  systemUsers = [],
  onSaveUsers,
  onSelectUser,
  companyConfig,
  onUpdateCompanyConfig,
  engineers,
  onAddEngineer,
  onUpdateEngineer,
  onDeleteEngineer,
  financialAccountConfigs,
  onAddFinancialAccountConfig,
  onUpdateFinancialAccountConfig,
  onDeleteFinancialAccountConfig,
  expenseCategories,
  onAddExpenseCategory,
  onUpdateExpenseCategory,
  onDeleteExpenseCategory,
  obraTypes,
  onAddObraType,
  onUpdateObraType,
  onDeleteObraType,
  concessionarias,
  onAddConcessionaria,
  onUpdateConcessionaria,
  onDeleteConcessionaria,
  documentCategories,
  onAddDocumentCategory,
  onUpdateDocumentCategory,
  onDeleteDocumentCategory,
  materialCategories,
  onAddMaterialCategory,
  onUpdateMaterialCategory,
  onDeleteMaterialCategory,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<string>(initialSubTab || 'documentos_empresa');

  React.useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const [searchTerm, setSearchTerm] = useState('');
  const [saveBannerMessage, setSaveBannerMessage] = useState<string | null>(null);

  // 1. Gestão de Documentos da Empresa State
  const [docCategoryFilter, setDocCategoryFilter] = useState<'TODOS' | 'Empresa' | 'Certidões' | 'Contábil'>('TODOS');
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [editingCompanyDoc, setEditingCompanyDoc] = useState<any | null>(null);
  const [previewCompanyDoc, setPreviewCompanyDoc] = useState<{
    id?: string;
    title: string;
    codeOrType: string;
    issuer: string;
    expiryDate: string;
    fileName: string;
    fileUrl?: string;
    categoryGroup?: string;
    status?: string;
    issuanceUrl?: string;
  } | null>(null);

  // Form State for New / Edit Document
  const [docTitle, setDocTitle] = useState('');
  const [docGroup, setDocGroup] = useState<'Empresa' | 'Certidões' | 'Contábil'>('Empresa');
  const [docType, setDocType] = useState('CNPJ');
  const [docIssuer, setDocIssuer] = useState('');
  const [docIssueDate, setDocIssueDate] = useState('2026-01-01');
  const [docExpiryDate, setDocExpiryDate] = useState('2027-01-01');
  const [docFileName, setDocFileName] = useState('');
  const [docFileUrl, setDocFileUrl] = useState('');
  const [docIssuanceUrl, setDocIssuanceUrl] = useState('');

  const [companyDocs, setCompanyDocs] = useState<Array<{
    id: string;
    categoryGroup: 'Empresa' | 'Certidões' | 'Contábil';
    title: string;
    codeOrType: string;
    issuer: string;
    issueDate: string;
    expiryDate: string;
    daysRemaining: number;
    status: 'Valido' | 'Vence30' | 'Vencido';
    fileName?: string;
    fileUrl?: string;
    issuanceUrl?: string;
  }>>([]);

  const validDocsCount = companyDocs.filter((d) => d.status === 'Valido').length;
  const expiring30DocsCount = companyDocs.filter((d) => d.status === 'Vence30').length;
  const expiredDocsCount = companyDocs.filter((d) => d.status === 'Vencido').length;

  const handleOpenAddDocModal = () => {
    setEditingCompanyDoc(null);
    setDocTitle('');
    setDocGroup('Empresa');
    setDocType('CNPJ');
    setDocIssuer('');
    setDocIssueDate(new Date().toISOString().split('T')[0]);
    setDocExpiryDate(new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0]);
    setDocFileName('');
    setDocFileUrl('');
    setDocIssuanceUrl('https://solucoes.receita.fazenda.gov.br/');
    setShowAddDocModal(true);
  };

  const handleOpenEditDocModal = (doc: any) => {
    setEditingCompanyDoc(doc);
    setDocTitle(doc.title);
    setDocGroup(doc.categoryGroup);
    setDocType(doc.codeOrType);
    setDocIssuer(doc.issuer);
    setDocIssueDate(doc.issueDate);
    setDocExpiryDate(doc.expiryDate);
    setDocFileName(doc.fileName || '');
    setDocFileUrl(doc.fileUrl || '');
    setDocIssuanceUrl(doc.issuanceUrl || '');
    setShowAddDocModal(true);
  };

  const handleSaveCompanyDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim()) return;

    if (editingCompanyDoc) {
      setCompanyDocs((prev) =>
        prev.map((d) =>
          d.id === editingCompanyDoc.id
            ? {
                ...d,
                categoryGroup: docGroup,
                title: docTitle.trim(),
                codeOrType: docType,
                issuer: docIssuer.trim() || 'Órgão Expedidor',
                issueDate: docIssueDate,
                expiryDate: docExpiryDate,
                fileName: docFileName || d.fileName || 'Documento_Atualizado.pdf',
                fileUrl: docFileUrl || d.fileUrl,
                issuanceUrl: docIssuanceUrl.trim(),
              }
            : d
        )
      );
      setEditingCompanyDoc(null);
      setSaveBannerMessage(`Documento "${docTitle}" editado com sucesso!`);
    } else {
      const newDoc = {
        id: `DOC-${Date.now()}`,
        categoryGroup: docGroup,
        title: docTitle.trim(),
        codeOrType: docType,
        issuer: docIssuer.trim() || 'Órgão Expedidor',
        issueDate: docIssueDate,
        expiryDate: docExpiryDate,
        daysRemaining: 180,
        status: 'Valido' as const,
        fileName: docFileName || 'Documento_Anexado.pdf',
        fileUrl: docFileUrl,
        issuanceUrl: docIssuanceUrl.trim(),
      };

      setCompanyDocs([newDoc, ...companyDocs]);
      setSaveBannerMessage('Novo documento da empresa cadastrado com sucesso!');
    }

    setShowAddDocModal(false);
    setDocTitle('');
    setDocIssuer('');
    setDocFileName('');
    setDocFileUrl('');
    setDocIssuanceUrl('');
    setTimeout(() => setSaveBannerMessage(null), 4000);
  };

  // 1. Download Document Handler
  const handleDownloadDoc = (doc: any) => {
    if (doc.fileUrl && (doc.fileUrl.startsWith('blob:') || doc.fileUrl.startsWith('data:') || doc.fileUrl.startsWith('http'))) {
      const a = document.createElement('a');
      a.href = doc.fileUrl;
      a.download = doc.fileName || `${doc.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      const content = `=====================================================
PROOBRAS ERP — DOCUMENTO DA EMPRESA ATUALIZADO
=====================================================
TÍTULO: ${doc.title}
CATEGORIA: ${doc.categoryGroup} (${doc.codeOrType})
ÓRGÃO EMISSOR: ${doc.issuer}
DATA DE EMISSÃO: ${doc.issueDate}
DATA DE VENCIMENTO: ${doc.expiryDate}
STATUS: ${doc.status === 'Valido' ? 'VÁLIDO' : doc.status === 'Vence30' ? 'PRESTES A VENCER' : 'VENCIDO'}
ARQUIVO DE REGISTRO: ${doc.fileName || 'Documento_Autenticado.pdf'}
SITE OFICIAL DE EMISSÃO: ${doc.issuanceUrl || 'https://solucoes.receita.fazenda.gov.br/'}
=====================================================
Documento autenticado e verificado no ERP ProObras.
`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.fileName ? doc.fileName.replace(/\.pdf$/, '.txt') : `${doc.codeOrType}_${doc.title}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    setSaveBannerMessage(`Download do documento "${doc.title}" realizado com sucesso!`);
    setTimeout(() => setSaveBannerMessage(null), 4000);
  };

  // 2. WhatsApp Share Document Handler
  const handleShareWhatsAppDoc = (doc: any) => {
    const statusEmoji = doc.status === 'Valido' ? '🟢 Válido' : doc.status === 'Vence30' ? '🟡 Prestes a vencer' : '🔴 Vencido';
    const message = `📄 *ProObras ERP — Compartilhamento de Documento da Empresa*

*Documento:* ${doc.title}
*Categoria:* ${doc.categoryGroup} (${doc.codeOrType})
*Órgão Expedidor:* ${doc.issuer}
*Data de Vencimento:* ${doc.expiryDate}
*Status:* ${statusEmoji}
*Site Oficial de Emissão:* ${doc.issuanceUrl || 'https://solucoes.receita.fazenda.gov.br/'}

📎 *Arquivo Anexo:* ${doc.fileName || 'Documento_Digitalizado.pdf'}
🔗 *Link de Acesso Seguro:* https://proobras.com.br/docs/view?id=${doc.id}`;

    const encodedText = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
  };

  // 3. Open Official Issuance Website Link
  const handleOpenIssuanceWebsite = (doc: any) => {
    const url = doc.issuanceUrl || 'https://solucoes.receita.fazenda.gov.br/';
    window.open(url, '_blank');
  };

  // 2. CADASTRO DE USUÁRIO & PERFIS DE ACESSO STATE
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUserItem | null>(null);

  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userCpf, setUserCpf] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userRole, setUserRole] = useState<UserRole>('Diretor');
  const [userPassword, setUserPassword] = useState('');
  const [userStatus, setUserStatus] = useState<'Ativo' | 'Inativo'>('Ativo');
  const [userAllowedModules, setUserAllowedModules] = useState<string[]>([
    'obras', 'frota', 'rh', 'crm', 'financeiro', 'relatorios', 'documentacao', 'cadastros'
  ]);

  const handleRoleChangeInForm = (role: UserRole) => {
    setUserRole(role);
    const r = role as string;
    if (r === 'Diretor' || r === 'Administrador') {
      setUserAllowedModules(['obras', 'frota', 'rh', 'crm', 'financeiro', 'relatorios', 'documentacao', 'cadastros']);
    } else if (r === 'Engenheiro' || r === 'Engenharia' || r === 'Engenheiro Responsável') {
      setUserAllowedModules(['obras', 'documentacao', 'cadastros']);
    } else if (r === 'Financeiro' || r === 'Contador') {
      setUserAllowedModules(['financeiro', 'relatorios', 'crm']);
    } else if (r === 'Almoxarifado' || r === 'Motorista') {
      setUserAllowedModules(['frota', 'rh']);
    }
  };

  const toggleModulePermission = (modId: string) => {
    if (userAllowedModules.includes(modId)) {
      setUserAllowedModules(userAllowedModules.filter((m) => m !== modId));
    } else {
      setUserAllowedModules([...userAllowedModules, modId]);
    }
  };

  const handleOpenAddUserModal = () => {
    setEditingUser(null);
    setUserName('');
    setUserEmail('');
    setUserCpf('');
    setUserPhone('');
    setUserRole('Diretor');
    setUserPassword('proobras2026');
    setUserStatus('Ativo');
    setUserAllowedModules(['obras', 'frota', 'rh', 'crm', 'financeiro', 'relatorios', 'documentacao', 'cadastros']);
    setShowAddUserModal(true);
  };

  const handleOpenEditUserModal = (user: SystemUserItem) => {
    setEditingUser(user);
    setUserName(user.name);
    setUserEmail(user.email);
    setUserCpf(user.cpf);
    setUserPhone(user.phone);
    setUserRole(user.role);
    setUserPassword('********');
    setUserStatus(user.status);
    setUserAllowedModules(user.allowedModules || ['obras', 'cadastros']);
    setShowAddUserModal(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim()) return;

    if (editingUser) {
      const updatedUsers = systemUsers.map((u) =>
        u.id === editingUser.id
          ? {
              ...u,
              name: userName.trim(),
              email: userEmail.trim(),
              cpf: userCpf.trim(),
              phone: userPhone.trim(),
              role: userRole,
              status: userStatus,
              allowedModules: userAllowedModules,
            }
          : u
      );
      if (onSaveUsers) onSaveUsers(updatedUsers);
      setEditingUser(null);
      setSaveBannerMessage(`Usuário "${userName}" atualizado com permissões personalizadas!`);
    } else {
      const newUser: SystemUserItem = {
        id: `USR-${Date.now()}`,
        name: userName.trim(),
        email: userEmail.trim(),
        cpf: userCpf.trim(),
        phone: userPhone.trim(),
        role: userRole,
        status: userStatus,
        createdAt: new Date().toISOString().split('T')[0],
        allowedModules: userAllowedModules,
      };
      if (onSaveUsers) onSaveUsers([newUser, ...systemUsers]);
      setSaveBannerMessage(`Novo usuário "${userName}" cadastrado com sucesso!`);
    }

    setShowAddUserModal(false);
    setUserName('');
    setUserEmail('');
    setUserCpf('');
    setUserPhone('');
    setTimeout(() => setSaveBannerMessage(null), 4000);
  };

  // 3. CADASTRO DE FORNECEDORES STATE
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierItem | null>(null);

  const [supRazao, setSupRazao] = useState('');
  const [supFantasia, setSupFantasia] = useState('');
  const [supCnpj, setSupCnpj] = useState('');
  const [supCategory, setSupCategory] = useState('Postes & Concretagem');
  const [supContact, setSupContact] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supEmail, setSupEmail] = useState('');
  const [supCityState, setSupCityState] = useState('Palmas - TO');

  const handleOpenAddSupplierModal = () => {
    setEditingSupplier(null);
    setSupRazao('');
    setSupFantasia('');
    setSupCnpj('');
    setSupCategory('Postes & Concretagem');
    setSupContact('');
    setSupPhone('');
    setSupEmail('');
    setSupCityState('Palmas - TO');
    setShowAddSupplierModal(true);
  };

  const handleOpenEditSupplierModal = (sup: SupplierItem) => {
    setEditingSupplier(sup);
    setSupRazao(sup.razaoSocial);
    setSupFantasia(sup.nomeFantasia);
    setSupCnpj(sup.cnpj);
    setSupCategory(sup.category);
    setSupContact(sup.contactPerson);
    setSupPhone(sup.phone);
    setSupEmail(sup.email);
    setSupCityState(sup.cityState);
    setShowAddSupplierModal(true);
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supRazao.trim()) return;

    if (editingSupplier) {
      setSuppliers(
        suppliers.map((s) =>
          s.id === editingSupplier.id
            ? {
                ...s,
                razaoSocial: supRazao.trim(),
                nomeFantasia: supFantasia.trim() || supRazao.trim(),
                cnpj: supCnpj.trim(),
                category: supCategory,
                contactPerson: supContact.trim(),
                phone: supPhone.trim(),
                email: supEmail.trim(),
                cityState: supCityState.trim(),
              }
            : s
        )
      );
      setEditingSupplier(null);
      setSaveBannerMessage(`Fornecedor "${supRazao}" atualizado com sucesso!`);
    } else {
      const newSup: SupplierItem = {
        id: `SUP-${Date.now()}`,
        razaoSocial: supRazao.trim(),
        nomeFantasia: supFantasia.trim() || supRazao.trim(),
        cnpj: supCnpj.trim(),
        category: supCategory,
        contactPerson: supContact.trim(),
        phone: supPhone.trim(),
        email: supEmail.trim(),
        cityState: supCityState.trim(),
        status: 'Ativo',
      };
      setSuppliers([newSup, ...suppliers]);
      setSaveBannerMessage(`Novo fornecedor "${supRazao}" cadastrado com sucesso!`);
    }

    setShowAddSupplierModal(false);
    setTimeout(() => setSaveBannerMessage(null), 4000);
  };

  // Company Form Local State
  const [companyForm, setCompanyForm] = useState<SystemCompanyConfig>(companyConfig);

  const handleSaveCompanyForm = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCompanyConfig(companyForm);
    setSaveBannerMessage('Dados da empresa atualizados com sucesso!');
    setTimeout(() => setSaveBannerMessage(null), 4000);
  };

  // Engineer Form State
  const [showAddEngineerForm, setShowAddEngineerForm] = useState(false);
  const [editingEngineer, setEditingEngineer] = useState<TechnicalEngineer | null>(null);
  const [engName, setEngName] = useState('');
  const [engCrea, setEngCrea] = useState('');
  const [engTitle, setEngTitle] = useState('Engenheiro Eletricista Senior');
  const [engEmail, setEngEmail] = useState('');
  const [engPhone, setEngPhone] = useState('');

  const handleSaveEngineer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!engName.trim()) return;

    if (editingEngineer) {
      onUpdateEngineer({
        ...editingEngineer,
        name: engName.trim(),
        crea: engCrea.trim(),
        title: engTitle.trim(),
        email: engEmail.trim(),
        phone: engPhone.trim(),
      });
      setEditingEngineer(null);
    } else {
      onAddEngineer({
        id: `ENG-${Date.now()}`,
        name: engName.trim(),
        crea: engCrea.trim(),
        title: engTitle.trim(),
        email: engEmail.trim(),
        phone: engPhone.trim(),
        status: 'Ativo',
      });
      setShowAddEngineerForm(false);
    }
    setEngName('');
    setEngCrea('');
    setEngEmail('');
    setEngPhone('');
  };

  // Obra Type Form State
  const [showAddObraTypeForm, setShowAddObraTypeForm] = useState(false);
  const [editingObraType, setEditingObraType] = useState<ObraTypeConfig | null>(null);
  const [otName, setOtName] = useState('');
  const [otDesc, setOtDesc] = useState('');

  const handleSaveObraType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otName.trim()) return;

    if (editingObraType) {
      onUpdateObraType({
        ...editingObraType,
        name: otName.trim(),
        description: otDesc.trim(),
      });
      setEditingObraType(null);
    } else {
      onAddObraType({
        id: `OT-${Date.now()}`,
        name: otName.trim(),
        description: otDesc.trim(),
        status: 'Ativo',
      });
      setShowAddObraTypeForm(false);
    }
    setOtName('');
    setOtDesc('');
  };

  const SUB_TABS = [
    { id: 'documentos_empresa', label: 'Gestão de Documentos da Empresa', icon: <FolderCheck className="w-4 h-4 text-emerald-400" />, count: companyDocs.length },
    { id: 'empresa', label: 'Dados da Empresa', icon: <Building2 className="w-4 h-4 text-blue-400" /> },
    { id: 'usuarios', label: 'Cadastro de Usuários & Perfis', icon: <Users className="w-4 h-4 text-indigo-400" />, count: systemUsers.length },
    { id: 'engenheiros', label: 'Engenheiros & RTs', icon: <HardHat className="w-4 h-4 text-amber-400" />, count: engineers.length },
    { id: 'fornecedores', label: 'Cadastro de Fornecedores', icon: <Building2 className="w-4 h-4 text-purple-400" />, count: suppliers.length },
    { id: 'obras_tipos', label: 'Tipos de Obras', icon: <Zap className="w-4 h-4 text-amber-400" />, count: obraTypes.length },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-zinc-100 font-mono flex items-center space-x-2">
            <SlidersHorizontal className="w-5 h-5 text-amber-400" />
            <span>Cadastros Gerais & Configurações Concentradas do Sistema</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Central única de gestão: documentos da empresa, dados cadastrais, usuários/perfis, engenheiros, fornecedores e tipos de obras.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar em cadastros..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-amber-500 w-60"
            />
          </div>
        </div>
      </div>

      {/* Notification Banner */}
      {saveBannerMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{saveBannerMessage}</span>
          </div>
          <button onClick={() => setSaveBannerMessage(null)} className="text-emerald-400 hover:text-emerald-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sub-Tabs Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-zinc-800 text-xs font-sans">
        {SUB_TABS.map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id as any);
                setSearchTerm('');
              }}
              className={`px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap transition-all flex items-center space-x-2 cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-950 scale-102'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-zinc-950 text-amber-400' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* SUB-TAB 0: GESTÃO DE DOCUMENTOS DA EMPRESA */}
      {activeSubTab === 'documentos_empresa' && (
        <div className="space-y-6">
          {/* Top Banner Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-950 border border-zinc-800">
            <div>
              <h2 className="text-base font-extrabold text-zinc-100 font-mono flex items-center space-x-2">
                <FolderCheck className="w-5 h-5 text-emerald-400" />
                <span>DOCUMENTOS DA EMPRESA</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Monitoramento contínuo de validade de certidões negativas, escrituras, alvarás e emissão direta em sites oficiais.
              </p>
            </div>

            <button
              onClick={handleOpenAddDocModal}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-2 shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Cadastrar / Anexar Documento</span>
            </button>
          </div>

          {/* Status KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans">
            <div className="p-4 rounded-2xl bg-zinc-900 border border-emerald-500/20 bg-emerald-500/5 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 font-mono">🟢 Válidos</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <p className="text-2xl font-extrabold font-mono text-emerald-400">{validDocsCount}</p>
              <p className="text-[11px] text-zinc-400">Documentos e certidões em dia</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900 border border-amber-500/20 bg-amber-500/5 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 font-mono">🟡 Vencem em 30 dias</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-extrabold font-mono text-amber-400">{expiring30DocsCount}</p>
              <p className="text-[11px] text-zinc-400">Atenção recomendada para renovação</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900 border border-rose-500/20 bg-rose-500/5 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400 font-mono">🔴 Vencidos</span>
                <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />
              </div>
              <p className="text-2xl font-extrabold font-mono text-rose-400">{expiredDocsCount}</p>
              <p className="text-[11px] text-zinc-400">Requer renovação imediata</p>
            </div>
          </div>

          {/* Últimos avisos Panel */}
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm space-y-3 font-sans">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
              <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Últimos avisos</span>
              </h3>
              <span className="text-[10px] text-zinc-400 font-mono">Notificações automáticas do sistema</span>
            </div>

            {companyDocs.filter((d) => d.status === 'Vence30' || d.status === 'Vencido').length === 0 ? (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>🟢 Nenhum aviso pendente. Todos os documentos da empresa estão válidos e em dia!</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-semibold">
                {companyDocs
                  .filter((d) => d.status === 'Vence30' || d.status === 'Vencido')
                  .map((wDoc) => (
                    <div
                      key={wDoc.id}
                      className={`p-3 rounded-xl border flex items-center space-x-2.5 ${
                        wDoc.status === 'Vencido'
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      }`}
                    >
                      {wDoc.status === 'Vencido' ? (
                        <XCircle className="w-4 h-4 shrink-0 text-rose-400" />
                      ) : (
                        <Clock className="w-4 h-4 shrink-0 text-amber-400" />
                      )}
                      <span>
                        • {wDoc.codeOrType} {wDoc.status === 'Vencido' ? 'vencida' : `vence em ${wDoc.daysRemaining} dia(s)`}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Categories Selector & Document Table */}
          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
              <div className="flex items-center space-x-2 overflow-x-auto">
                <span className="text-xs font-bold text-zinc-400 font-mono mr-2">Categorias:</span>
                {[
                  { id: 'TODOS', label: 'Todas as Categorias' },
                  { id: 'Empresa', label: 'Empresa (CNPJ, Contrato Social, Alvará...)' },
                  { id: 'Certidões', label: 'Certidões (FGTS, CNDT, INSS...)' },
                  { id: 'Contábil', label: 'Contábil (Balanço, CREA...)' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setDocCategoryFilter(cat.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      docCategoryFilter === cat.id
                        ? 'bg-emerald-600 text-white font-bold shadow'
                        : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Document Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 text-[11px] font-bold font-mono uppercase tracking-wider">
                    <th className="py-3 px-4">Documento / Título</th>
                    <th className="py-3 px-3">Categoria & Tipo</th>
                    <th className="py-3 px-3">Órgão Expedidor</th>
                    <th className="py-3 px-3">Vencimento</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Ações & Emissão</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-sans">
                  {companyDocs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-zinc-500 font-mono text-xs">
                        Nenhum documento cadastrado. Clique no botão "+ Cadastrar / Anexar Documento" para adicionar certidões ou documentos da empresa.
                      </td>
                    </tr>
                  ) : (
                    companyDocs
                      .filter((doc) => docCategoryFilter === 'TODOS' || doc.categoryGroup === docCategoryFilter)
                      .filter(
                        (doc) =>
                          !searchTerm ||
                          doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.codeOrType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.issuer.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((doc) => (
                        <tr key={doc.id} className="hover:bg-zinc-900/60 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-zinc-100 flex items-center space-x-2">
                            <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>{doc.title}</span>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-zinc-900 text-zinc-300 border border-zinc-800">
                              {doc.codeOrType}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-zinc-300">{doc.issuer}</td>
                          <td className="py-3.5 px-3 font-mono text-zinc-400">{doc.expiryDate}</td>
                          <td className="py-3.5 px-3 text-center">
                            {doc.status === 'Valido' && (
                              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                🟢 Válido
                              </span>
                            )}
                            {doc.status === 'Vence30' && (
                              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                🟡 Vence em {doc.daysRemaining} dia(s)
                              </span>
                            )}
                            {doc.status === 'Vencido' && (
                              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                🔴 Vencido
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              {/* Action: Emitir Nova Certidão (Site Oficial) */}
                              <button
                                onClick={() => handleOpenIssuanceWebsite(doc)}
                                title="Emitir Nova Certidão / Acessar Site Oficial do Órgão"
                                className="px-2 py-1 rounded-lg bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/20 text-[11px] font-bold flex items-center space-x-1 transition-all cursor-pointer"
                              >
                                <Globe className="w-3.5 h-3.5" />
                                <span className="hidden xl:inline">Emitir Certidão</span>
                              </button>

                              {/* Action: Visualizar PDF */}
                              <button
                                onClick={() => setPreviewCompanyDoc(doc)}
                                title="Visualizar PDF / Detalhes"
                                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-emerald-600 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Action: Editar Documento */}
                              <button
                                onClick={() => handleOpenEditDocModal(doc)}
                                title="Editar Documento e Link do Site"
                                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-blue-600 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              {/* Action: Download */}
                              <button
                                onClick={() => handleDownloadDoc(doc)}
                                title="Fazer Download do Arquivo"
                                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-indigo-600 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>

                              {/* Action: Compartilhar no WhatsApp */}
                              <button
                                onClick={() => handleShareWhatsAppDoc(doc)}
                                title="Compartilhar via WhatsApp"
                                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-emerald-500 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
                              >
                                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                              </button>

                              {/* Action: Renovar Data */}
                              <button
                                onClick={() => {
                                  setCompanyDocs(
                                    companyDocs.map((d) =>
                                      d.id === doc.id
                                        ? {
                                            ...d,
                                            status: 'Valido',
                                            expiryDate: '2027-07-27',
                                            daysRemaining: 365,
                                          }
                                        : d
                                    )
                                  );
                                  setSaveBannerMessage(`Documento "${doc.title}" renovado com sucesso!`);
                                  setTimeout(() => setSaveBannerMessage(null), 4000);
                                }}
                                title="Renovar Validade do Documento"
                                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-amber-500 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </button>

                              {/* Action: Excluir */}
                              <button
                                onClick={() => setCompanyDocs(companyDocs.filter((d) => d.id !== doc.id))}
                                title="Excluir Documento"
                                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-600 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 1: DADOS DA EMPRESA */}
      {activeSubTab === 'empresa' && (
        <form onSubmit={handleSaveCompanyForm} className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-6 text-xs font-sans">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-100 font-mono flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-blue-400" />
                <span>Cadastro da Minha Empresa (Matriz / Filial)</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Esses dados aparecem no cabeçalho das ARTs, Relatórios de Obra (RDO) e Nota Fiscal.
              </p>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-950 flex items-center space-x-1.5 transition-all"
            >
              <Save className="w-4 h-4 stroke-[2.5]" />
              <span>Salvar Dados da Empresa</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Logo da Empresa e Cor da Marca */}
            <div className="md:col-span-2 p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="font-bold text-amber-400 text-xs font-mono">
                  🎨 Logomarca da Empresa & Identidade Visual (Proposta Comercial & Documentos)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                {/* Logo Preview */}
                <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-center space-y-2">
                  {companyForm.logoUrl ? (
                    <img
                      src={companyForm.logoUrl}
                      alt="Logo da Empresa"
                      className="h-16 max-w-full object-contain rounded-lg shadow"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs font-mono">
                      SEM LOGO
                    </div>
                  )}
                  <span className="text-[10px] text-zinc-400 font-mono">Pré-visualização da Logo</span>
                </div>

                {/* Logo URL Input & File Upload */}
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-zinc-300 font-semibold block text-xs">
                    Upload ou URL da Logomarca (Formatos PNG, JPG, WebP)
                  </label>
                  <input
                    type="text"
                    placeholder="URL da Imagem da Logo (https://...)"
                    value={companyForm.logoUrl || ''}
                    onChange={(e) => setCompanyForm({ ...companyForm, logoUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs font-mono focus:outline-none focus:border-blue-500"
                  />

                  <div className="flex items-center space-x-2">
                    <label className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-bold cursor-pointer transition-colors border border-zinc-700">
                      <span>📁 Selecionar Imagem do Computador</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setCompanyForm({ ...companyForm, logoUrl: reader.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>

                    {companyForm.logoUrl && (
                      <button
                        type="button"
                        onClick={() => setCompanyForm({ ...companyForm, logoUrl: '' })}
                        className="px-2 py-1 rounded bg-rose-500/20 text-rose-400 font-mono text-[10px]"
                      >
                        Remover Logo
                      </button>
                    )}
                  </div>

                  {/* Cor Principal da Marca */}
                  <div className="pt-2">
                    <label className="text-zinc-300 font-semibold block mb-1 text-xs">
                      Cor Principal da Marca (Usada nos Destaques da Proposta Comercial)
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={companyForm.primaryColor || '#2563eb'}
                        onChange={(e) => setCompanyForm({ ...companyForm, primaryColor: e.target.value })}
                        className="w-10 h-8 rounded bg-zinc-900 border border-zinc-800 cursor-pointer"
                      />
                      <span className="font-mono text-xs font-bold text-zinc-200 uppercase">
                        {companyForm.primaryColor || '#2563eb'}
                      </span>
                      <div className="flex space-x-1">
                        {['#2563eb', '#059669', '#d97706', '#7c3aed', '#dc2626', '#0284c7'].map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setCompanyForm({ ...companyForm, primaryColor: color })}
                            style={{ backgroundColor: color }}
                            className="w-5 h-5 rounded-full border border-white/20 hover:scale-110 transition-transform cursor-pointer"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label className="text-zinc-300 font-semibold block mb-1">Razão Social Oficial</label>
              <input
                type="text"
                required
                value={companyForm.razaoSocial}
                onChange={(e) => setCompanyForm({ ...companyForm, razaoSocial: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-blue-500 font-sans"
              />
            </div>

            <div>
              <label className="text-zinc-300 font-semibold block mb-1">Nome Fantasia / Marca Comercial</label>
              <input
                type="text"
                required
                value={companyForm.nomeFantasia}
                onChange={(e) => setCompanyForm({ ...companyForm, nomeFantasia: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-blue-500 font-sans"
              />
            </div>

            <div>
              <label className="text-zinc-300 font-semibold block mb-1">CNPJ</label>
              <input
                type="text"
                required
                value={companyForm.cnpj}
                onChange={(e) => setCompanyForm({ ...companyForm, cnpj: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-zinc-300 font-semibold block mb-1">Inscrição Estadual (IE)</label>
              <input
                type="text"
                value={companyForm.inscricaoEstadual}
                onChange={(e) => setCompanyForm({ ...companyForm, inscricaoEstadual: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-zinc-300 font-semibold block mb-1">Registro CREA Jurídico da Empresa</label>
              <input
                type="text"
                required
                value={companyForm.creaJuridico}
                onChange={(e) => setCompanyForm({ ...companyForm, creaJuridico: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-zinc-300 font-semibold block mb-1">Responsável Técnico Principal</label>
              <input
                type="text"
                required
                value={companyForm.techResponsibleMain}
                onChange={(e) => setCompanyForm({ ...companyForm, techResponsibleMain: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-blue-500 font-sans"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-zinc-300 font-semibold block mb-1">Endereço Completo da Sede</label>
              <input
                type="text"
                required
                value={companyForm.endereco}
                onChange={(e) => setCompanyForm({ ...companyForm, endereco: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-blue-500 font-sans"
              />
            </div>

            <div>
              <label className="text-zinc-300 font-semibold block mb-1">Cidade / UF</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  required
                  placeholder="Cidade"
                  value={companyForm.cidade}
                  onChange={(e) => setCompanyForm({ ...companyForm, cidade: e.target.value })}
                  className="w-2/3 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs"
                />
                <input
                  type="text"
                  required
                  placeholder="UF"
                  maxLength={2}
                  value={companyForm.estado}
                  onChange={(e) => setCompanyForm({ ...companyForm, estado: e.target.value.toUpperCase() })}
                  className="w-1/3 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-zinc-300 font-semibold block mb-1">CEP</label>
              <input
                type="text"
                value={companyForm.cep}
                onChange={(e) => setCompanyForm({ ...companyForm, cep: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-zinc-300 font-semibold block mb-1">Telefone / WhatsApp Comercial</label>
              <input
                type="text"
                value={companyForm.telefone}
                onChange={(e) => setCompanyForm({ ...companyForm, telefone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-zinc-300 font-semibold block mb-1">E-mail Corporativo</label>
              <input
                type="email"
                value={companyForm.email}
                onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-zinc-300 font-semibold block mb-1">Alíquota de Imposto / Tributos (%)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="Ex: 9.0 ou 6.0"
                  value={companyForm.aliquotaImpostoPercent ?? 9.0}
                  onChange={(e) => setCompanyForm({ ...companyForm, aliquotaImpostoPercent: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-amber-400 font-mono text-xs font-bold focus:outline-none focus:border-amber-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-zinc-400 font-bold">%</span>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* SUB-TAB 2: CADASTRO DE USUÁRIOS & PERFIS DE ACESSO */}
      {activeSubTab === 'usuarios' && (
        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4 font-sans">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-100 font-mono flex items-center space-x-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Cadastro de Usuários & Seleção de Módulos Permitidos</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Cadastre os perfis de usuários do sistema e selecione exatamente quais módulos cada um tem autorização para visualizar.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddUserModal}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Cadastrar Novo Usuário / Perfil</span>
            </button>
          </div>

          {/* User List Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 text-[11px] font-bold font-mono uppercase tracking-wider">
                  <th className="py-3 px-4">Nome do Usuário</th>
                  <th className="py-3 px-3">E-mail & Contato</th>
                  <th className="py-3 px-3">Perfil de Acesso</th>
                  <th className="py-3 px-3">Módulos Autorizados</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ações & Perfil</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-sans">
                {systemUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-zinc-500 font-mono text-xs">
                      Nenhum usuário cadastrado. Clique no botão "+ Cadastrar Novo Usuário / Perfil" para criar os perfis e selecionar seus módulos.
                    </td>
                  </tr>
                ) : (
                  systemUsers
                    .filter((u) => !searchTerm || u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()) || u.role.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((user) => (
                      <tr key={user.id} className="hover:bg-zinc-900/60 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-zinc-100 flex items-center space-x-2">
                          <UserCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                          <span>{user.name}</span>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="font-mono text-zinc-300">{user.email}</div>
                          {user.phone && <div className="text-[10px] text-zinc-500 font-mono">{user.phone}</div>}
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`px-2.5 py-1 rounded text-[11px] font-bold font-mono border ${
                              user.role === 'Diretor' || user.role === 'Administrador'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : user.role === 'Engenheiro' || user.role === 'Engenharia'
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                : user.role === 'Financeiro'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {ALL_SYSTEM_MODULES.filter((m) => user.allowedModules?.includes(m.id)).map((m) => (
                              <span
                                key={m.id}
                                className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-900 text-zinc-300 border border-zinc-800"
                              >
                                {m.label}
                              </span>
                            ))}
                            {(!user.allowedModules || user.allowedModules.length === 0) && (
                              <span className="text-[10px] text-rose-400 font-mono">Nenhum módulo liberado</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = systemUsers.map((u) =>
                                u.id === user.id ? { ...u, status: u.status === 'Ativo' ? ('Inativo' as const) : ('Ativo' as const) } : u
                              );
                              if (onSaveUsers) onSaveUsers(updated);
                            }}
                            className={`px-2.5 py-0.5 rounded text-[10px] font-bold font-mono cursor-pointer ${
                              user.status === 'Ativo'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                            }`}
                          >
                            {user.status}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            {/* Action: Alternar para este Usuário */}
                            {onSelectUser && (
                              <button
                                onClick={() => {
                                  onSelectUser(user);
                                  setSaveBannerMessage(`Modo ativado para usuário "${user.name} (${user.role})" com ${user.allowedModules?.length || 0} módulo(s) liberados!`);
                                  setTimeout(() => setSaveBannerMessage(null), 4000);
                                }}
                                title="Ativar este Usuário e Permissões de Módulo"
                                className="px-2 py-1 rounded-lg bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/20 text-[11px] font-bold flex items-center space-x-1 transition-all cursor-pointer"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                                <span className="hidden xl:inline">Ativar Usuário</span>
                              </button>
                            )}

                            {/* Action: Editar */}
                            <button
                              onClick={() => handleOpenEditUserModal(user)}
                              title="Editar Usuário e Módulos"
                              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-blue-600 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* Action: Excluir */}
                            <button
                              onClick={() => {
                                const updated = systemUsers.filter((u) => u.id !== user.id);
                                if (onSaveUsers) onSaveUsers(updated);
                              }}
                              title="Excluir Usuário"
                              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-600 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: ENGENHEIROS & RESPONSÁVEIS TÉCNICOS */}
      {activeSubTab === 'engenheiros' && (
        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4 font-sans">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-100 font-mono flex items-center space-x-2">
                <HardHat className="w-4 h-4 text-amber-400" />
                <span>Cadastro de Engenheiros e Responsáveis Técnicos (RTs)</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Engenheiros habilitados para emissão de ART, laudos técnicos e assinatura de projetos perante a concessionária.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingEngineer(null);
                setEngName('');
                setEngCrea('');
                setEngEmail('');
                setEngPhone('');
                setShowAddEngineerForm(!showAddEngineerForm);
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Novo Engenheiro / RT</span>
            </button>
          </div>

          {/* Form to Add/Edit Engineer */}
          {(showAddEngineerForm || editingEngineer) && (
            <form onSubmit={handleSaveEngineer} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="font-bold text-zinc-100 font-mono text-xs">
                  {editingEngineer ? `Editar Cadastro — ${editingEngineer.name}` : 'Cadastrar Novo Engenheiro / RT'}
                </span>
                <button type="button" onClick={() => { setShowAddEngineerForm(false); setEditingEngineer(null); }} className="text-zinc-400 hover:text-zinc-100">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Nome Completo do Engenheiro..."
                  value={engName}
                  onChange={(e) => setEngName(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs"
                />
                <input
                  type="text"
                  required
                  placeholder="Número CREA / CFT (Ex: CREA-SP 5069923841)..."
                  value={engCrea}
                  onChange={(e) => setEngCrea(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs font-mono"
                />
                <input
                  type="text"
                  placeholder="Título Profissional (Ex: Engenheiro Eletricista Senior)..."
                  value={engTitle}
                  onChange={(e) => setEngTitle(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs"
                />
                <input
                  type="email"
                  placeholder="E-mail profissional..."
                  value={engEmail}
                  onChange={(e) => setEngEmail(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs font-mono"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setShowAddEngineerForm(false); setEditingEngineer(null); }}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  {editingEngineer ? 'Salvar Alterações' : 'Salvar Engenheiro'}
                </button>
              </div>
            </form>
          )}

          {/* Engineers Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 text-[11px] font-bold font-mono uppercase tracking-wider">
                  <th className="py-3 px-4">Nome do Profissional</th>
                  <th className="py-3 px-3">Registro CREA/CFT</th>
                  <th className="py-3 px-3">Título / Especialidade</th>
                  <th className="py-3 px-3">Contato / E-mail</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {engineers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-zinc-500 font-mono text-xs">
                      Nenhum engenheiro cadastrado. Clique no botão "+ Cadastrar Novo Engenheiro / RT" para adicionar.
                    </td>
                  </tr>
                ) : (
                  engineers
                    .filter((e) => !searchTerm || e.name.toLowerCase().includes(searchTerm.toLowerCase()) || e.crea.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((eng) => (
                      <tr key={eng.id} className="hover:bg-zinc-900/60 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-zinc-100">{eng.name}</td>
                        <td className="py-3.5 px-3 font-mono text-amber-400">{eng.crea}</td>
                        <td className="py-3.5 px-3 text-zinc-300">{eng.title}</td>
                        <td className="py-3.5 px-3 font-mono text-zinc-400">{eng.email}</td>
                        <td className="py-3.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => onUpdateEngineer({ ...eng, status: eng.status === 'Ativo' ? 'Inativo' : 'Ativo' })}
                            className={`px-2.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                              eng.status === 'Ativo'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                            }`}
                          >
                            {eng.status}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => {
                                setEditingEngineer(eng);
                                setEngName(eng.name);
                                setEngCrea(eng.crea);
                                setEngTitle(eng.title);
                                setEngEmail(eng.email);
                                setEngPhone(eng.phone);
                              }}
                              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-blue-600 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteEngineer(eng.id)}
                              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-600 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: CADASTRO DE FORNECEDORES */}
      {activeSubTab === 'fornecedores' && (
        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4 font-sans">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-100 font-mono flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-purple-400" />
                <span>Cadastro de Fornecedores & Parceiros Comerciais</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Fabricantes de postes, cabos elétricos, transformadores, locadoras de caminhão Munck e empreiteiras.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddSupplierModal}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Cadastrar Novo Fornecedor</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 text-[11px] font-bold font-mono uppercase tracking-wider">
                  <th className="py-3 px-4">Razão Social / Nome Fantasia</th>
                  <th className="py-3 px-3">CNPJ / CPF</th>
                  <th className="py-3 px-3">Categoria de Fornecimento</th>
                  <th className="py-3 px-3">Contato & Telefone</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-sans">
                {suppliers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-zinc-500 font-mono text-xs">
                      Nenhum fornecedor cadastrado. Clique no botão "+ Cadastrar Novo Fornecedor" para adicionar parceiros de suprimentos ou serviços.
                    </td>
                  </tr>
                ) : (
                  suppliers
                    .filter((s) => !searchTerm || s.razaoSocial.toLowerCase().includes(searchTerm.toLowerCase()) || s.cnpj.toLowerCase().includes(searchTerm.toLowerCase()) || s.category.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((sup) => (
                      <tr key={sup.id} className="hover:bg-zinc-900/60 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-zinc-100">
                          <div>{sup.razaoSocial}</div>
                          {sup.nomeFantasia && <div className="text-[10px] text-zinc-400 font-normal">{sup.nomeFantasia}</div>}
                        </td>
                        <td className="py-3.5 px-3 font-mono text-zinc-300">{sup.cnpj}</td>
                        <td className="py-3.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-purple-500/10 text-purple-400 border border-purple-500/30">
                            {sup.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="text-zinc-200">{sup.contactPerson}</div>
                          <div className="text-[10px] font-mono text-zinc-400">{sup.phone}</div>
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              setSuppliers(
                                suppliers.map((s) => (s.id === sup.id ? { ...s, status: s.status === 'Ativo' ? 'Inativo' : 'Ativo' } : s))
                              )
                            }
                            className={`px-2.5 py-0.5 rounded text-[10px] font-bold font-mono cursor-pointer ${
                              sup.status === 'Ativo'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                            }`}
                          >
                            {sup.status}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => handleOpenEditSupplierModal(sup)}
                              title="Editar Fornecedor"
                              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-blue-600 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setSuppliers(suppliers.filter((s) => s.id !== sup.id))}
                              title="Excluir Fornecedor"
                              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-600 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: TIPOS DE OBRAS */}
      {activeSubTab === 'obras_tipos' && (
        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4 font-sans">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-100 font-mono flex items-center space-x-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Cadastro de Tipos e Categorias de Obras Elétricas</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Categorias padronizadas para classificação de projetos de rede de distribuição e subestações.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingObraType(null);
                setOtName('');
                setOtDesc('');
                setShowAddObraTypeForm(!showAddObraTypeForm);
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Tipo de Obra</span>
            </button>
          </div>

          {/* Form to Add/Edit Obra Type */}
          {(showAddObraTypeForm || editingObraType) && (
            <form onSubmit={handleSaveObraType} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="font-bold text-zinc-100 font-mono text-xs">
                  {editingObraType ? `Editar Tipo — ${editingObraType.name}` : 'Cadastrar Tipo de Obra'}
                </span>
                <button type="button" onClick={() => { setShowAddObraTypeForm(false); setEditingObraType(null); }} className="text-zinc-400 hover:text-zinc-100">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Nome da Categoria (Ex: Subestação Abrigada)..."
                  value={otName}
                  onChange={(e) => setOtName(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs font-semibold"
                />
                <input
                  type="text"
                  placeholder="Descrição Técnica / Norma..."
                  value={otDesc}
                  onChange={(e) => setOtDesc(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setShowAddObraTypeForm(false); setEditingObraType(null); }}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 font-semibold"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold">
                  Salvar Tipo de Obra
                </button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 text-[11px] font-bold font-mono uppercase tracking-wider">
                  <th className="py-3 px-4">Tipo de Obra</th>
                  <th className="py-3 px-3">Descrição Técnica</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {obraTypes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-zinc-500 font-mono text-xs">
                      Nenhum tipo de obra cadastrado. Clique no botão "+ Cadastrar Tipo de Obra" para adicionar.
                    </td>
                  </tr>
                ) : (
                  obraTypes
                    .filter((ot) => !searchTerm || ot.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((ot) => (
                      <tr key={ot.id} className="hover:bg-zinc-900/60 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-zinc-100">{ot.name}</td>
                        <td className="py-3.5 px-3 text-zinc-300">{ot.description}</td>
                        <td className="py-3.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => onUpdateObraType({ ...ot, status: ot.status === 'Ativo' ? 'Inativo' : 'Ativo' })}
                            className={`px-2.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                              ot.status === 'Ativo'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                            }`}
                          >
                            {ot.status}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => {
                                setEditingObraType(ot);
                                setOtName(ot.name);
                                setOtDesc(ot.description);
                              }}
                              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-blue-600 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteObraType(ot.id)}
                              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-600 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Cadastrar / Editar Fornecedor */}
      {showAddSupplierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans">
          <div className="w-full max-w-md rounded-2xl bg-zinc-950 border border-zinc-800 p-6 space-y-4 text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100 font-mono flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-purple-400" />
                <span>{editingSupplier ? `Editar Fornecedor — ${editingSupplier.razaoSocial}` : 'Cadastrar Novo Fornecedor'}</span>
              </h3>
              <button onClick={() => { setShowAddSupplierModal(false); setEditingSupplier(null); }} className="text-zinc-400 hover:text-zinc-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-4">
              <div>
                <label className="text-zinc-300 font-semibold block mb-1">Razão Social / Nome da Empresa</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Postes Tocantins Indústria Ltda..."
                  value={supRazao}
                  onChange={(e) => setSupRazao(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Nome Fantasia</label>
                  <input
                    type="text"
                    placeholder="Postes TO"
                    value={supFantasia}
                    onChange={(e) => setSupFantasia(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">CNPJ / CPF</label>
                  <input
                    type="text"
                    required
                    placeholder="00.000.000/0001-00"
                    value={supCnpj}
                    onChange={(e) => setSupCnpj(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-300 font-semibold block mb-1">Categoria de Fornecimento</label>
                <select
                  value={supCategory}
                  onChange={(e) => setSupCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs font-semibold"
                >
                  <option value="Postes & Concretagem">Postes & Concretagem</option>
                  <option value="Fios & Condutores Elétricos">Fios & Condutores Elétricos</option>
                  <option value="Transformadores & Subestações">Transformadores & Subestações</option>
                  <option value="Equipamentos EPI & EPC">Equipamentos EPI & EPC</option>
                  <option value="Locação de Caminhões Munck / Guindaste">Locação de Caminhões Munck / Guindaste</option>
                  <option value="Empreiteira de Mão de Obra">Empreiteira de Mão de Obra</option>
                  <option value="Combustíveis & Lubrificantes">Combustíveis & Lubrificantes</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Pessoa de Contato / Vendedor</label>
                  <input
                    type="text"
                    placeholder="Ex: Carlos Silva"
                    value={supContact}
                    onChange={(e) => setSupContact(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="(63) 98888-7777"
                    value={supPhone}
                    onChange={(e) => setSupPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">E-mail Comercial</label>
                  <input
                    type="email"
                    placeholder="vendas@fornecedor.com.br"
                    value={supEmail}
                    onChange={(e) => setSupEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Cidade - UF</label>
                  <input
                    type="text"
                    placeholder="Palmas - TO"
                    value={supCityState}
                    onChange={(e) => setSupCityState(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => { setShowAddSupplierModal(false); setEditingSupplier(null); }}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-400 font-semibold hover:text-zinc-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  {editingSupplier ? 'Salvar Alterações' : 'Salvar Fornecedor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Cadastrar / Editar Usuário & Seleção de Módulos */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans">
          <div className="w-full max-w-lg rounded-2xl bg-zinc-950 border border-zinc-800 p-6 space-y-4 text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100 font-mono flex items-center space-x-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>{editingUser ? `Editar Usuário — ${editingUser.name}` : 'Cadastrar Novo Usuário / Perfil'}</span>
              </h3>
              <button onClick={() => { setShowAddUserModal(false); setEditingUser(null); }} className="text-zinc-400 hover:text-zinc-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="text-zinc-300 font-semibold block mb-1">Nome Completo do Colaborador</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João da Silva..."
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">E-mail de Login</label>
                  <input
                    type="email"
                    required
                    placeholder="joao@empresa.com.br"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Perfil Base (Cargo)</label>
                  <select
                    value={userRole}
                    onChange={(e) => handleRoleChangeInForm(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs font-semibold"
                  >
                    <option value="Diretor">Diretor (Acesso Total)</option>
                    <option value="Engenheiro">Engenheiro / Fiscal</option>
                    <option value="Financeiro">Financeiro / Contador</option>
                    <option value="Almoxarifado">Almoxarife / Logística</option>
                    <option value="Administrador">Administrador</option>
                  </select>
                </div>
              </div>

              {/* Módulos do Sistema que o usuário pode acessar */}
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="font-bold text-zinc-200 font-mono flex items-center space-x-1.5">
                    <Lock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Módulos que este perfil pode acessar:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setUserAllowedModules(
                        userAllowedModules.length === ALL_SYSTEM_MODULES.length
                          ? []
                          : ALL_SYSTEM_MODULES.map((m) => m.id)
                      )
                    }
                    className="text-[10px] font-mono text-indigo-400 hover:underline"
                  >
                    {userAllowedModules.length === ALL_SYSTEM_MODULES.length ? 'Desmarcar Todos' : 'Marcar Todos'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  {ALL_SYSTEM_MODULES.map((mod) => {
                    const isChecked = userAllowedModules.includes(mod.id);
                    return (
                      <label
                        key={mod.id}
                        onClick={() => toggleModulePermission(mod.id)}
                        className={`p-2 rounded-lg border text-xs font-semibold flex items-center space-x-2 cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 font-bold'
                            : 'bg-zinc-950/50 border-zinc-800 text-zinc-500'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>{mod.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">CPF</label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={userCpf}
                    onChange={(e) => setUserCpf(maskCpfCnpj(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="(00) 90000-0000"
                    value={userPhone}
                    onChange={(e) => setUserPhone(maskPhone(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-300 font-semibold block mb-1">Senha Inicial de Acesso</label>
                <input
                  type="password"
                  required
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs font-mono"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => { setShowAddUserModal(false); setEditingUser(null); }}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-400 font-semibold hover:text-zinc-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  {editingUser ? 'Salvar Alterações' : 'Salvar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Cadastrar / Editar Documento da Empresa */}
      {showAddDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans">
          <div className="w-full max-w-lg rounded-2xl bg-zinc-950 border border-zinc-800 p-6 space-y-4 text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100 font-mono flex items-center space-x-2">
                <FolderCheck className="w-4 h-4 text-emerald-400" />
                <span>{editingCompanyDoc ? `Editar Documento — ${editingCompanyDoc.title}` : 'Cadastrar / Anexar Documento da Empresa'}</span>
              </h3>
              <button onClick={() => { setShowAddDocModal(false); setEditingCompanyDoc(null); }} className="text-zinc-400 hover:text-zinc-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCompanyDoc} className="space-y-4">
              <div>
                <label className="text-zinc-300 font-semibold block mb-1">Título do Documento</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Certidão Negativa de Débitos Federais..."
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Categoria Principal</label>
                  <select
                    value={docGroup}
                    onChange={(e) => setDocGroup(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs"
                  >
                    <option value="Empresa">Empresa</option>
                    <option value="Certidões">Certidões</option>
                    <option value="Contábil">Contábil</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Tipo de Documento</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs"
                  >
                    <option value="CNPJ">CNPJ</option>
                    <option value="Contrato Social">Contrato Social</option>
                    <option value="Alterações Contratuais">Alterações Contratuais</option>
                    <option value="Inscrição Estadual">Inscrição Estadual</option>
                    <option value="Inscrição Municipal">Inscrição Municipal</option>
                    <option value="Alvará">Alvará</option>
                    <option value="Receita Federal">Receita Federal</option>
                    <option value="Dívida Ativa da União">Dívida Ativa da União</option>
                    <option value="FGTS">FGTS</option>
                    <option value="CNDT">CNDT</option>
                    <option value="Estadual">Estadual</option>
                    <option value="Municipal">Municipal</option>
                    <option value="Falência">Falência</option>
                    <option value="INSS">INSS</option>
                    <option value="Balanço">Balanço</option>
                    <option value="CREA Empresa">CREA Empresa</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Órgão Emissor</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Receita Federal..."
                    value={docIssuer}
                    onChange={(e) => setDocIssuer(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Data Emissão</label>
                  <input
                    type="date"
                    required
                    value={docIssueDate}
                    onChange={(e) => setDocIssueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Data Vencimento</label>
                  <input
                    type="date"
                    required
                    value={docExpiryDate}
                    onChange={(e) => setDocExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Link do Site Oficial de Emissão */}
              <div>
                <label className="text-zinc-300 font-semibold block mb-1 flex items-center justify-between">
                  <span>Site Oficial de Emissão da Certidão (Link do Órgão)</span>
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                </label>
                <input
                  type="url"
                  placeholder="Ex: https://solucoes.receita.fazenda.gov.br/..."
                  value={docIssuanceUrl}
                  onChange={(e) => setDocIssuanceUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-blue-400 text-xs font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-semibold block mb-1">Anexar PDF / Imagem Comprovante</label>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      setDocFileName(file.name);
                      setDocFileUrl(URL.createObjectURL(file));
                    }
                  }}
                  className="w-full text-xs text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => { setShowAddDocModal(false); setEditingCompanyDoc(null); }}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-400 font-semibold hover:text-zinc-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  {editingCompanyDoc ? 'Salvar Alterações' : 'Salvar Documento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Visualizador do Documento PDF da Empresa */}
      {previewCompanyDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans">
          <div className="w-full max-w-xl rounded-2xl bg-zinc-950 border border-zinc-800 p-6 space-y-4 text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-100 font-mono flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span>Visualização de Documento Autenticado</span>
                </h3>
                <p className="text-xs text-zinc-400">{previewCompanyDoc.title}</p>
              </div>
              <button onClick={() => setPreviewCompanyDoc(null)} className="text-zinc-400 hover:text-zinc-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
              <div className="flex justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-400">Tipo de Certidão:</span>
                <span className="font-bold text-zinc-200 font-mono">{previewCompanyDoc.codeOrType}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-400">Órgão Emissor:</span>
                <span className="font-semibold text-zinc-200">{previewCompanyDoc.issuer}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-400">Validade / Vencimento:</span>
                <span className="font-mono font-bold text-amber-400">{previewCompanyDoc.expiryDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-400">Site Oficial de Emissão:</span>
                <a
                  href={previewCompanyDoc.issuanceUrl || 'https://solucoes.receita.fazenda.gov.br/'}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-blue-400 hover:underline flex items-center space-x-1"
                >
                  <Globe className="w-3 h-3" />
                  <span>Acessar Portal do Órgão</span>
                </a>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-400">Nome do Arquivo:</span>
                <span className="font-mono text-zinc-300">{previewCompanyDoc.fileName}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-center font-bold font-mono">
              ✓ DOCUMENTO VERIFICADO E AUTENTICADO NO ERP PROOBRAS
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
              <button
                onClick={() => handleOpenIssuanceWebsite(previewCompanyDoc)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center space-x-1.5 cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Emitir Nova Certidão (Site)</span>
              </button>

              <button
                onClick={() => handleDownloadDoc(previewCompanyDoc)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center space-x-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Fazer Download</span>
              </button>

              <button
                onClick={() => handleShareWhatsAppDoc(previewCompanyDoc)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center space-x-1.5 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-white" />
                <span>Enviar no WhatsApp</span>
              </button>

              <button
                onClick={() => setPreviewCompanyDoc(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
