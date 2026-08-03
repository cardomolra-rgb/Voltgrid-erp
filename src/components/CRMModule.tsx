import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Building2,
  ExternalLink,
  FileText,
  DollarSign,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Copy,
  Trash2,
  Edit,
  Printer,
  Download,
  Share2,
  MessageSquare,
  ArrowUp,
  ArrowDown,
  History,
  FileCheck,
  HardHat,
  Check,
  X,
  FileSpreadsheet,
  QrCode,
  ShieldCheck,
  Send,
  Eye,
  ChevronRight,
  Filter,
} from 'lucide-react';
import {
  Client,
  Obra,
  SystemCompanyConfig,
  CommercialProposal,
  ProposalItem,
  ProposalCondition,
  ProposalHistoryLog,
  ProposalStatus,
  maskCpfCnpj,
  maskPhone,
} from '../types';
import { Tabs } from './ui/Tabs';

// CPF & CNPJ Validation Helper Function (Mathematical Check Digits)
const validateCpfCnpj = (value: string): { isValid: boolean; type: 'CPF' | 'CNPJ' | 'INV' | 'EMPTY' } => {
  const clean = value.replace(/\D/g, '');
  if (!clean) return { isValid: false, type: 'EMPTY' };

  if (clean.length === 11) {
    if (/^(\d)\1+$/.test(clean)) return { isValid: false, type: 'INV' };
    let sum = 0;
    let rev: number;
    for (let i = 1; i <= 9; i++) sum += parseInt(clean.substring(i - 1, i)) * (11 - i);
    rev = (sum * 10) % 11;
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(clean.substring(9, 10))) return { isValid: false, type: 'INV' };
    sum = 0;
    for (let i = 1; i <= 10; i++) sum += parseInt(clean.substring(i - 1, i)) * (12 - i);
    rev = (sum * 10) % 11;
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(clean.substring(10, 11))) return { isValid: false, type: 'INV' };
    return { isValid: true, type: 'CPF' };
  }

  if (clean.length === 14) {
    if (/^(\d)\1+$/.test(clean)) return { isValid: false, type: 'INV' };
    let size = clean.length - 2;
    let numbers = clean.substring(0, size);
    const digits = clean.substring(size);
    let sum = 0;
    let pos = size - 7;
    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return { isValid: false, type: 'INV' };
    size = size + 1;
    numbers = clean.substring(0, size);
    sum = 0;
    pos = size - 7;
    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1))) return { isValid: false, type: 'CNPJ' };
    return { isValid: true, type: 'CNPJ' };
  }

  return { isValid: false, type: 'INV' };
};

// Portuguese Number to Words Helper for Currency
export function numberToWordsPT(val: number): string {
  if (isNaN(val) || val < 0) return '';
  if (val === 0) return 'zero reais';

  const units = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  const tens = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const hundreds = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

  const inteiros = Math.floor(val);
  const centavos = Math.round((val - inteiros) * 100);

  function convertGroup(n: number): string {
    if (n === 0) return '';
    if (n === 100) return 'cem';
    let res = '';
    const h = Math.floor(n / 100);
    const remainder = n % 100;
    if (h > 0) res += hundreds[h];
    if (remainder > 0) {
      if (res) res += ' e ';
      if (remainder < 20) {
        res += units[remainder];
      } else {
        const t = Math.floor(remainder / 10);
        const u = remainder % 10;
        res += tens[t];
        if (u > 0) res += ' e ' + units[u];
      }
    }
    return res;
  }

  let result = '';

  const milhoes = Math.floor((inteiros % 1000000000) / 1000000);
  const milhares = Math.floor((inteiros % 1000000) / 1000);
  const resto = inteiros % 1000;

  if (milhoes > 0) {
    result += (milhoes === 1 ? 'um milhão' : convertGroup(milhoes) + ' milhões');
  }

  if (milhares > 0) {
    if (result) result += ' e ';
    result += (milhares === 1 ? 'um mil' : convertGroup(milhares) + ' mil');
  }

  if (resto > 0) {
    if (result) result += ' e ';
    result += convertGroup(resto);
  }

  if (!result && inteiros > 0) {
    result = convertGroup(inteiros);
  }

  result += inteiros === 1 ? ' real' : ' reais';

  if (centavos > 0) {
    result += ' e ' + convertGroup(centavos) + (centavos === 1 ? ' centavo' : ' centavos');
  }

  return result.charAt(0).toUpperCase() + result.slice(1);
}

interface CRMModuleProps {
  initialTab?: 'propostas' | 'clientes';
  clients: Client[];
  obras: Obra[];
  onAddClient: (client: Client) => void;
  onUpdateClient?: (client: Client) => void;
  onDeleteClient?: (id: string) => void;
  companyConfig: SystemCompanyConfig;
  proposals?: CommercialProposal[];
  onSaveProposals?: (proposals: CommercialProposal[]) => void;
  userRole?: string;
  activeUserName?: string;
  onConvertProposalToObra?: (proposal: CommercialProposal) => void;
}

const DEFAULT_CONDITIONS: ProposalCondition = {
  executionTerm: '30 (trinta) dias úteis a contar do aceite e aprovação da Concessionária.',
  deliveryTerm: 'Início imediato após assinatura do contrato e emissão da ART.',
  paymentMethod: '30% de sinal no aceite, 40% na entrega dos materiais e 30% na finalização e energização.',
  warranty: '12 (doze) meses contra defeitos de fabricação de materiais e montagem eletromecânica.',
  validityDays: 15,
  companyResponsibilities:
    'Fornecimento de ART no CREA, profissionais qualificados (NR-10/NR-35), EPI/EPC e execução conforme normas ABNT e Concessionária.',
  clientResponsibilities:
    'Garantir livre acesso da equipe ao local da obra, disponibilizar ponto de água/energia e aprovação das licenças locais.',
};

export const CRMModule: React.FC<CRMModuleProps> = ({
  initialTab,
  clients,
  obras,
  onAddClient,
  onUpdateClient,
  onDeleteClient,
  companyConfig,
  proposals = [],
  onSaveProposals,
  userRole = 'Diretor',
  activeUserName = 'Engenheiro Responsável',
  onConvertProposalToObra,
}) => {
  const [activeTab, setActiveTab] = useState<'propostas' | 'clientes'>(initialTab || 'propostas');

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Proposal State
  const [proposalList, setProposalList] = useState<CommercialProposal[]>(proposals);
  const [searchProposalTerm, setSearchProposalTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Modal States
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [editingProposal, setEditingProposal] = useState<CommercialProposal | null>(null);
  const [previewProposal, setPreviewProposal] = useState<CommercialProposal | null>(null);
  const [historyProposal, setHistoryProposal] = useState<CommercialProposal | null>(null);

  // Proposal Form State
  const [formClientId, setFormClientId] = useState('');
  const [formClientName, setFormClientName] = useState('');
  const [formClientCpfCnpj, setFormClientCpfCnpj] = useState('');
  const [formClientPhone, setFormClientPhone] = useState('');
  const [formClientEmail, setFormClientEmail] = useState('');
  const [formClientAddress, setFormClientAddress] = useState('');
  const [formClientCity, setFormClientCity] = useState('');
  const [formClientState, setFormClientState] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formValidityDate, setFormValidityDate] = useState(
    new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]
  );
  const [formSellerName, setFormSellerName] = useState(activeUserName);
  const [formProposalType, setFormProposalType] = useState('Extensão RDU/RDR');
  const [formNotes, setFormNotes] = useState('');
  const [formStatus, setFormStatus] = useState<ProposalStatus>('Rascunho');

  // Dynamic Items Form State
  const [formItems, setFormItems] = useState<ProposalItem[]>([
    {
      id: `ITEM-1`,
      description: 'Execução de Rede de Distribuição Urbana (RDU) 13.8kV',
      unit: 'm',
      quantity: 500,
      unitPrice: 85,
      discount: 0,
      totalPrice: 42500,
    },
    {
      id: `ITEM-2`,
      description: 'Instalação de Transformador Trífasico 45 kVA 13.8kV/380V-220V',
      unit: 'un',
      quantity: 1,
      unitPrice: 12000,
      discount: 0,
      totalPrice: 12000,
    },
  ]);

  // Financial Totals Form State
  const [formFreight, setFormFreight] = useState<number>(0);
  const [formOtherExpenses, setFormOtherExpenses] = useState<number>(0);
  const [formTaxes, setFormTaxes] = useState<number>(0);

  // Conditions Form State
  const [formConditions, setFormConditions] = useState<ProposalCondition>(DEFAULT_CONDITIONS);

  // Attachments Form State
  const [formAttachments, setFormAttachments] = useState<Array<{ id: string; name: string; url?: string; type: string }>>([]);

  // Client Select Auto-fill Handler
  const handleSelectClientInForm = (clientId: string) => {
    setFormClientId(clientId);
    const selected = clients.find((c) => c.id === clientId);
    if (selected) {
      setFormClientName(selected.name);
      setFormClientCpfCnpj(selected.cpfCnpj);
      setFormClientPhone(selected.whatsapp || selected.phone);
      setFormClientEmail(selected.email);
      setFormClientAddress(selected.address);
      setFormClientCity(selected.city);
      setFormClientState(selected.state || 'SP');
    }
  };

  // Helper to Recalculate Proposal Totals
  const calculateTotals = (items: ProposalItem[], freight: number, other: number, taxes: number) => {
    const subtotal = items.reduce((acc, it) => acc + (it.quantity * it.unitPrice), 0);
    const discountTotal = items.reduce((acc, it) => acc + (it.discount || 0), 0);
    const totalValue = subtotal - discountTotal + freight + other + taxes;
    const totalValueInWords = numberToWordsPT(totalValue);
    return { subtotal, discountTotal, totalValue, totalValueInWords };
  };

  // Open Create Proposal Modal
  const handleOpenCreateModal = () => {
    setEditingProposal(null);
    setFormClientId('');
    setFormClientName('');
    setFormClientCpfCnpj('');
    setFormClientPhone('');
    setFormClientEmail('');
    setFormClientAddress('');
    setFormClientCity('Palmas');
    setFormClientState('TO');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormValidityDate(new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]);
    setFormSellerName(activeUserName);
    setFormProposalType('Extensão RDU/RDR');
    setFormNotes('Proposta sujeita a reajuste após vistoria técnica no local.');
    setFormStatus('Rascunho');
    setFormItems([
      {
        id: `ITEM-1`,
        description: 'Execução de Rede de Distribuição 13.8kV',
        unit: 'm',
        quantity: 300,
        unitPrice: 90,
        discount: 0,
        totalPrice: 27000,
      },
    ]);
    setFormFreight(0);
    setFormOtherExpenses(0);
    setFormTaxes(0);
    setFormConditions(DEFAULT_CONDITIONS);
    setFormAttachments([]);
    setShowProposalModal(true);
  };

  // Open Edit Proposal Modal
  const handleOpenEditModal = (prop: CommercialProposal) => {
    setEditingProposal(prop);
    setFormClientId(prop.clientId);
    setFormClientName(prop.clientName);
    setFormClientCpfCnpj(prop.clientCpfCnpj);
    setFormClientPhone(prop.clientPhone);
    setFormClientEmail(prop.clientEmail);
    setFormClientAddress(prop.clientAddress);
    setFormClientCity(prop.clientCity);
    setFormClientState(prop.clientState);
    setFormDate(prop.date);
    setFormValidityDate(prop.validityDate);
    setFormSellerName(prop.sellerName);
    setFormProposalType(prop.proposalType);
    setFormNotes(prop.notes);
    setFormStatus(prop.status);
    setFormItems(prop.items || []);
    setFormFreight(prop.freight || 0);
    setFormOtherExpenses(prop.otherExpenses || 0);
    setFormTaxes(prop.taxes || 0);
    setFormConditions(prop.conditions || DEFAULT_CONDITIONS);
    setFormAttachments(prop.attachments || []);
    setShowProposalModal(true);
  };

  // Save Proposal Handler
  const handleSaveProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formClientName.trim()) return;

    const { subtotal, discountTotal, totalValue, totalValueInWords } = calculateTotals(
      formItems,
      formFreight,
      formOtherExpenses,
      formTaxes
    );

    const nowIso = new Date().toISOString();
    const formattedDate = new Date().toLocaleDateString('pt-BR');

    if (editingProposal) {
      const nextVersionNum = (parseFloat(editingProposal.currentVersion.replace('v', '')) + 0.1).toFixed(1);
      const newLog: ProposalHistoryLog = {
        id: `LOG-${Date.now()}`,
        date: formattedDate,
        user: activeUserName,
        action: `Proposta editada (Status: ${formStatus}, Valor: R$ ${totalValue.toLocaleString('pt-BR')})`,
        version: `v${nextVersionNum}`,
      };

      const updatedProp: CommercialProposal = {
        ...editingProposal,
        clientId: formClientId,
        clientName: formClientName.trim(),
        clientCpfCnpj: formClientCpfCnpj.trim(),
        clientPhone: formClientPhone.trim(),
        clientEmail: formClientEmail.trim(),
        clientAddress: formClientAddress.trim(),
        clientCity: formClientCity.trim(),
        clientState: formClientState.trim(),
        date: formDate,
        validityDate: formValidityDate,
        sellerName: formSellerName.trim(),
        proposalType: formProposalType,
        items: formItems,
        subtotal,
        discountTotal,
        freight: formFreight,
        otherExpenses: formOtherExpenses,
        taxes: formTaxes,
        totalValue,
        totalValueInWords,
        conditions: formConditions,
        notes: formNotes,
        attachments: formAttachments,
        status: formStatus,
        history: [newLog, ...(editingProposal.history || [])],
        currentVersion: `v${nextVersionNum}`,
        updatedAt: nowIso,
      };

      const updatedList = proposalList.map((p) => (p.id === editingProposal.id ? updatedProp : p));
      setProposalList(updatedList);
      if (onSaveProposals) onSaveProposals(updatedList);
      setSaveMessage(`Proposta nº "${updatedProp.proposalNumber}" atualizada com sucesso!`);
    } else {
      const propNumStr = `PROP-${new Date().getFullYear()}-${String(proposalList.length + 1).padStart(3, '0')}`;
      const newLog: ProposalHistoryLog = {
        id: `LOG-${Date.now()}`,
        date: formattedDate,
        user: activeUserName,
        action: `Proposta criada como ${formStatus}`,
        version: 'v1.0',
      };

      const newProp: CommercialProposal = {
        id: `PROP-${Date.now()}`,
        proposalNumber: propNumStr,
        clientId: formClientId,
        clientName: formClientName.trim(),
        clientCpfCnpj: formClientCpfCnpj.trim(),
        clientPhone: formClientPhone.trim(),
        clientEmail: formClientEmail.trim(),
        clientAddress: formClientAddress.trim(),
        clientCity: formClientCity.trim(),
        clientState: formClientState.trim(),
        date: formDate,
        validityDate: formValidityDate,
        sellerName: formSellerName.trim(),
        proposalType: formProposalType,
        items: formItems,
        subtotal,
        discountTotal,
        freight: formFreight,
        otherExpenses: formOtherExpenses,
        taxes: formTaxes,
        totalValue,
        totalValueInWords,
        conditions: formConditions,
        notes: formNotes,
        attachments: formAttachments,
        status: formStatus,
        history: [newLog],
        currentVersion: 'v1.0',
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      const updatedList = [newProp, ...proposalList];
      setProposalList(updatedList);
      if (onSaveProposals) onSaveProposals(updatedList);
      setSaveMessage(`Nova Proposta Commercial "${newProp.proposalNumber}" criada com sucesso!`);
    }

    setShowProposalModal(false);
    setTimeout(() => setSaveMessage(null), 4000);
  };

  // Duplicate Proposal Handler
  const handleDuplicateProposal = (prop: CommercialProposal) => {
    const propNumStr = `PROP-${new Date().getFullYear()}-${String(proposalList.length + 1).padStart(3, '0')}`;
    const duplicated: CommercialProposal = {
      ...prop,
      id: `PROP-${Date.now()}`,
      proposalNumber: propNumStr,
      clientName: `${prop.clientName} (Cópia)`,
      status: 'Rascunho',
      currentVersion: 'v1.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [
        {
          id: `LOG-${Date.now()}`,
          date: new Date().toLocaleDateString('pt-BR'),
          user: activeUserName,
          action: `Proposta duplicada a partir de ${prop.proposalNumber}`,
          version: 'v1.0',
        },
      ],
    };
    const updated = [duplicated, ...proposalList];
    setProposalList(updated);
    if (onSaveProposals) onSaveProposals(updated);
    setSaveMessage(`Proposta duplicada com sucesso! Nova proposta: ${duplicated.proposalNumber}`);
    setTimeout(() => setSaveMessage(null), 4000);
  };

  // Delete Proposal Handler
  const handleDeleteProposal = (id: string) => {
    const updated = proposalList.filter((p) => p.id !== id);
    setProposalList(updated);
    if (onSaveProposals) onSaveProposals(updated);
    setSaveMessage('Proposta removida.');
    setTimeout(() => setSaveMessage(null), 4000);
  };

  // Send WhatsApp Proposal Handler
  const handleSendWhatsApp = (prop: CommercialProposal) => {
    const cleanPhone = prop.clientPhone.replace(/\D/g, '');
    const message = `👋 Olá, *${prop.clientName}*!

Segue os detalhes da nossa *Proposta Comercial nº ${prop.proposalNumber}*:

📌 *Tipo de Serviço:* ${prop.proposalType}
📅 *Data da Proposta:* ${prop.date}
⏱️ *Validade:* ${prop.validityDate}
💰 *Valor Total:* R$ ${prop.totalValue.toLocaleString('pt-BR')} (${prop.totalValueInWords})

📄 *Empresa:* ${companyConfig.razaoSocial || 'ProObras ERP - Gestão de Obras'}
📞 *Contato:* ${companyConfig.telefone} | ${companyConfig.email}

Permanecemos à disposição para sanar quaisquer dúvidas técnicas ou comerciais!

Atenciosamente,
*${prop.sellerName}*`;

    const encoded = encodeURIComponent(message);
    const targetUrl = cleanPhone ? `https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${encoded}` : `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(targetUrl, '_blank');
  };

  // Convert Proposal to Contract Handler
  const handleConvertToContract = (prop: CommercialProposal) => {
    const updated = proposalList.map((p) =>
      p.id === prop.id
        ? {
            ...p,
            status: 'Aprovada' as ProposalStatus,
            contractId: `CTR-${Date.now()}`,
            history: [
              {
                id: `LOG-${Date.now()}`,
                date: new Date().toLocaleDateString('pt-BR'),
                user: activeUserName,
                action: 'Proposta convertida em Contrato assinado!',
                version: p.currentVersion,
              },
              ...p.history,
            ],
          }
        : p
    );
    setProposalList(updated);
    if (onSaveProposals) onSaveProposals(updated);
    setSaveMessage(`Proposta ${prop.proposalNumber} convertida em Contrato e aprovada com sucesso!`);
    setTimeout(() => setSaveMessage(null), 4000);
  };

  // Item Table Manipulation Functions
  const handleAddItem = () => {
    const newItem: ProposalItem = {
      id: `ITEM-${Date.now()}`,
      description: 'Novo Serviço / Material',
      unit: 'un',
      quantity: 1,
      unitPrice: 100,
      discount: 0,
      totalPrice: 100,
    };
    setFormItems([...formItems, newItem]);
  };

  const handleUpdateItem = (index: number, field: keyof ProposalItem, val: any) => {
    const updated = [...formItems];
    const item = { ...updated[index], [field]: val };
    item.totalPrice = item.quantity * item.unitPrice - (item.discount || 0);
    updated[index] = item;
    setFormItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setFormItems(formItems.filter((_, i) => i !== index));
  };

  const handleDuplicateItem = (index: number) => {
    const itemToDup = formItems[index];
    const dup: ProposalItem = {
      ...itemToDup,
      id: `ITEM-${Date.now()}`,
      description: `${itemToDup.description} (Cópia)`,
    };
    const updated = [...formItems];
    updated.splice(index + 1, 0, dup);
    setFormItems(updated);
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === formItems.length - 1)) return;
    const updated = [...formItems];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setFormItems(updated);
  };

  // Calculated Totals Live State
  const calculated = calculateTotals(formItems, formFreight, formOtherExpenses, formTaxes);

  // Client Search in CRM tab
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientCpfCnpj, setClientCpfCnpj] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientCity, setClientCity] = useState('');

  const clientCpfVal = validateCpfCnpj(clientCpfCnpj);

  const handleOpenNewClientModal = () => {
    setEditingClient(null);
    setClientName('');
    setClientCpfCnpj('');
    setClientAddress('');
    setClientPhone('');
    setClientEmail('');
    setClientCity('');
    setShowAddClientModal(true);
  };

  const handleOpenEditClientModal = (client: Client) => {
    setEditingClient(client);
    setClientName(client.name);
    setClientCpfCnpj(client.cpfCnpj);
    setClientAddress(client.address || '');
    setClientPhone(client.phone || client.whatsapp || '');
    setClientEmail(client.email || '');
    setClientCity(client.city || '');
    setShowAddClientModal(true);
  };

  const handleAddClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClient && onUpdateClient) {
      const updatedC: Client = {
        ...editingClient,
        name: clientName,
        cpfCnpj: clientCpfCnpj,
        contactPerson: clientName,
        phone: clientPhone,
        whatsapp: clientPhone,
        email: clientEmail,
        address: clientAddress,
        city: clientCity,
      };
      onUpdateClient(updatedC);
    } else {
      const newC: Client = {
        id: `CLI-00${clients.length + 1}`,
        name: clientName,
        cpfCnpj: clientCpfCnpj,
        rgIe: 'Isento / N/I',
        contactPerson: clientName,
        phone: clientPhone,
        whatsapp: clientPhone,
        email: clientEmail,
        address: clientAddress,
        city: clientCity,
        state: 'TO',
        zipCode: '77000-000',
        lat: -10.1844,
        lng: -48.3336,
        createdAt: new Date().toISOString().split('T')[0],
        activeProjectsCount: 0,
      };
      onAddClient(newC);
    }
    setShowAddClientModal(false);
    setEditingClient(null);
    setClientName('');
    setClientCpfCnpj('');
    setClientAddress('');
    setClientPhone('');
    setClientEmail('');
    setClientCity('');
  };

  // Filtered Proposals
  const filteredProposals = proposalList.filter((p) => {
    const matchesSearch =
      !searchProposalTerm ||
      p.proposalNumber.toLowerCase().includes(searchProposalTerm.toLowerCase()) ||
      p.clientName.toLowerCase().includes(searchProposalTerm.toLowerCase()) ||
      p.clientCpfCnpj.includes(searchProposalTerm);
    const matchesStatus = statusFilter === 'TODOS' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Dashboard View (Hidden when printing preview proposal) */}
      <div className="space-y-6 print:hidden">
      {/* Top Banner Navigation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-zinc-100 font-mono flex items-center space-x-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <span>Módulo de Propostas Comerciais & Orçamentos de Energia</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Criação, edição, cálculo por extenso, versão em PDF A4, histórico de alterações e envio direto pelo WhatsApp.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {activeTab === 'propostas' && (
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-amber-950 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Nova Proposta Comercial</span>
            </button>
          )}

          {activeTab === 'clientes' && (
            <button
              onClick={() => setShowAddClientModal(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-2 shadow-md cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Cadastrar Novo Cliente</span>
            </button>
          )}
        </div>
      </div>

      {/* Notification Banner */}
      {saveMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{saveMessage}</span>
          </div>
          <button onClick={() => setSaveMessage(null)} className="text-emerald-400 hover:text-emerald-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <Tabs
        items={[
          { id: 'propostas', label: 'Propostas Comerciais', icon: <FileText className="w-4 h-4" />, badge: proposalList.length },
          { id: 'clientes', label: 'Gestão de Clientes & CRM', icon: <Users className="w-4 h-4" />, badge: clients.length },
        ]}
        activeId={activeTab}
        onChange={(id) => setActiveTab(id as 'propostas' | 'clientes')}
      />

      {/* TAB 1: PROPOSTAS COMERCIAIS */}
      {activeTab === 'propostas' && (
        <div className="space-y-6 font-sans">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 font-mono uppercase tracking-wider">Total de Propostas</span>
              <p className="text-2xl font-extrabold text-zinc-100 font-mono">{proposalList.length}</p>
              <p className="text-[11px] text-zinc-500">Histórico de orçamentos gerados</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900 border border-amber-500/30 bg-amber-500/5 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-amber-400 font-mono uppercase tracking-wider">Em Negociação / Enviadas</span>
              <p className="text-2xl font-extrabold text-amber-400 font-mono">
                R${' '}
                {proposalList
                  .filter((p) => p.status === 'Enviada' || p.status === 'Em negociação')
                  .reduce((acc, p) => acc + p.totalValue, 0)
                  .toLocaleString('pt-BR')}
              </p>
              <p className="text-[11px] text-zinc-400">
                {proposalList.filter((p) => p.status === 'Enviada' || p.status === 'Em negociação').length} proposta(s) aguardando aceite
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900 border border-emerald-500/30 bg-emerald-500/5 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-emerald-400 font-mono uppercase tracking-wider">Propostas Aprovadas</span>
              <p className="text-2xl font-extrabold text-emerald-400 font-mono">
                R${' '}
                {proposalList
                  .filter((p) => p.status === 'Aprovada')
                  .reduce((acc, p) => acc + p.totalValue, 0)
                  .toLocaleString('pt-BR')}
              </p>
              <p className="text-[11px] text-zinc-400">Prontas para contrato / execução</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900 border border-rose-500/30 bg-rose-500/5 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-rose-400 font-mono uppercase tracking-wider">Reprovadas / Canceladas</span>
              <p className="text-2xl font-extrabold text-rose-400 font-mono">
                {proposalList.filter((p) => p.status === 'Reprovada' || p.status === 'Cancelada').length}
              </p>
              <p className="text-[11px] text-zinc-500">Propostas arquivadas</p>
            </div>
          </div>

          {/* Search & Status Filters */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Pesquisar por número, cliente, CPF/CNPJ ou valor..."
                  value={searchProposalTerm}
                  onChange={(e) => setSearchProposalTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-sans"
                />
              </div>

              {/* Status Filter buttons */}
              <div className="flex items-center space-x-1.5 overflow-x-auto">
                {['TODOS', 'Rascunho', 'Enviada', 'Em negociação', 'Aprovada', 'Reprovada', 'Cancelada'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold font-mono transition-all cursor-pointer ${
                      statusFilter === st
                        ? 'bg-amber-500 text-zinc-950 font-extrabold shadow-sm'
                        : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Proposals Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 text-[11px] font-bold font-mono uppercase tracking-wider">
                    <th className="py-3 px-4">Número / Versão</th>
                    <th className="py-3 px-3">Cliente / CNPJ</th>
                    <th className="py-3 px-3">Data / Validade</th>
                    <th className="py-3 px-3">Valor Total (R$)</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-sans">
                  {filteredProposals.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-zinc-500 font-mono text-xs">
                        Nenhuma proposta encontrada. Clique no botão "+ Nova Proposta Comercial" para criar a primeira proposta.
                      </td>
                    </tr>
                  ) : (
                    filteredProposals.map((prop) => (
                      <tr key={prop.id} className="hover:bg-zinc-900/60 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-zinc-100">
                          <div className="flex items-center space-x-2 font-mono">
                            <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>{prop.proposalNumber}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                              {prop.currentVersion}
                            </span>
                          </div>
                          <div className="text-[10px] text-zinc-400 font-sans font-normal mt-0.5">{prop.proposalType}</div>
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="font-semibold text-zinc-200">{prop.clientName}</div>
                          <div className="text-[10px] font-mono text-zinc-400">{prop.clientCpfCnpj}</div>
                        </td>

                        <td className="py-3.5 px-3 font-mono text-zinc-300">
                          <div>{prop.date}</div>
                          <div className="text-[10px] text-amber-400">Val: {prop.validityDate}</div>
                        </td>

                        <td className="py-3.5 px-3 font-mono font-bold text-emerald-400">
                          R$ {prop.totalValue.toLocaleString('pt-BR')}
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          <span
                            className={`px-2.5 py-1 rounded text-[10px] font-bold font-mono border ${
                              prop.status === 'Aprovada'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : prop.status === 'Enviada' || prop.status === 'Em negociação'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : prop.status === 'Rascunho'
                                ? 'bg-zinc-800 text-zinc-400 border-zinc-700'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            }`}
                          >
                            {prop.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            {/* Action: Visualizar PDF A4 */}
                            <button
                              onClick={() => setPreviewProposal(prop)}
                              title="Visualizar Proposta / Impressão A4"
                              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-amber-500 text-zinc-400 hover:text-zinc-950 border border-zinc-800 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Action: Editar */}
                            <button
                              onClick={() => handleOpenEditModal(prop)}
                              title="Editar Proposta"
                              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-blue-600 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* Action: Duplicar */}
                            <button
                              onClick={() => handleDuplicateProposal(prop)}
                              title="Duplicar Proposta"
                              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-indigo-600 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            {/* Action: WhatsApp */}
                            <button
                              onClick={() => handleSendWhatsApp(prop)}
                              title="Enviar via WhatsApp"
                              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-emerald-500 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                            </button>

                            {/* Action: Converter em Contrato */}
                            {prop.status !== 'Aprovada' && (
                              <button
                                onClick={() => handleConvertToContract(prop)}
                                title="Aprovar e Converter em Contrato"
                                className="px-2 py-1 rounded-lg bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/20 text-[10px] font-bold flex items-center space-x-1 cursor-pointer transition-all"
                              >
                                <FileCheck className="w-3 h-3" />
                                <span className="hidden xl:inline">Contrato</span>
                              </button>
                            )}

                            {/* Action: Converter em Nova Obra */}
                            {prop.status === 'Aprovada' && onConvertProposalToObra && (
                              <button
                                onClick={() => onConvertProposalToObra(prop)}
                                title="Converter Proposta Aprovada em Nova Obra Ativa"
                                className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 text-[10px] font-bold flex items-center space-x-1 cursor-pointer transition-all"
                              >
                                <HardHat className="w-3 h-3" />
                                <span>⚡ Criar Obra</span>
                              </button>
                            )}

                            {/* Action: Ver Histórico / Versões */}
                            <button
                              onClick={() => setHistoryProposal(prop)}
                              title="Histórico de Edições e Versões"
                              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-purple-600 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
                            >
                              <History className="w-3.5 h-3.5" />
                            </button>

                            {/* Action: Excluir */}
                            {userRole !== 'Financeiro' && (
                              <button
                                onClick={() => handleDeleteProposal(prop.id)}
                                title="Excluir Proposta"
                                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-600 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
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

      {/* TAB 2: GESTÃO DE CLIENTES & CRM */}
      {activeTab === 'clientes' && (
        <div className="space-y-6 font-sans">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative max-w-md w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar por Razão Social, CNPJ ou Cidade..."
                value={clientSearchTerm}
                onChange={(e) => setClientSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-sans"
              />
            </div>

            <button
              onClick={handleOpenNewClientModal}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ Cadastrar Cliente</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clients
              .filter(
                (c) =>
                  c.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
                  c.cpfCnpj.includes(clientSearchTerm) ||
                  c.city.toLowerCase().includes(clientSearchTerm.toLowerCase())
              )
              .map((client) => {
                const clientProposals = proposalList.filter((p) => p.clientId === client.id);
                const totalPropsVal = clientProposals.reduce((acc, p) => acc + p.totalValue, 0);

                return (
                  <div
                    key={client.id}
                    className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm space-y-4 hover:border-zinc-700 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-[10px] text-amber-400 font-bold">{client.id}</span>
                        <h3 className="text-sm font-semibold text-zinc-100 mt-0.5">{client.name}</h3>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <p className="text-xs text-zinc-400 font-mono">CNPJ/CPF: {client.cpfCnpj}</p>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                        {clientProposals.length} Proposta(s)
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-zinc-300 bg-zinc-950 p-3.5 rounded-xl border border-zinc-800/80">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>
                          Endereço: <strong className="text-zinc-100">{client.address || 'Não Informado'}</strong> ({client.city}/{client.state})
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="font-semibold text-emerald-400 font-mono">WhatsApp: {client.whatsapp || client.phone}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span className="truncate">{client.email}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs gap-2 flex-wrap">
                      <div>
                        <span className="text-zinc-400 text-[10px] block">Total Orçado:</span>
                        <span className="font-bold text-zinc-100 font-mono">
                          R$ {totalPropsVal.toLocaleString('pt-BR')}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => {
                            handleOpenCreateModal();
                            handleSelectClientInForm(client.id);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-[11px] flex items-center space-x-1 cursor-pointer transition-all"
                          title="Criar nova proposta comercial para este cliente"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Proposta</span>
                        </button>

                        <button
                          onClick={() => handleOpenEditClientModal(client)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-blue-600 text-zinc-400 hover:text-white border border-zinc-700 transition-colors"
                          title="Editar Cadastro do Cliente"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {onDeleteClient && (
                          <button
                            onClick={() => onDeleteClient(client.id)}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-600 text-zinc-400 hover:text-white border border-zinc-700 transition-colors"
                            title="Excluir Cliente"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
      </div>

      {/* MODAL: CRIAR OU EDITAR PROPOSTA COMERCIAL */}
      {showProposalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans overflow-y-auto">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-zinc-950 border border-zinc-800 p-6 space-y-6 text-xs shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-100 font-mono flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>{editingProposal ? `Editar Proposta Comercial — ${editingProposal.proposalNumber}` : 'Nova Proposta Comercial'}</span>
                </h3>
                <p className="text-xs text-zinc-400">Preencha os dados abaixo. Os valores e extensão serão calculados automaticamente.</p>
              </div>
              <button onClick={() => setShowProposalModal(false)} className="text-zinc-400 hover:text-zinc-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProposal} className="space-y-6">
              {/* SECTION 1: Dados da Empresa (Auto-fetched preview) */}
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                <span className="font-bold text-amber-400 font-mono text-xs block uppercase">🏢 Dados da Minha Empresa (Emitente da Proposta)</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-zinc-300">
                  <div>Razão Social: <strong className="text-zinc-100 block">{companyConfig.razaoSocial}</strong></div>
                  <div>CNPJ: <strong className="text-zinc-100 font-mono block">{companyConfig.cnpj}</strong></div>
                  <div>Contato: <strong className="text-zinc-100 block">{companyConfig.telefone}</strong></div>
                  <div>Cidade/UF: <strong className="text-zinc-100 block">{companyConfig.cidade}/{companyConfig.estado}</strong></div>
                </div>
              </div>

              {/* SECTION 2: Seleção e Dados do Cliente */}
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="font-bold text-blue-400 font-mono text-xs">👤 Cliente & Destinatário</span>
                  <select
                    value={formClientId}
                    onChange={(e) => handleSelectClientInForm(e.target.value)}
                    className="px-3 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs font-semibold"
                  >
                    <option value="">-- Selecionar Cliente Cadastrado --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.cpfCnpj})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">Nome / Razão Social do Cliente</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Concessionária de Energia S.A."
                      value={formClientName}
                      onChange={(e) => setFormClientName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">CPF / CNPJ</label>
                    <input
                      type="text"
                      required
                      placeholder="00.000.000/0001-00"
                      value={formClientCpfCnpj}
                      onChange={(e) => setFormClientCpfCnpj(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">Telefone / WhatsApp</label>
                    <input
                      type="text"
                      placeholder="(63) 99999-8888"
                      value={formClientPhone}
                      onChange={(e) => setFormClientPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">E-mail do Cliente</label>
                    <input
                      type="email"
                      placeholder="contato@cliente.com"
                      value={formClientEmail}
                      onChange={(e) => setFormClientEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">Endereço da Obra / Local</label>
                    <input
                      type="text"
                      placeholder="Av. Teotônio Segurado, KM 05"
                      value={formClientAddress}
                      onChange={(e) => setFormClientAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">Cidade / UF</label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Palmas"
                        value={formClientCity}
                        onChange={(e) => setFormClientCity(e.target.value)}
                        className="w-2/3 px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="TO"
                        maxLength={2}
                        value={formClientState}
                        onChange={(e) => setFormClientState(e.target.value.toUpperCase())}
                        className="w-1/3 px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Informações da Proposta */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Data da Proposta</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Validade do Orçamento</label>
                  <input
                    type="date"
                    required
                    value={formValidityDate}
                    onChange={(e) => setFormValidityDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Responsável / Vendedor</label>
                  <input
                    type="text"
                    required
                    value={formSellerName}
                    onChange={(e) => setFormSellerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Status Inicial</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs font-bold"
                  >
                    <option value="Rascunho">Rascunho</option>
                    <option value="Enviada">Enviada</option>
                    <option value="Em negociação">Em negociação</option>
                    <option value="Aprovada">Aprovada</option>
                    <option value="Reprovada">Reprovada</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                </div>
              </div>

              {/* SECTION 4: Tabela Dinâmica de Itens */}
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <div>
                    <span className="font-bold text-amber-400 font-mono text-xs">📋 Itens e Serviços da Proposta</span>
                    <p className="text-[10px] text-zinc-400">Digite qualquer descrição manualmente (serviços, materiais, transformadores, mão de obra).</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Item</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-400 text-[10px] font-mono uppercase">
                        <th className="py-2 px-2 w-12 text-center">Nº</th>
                        <th className="py-2 px-2">Descrição do Serviço / Material</th>
                        <th className="py-2 px-2 w-20">Unid.</th>
                        <th className="py-2 px-2 w-24">Qtd.</th>
                        <th className="py-2 px-2 w-28">Valor Unit. (R$)</th>
                        <th className="py-2 px-2 w-24">Desc. (R$)</th>
                        <th className="py-2 px-2 w-28 text-right">Total (R$)</th>
                        <th className="py-2 px-2 w-24 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {formItems.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-zinc-950/50">
                          <td className="py-2 px-2 text-center font-mono font-bold text-zinc-400">{idx + 1}</td>

                          <td className="py-2 px-2">
                            <input
                              type="text"
                              required
                              value={item.description}
                              onChange={(e) => handleUpdateItem(idx, 'description', e.target.value)}
                              placeholder="Ex: Instalação de Transformador 45 kVA..."
                              className="w-full px-2.5 py-1.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs"
                            />
                          </td>

                          <td className="py-2 px-2">
                            <select
                              value={item.unit}
                              onChange={(e) => handleUpdateItem(idx, 'unit', e.target.value)}
                              className="w-full px-2 py-1.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs font-mono"
                            >
                              <option value="m">m</option>
                              <option value="un">un</option>
                              <option value="km">km</option>
                              <option value="cj">cj</option>
                              <option value="sv">sv</option>
                              <option value="vg">vg</option>
                              <option value="kg">kg</option>
                            </select>
                          </td>

                          <td className="py-2 px-2">
                            <input
                              type="number"
                              min={1}
                              step="any"
                              value={item.quantity}
                              onChange={(e) => handleUpdateItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                              className="w-full px-2 py-1.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs font-mono"
                            />
                          </td>

                          <td className="py-2 px-2">
                            <input
                              type="number"
                              min={0}
                              step="any"
                              value={item.unitPrice}
                              onChange={(e) => handleUpdateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                              className="w-full px-2 py-1.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs font-mono"
                            />
                          </td>

                          <td className="py-2 px-2">
                            <input
                              type="number"
                              min={0}
                              step="any"
                              value={item.discount || 0}
                              onChange={(e) => handleUpdateItem(idx, 'discount', parseFloat(e.target.value) || 0)}
                              className="w-full px-2 py-1.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs font-mono text-amber-400"
                            />
                          </td>

                          <td className="py-2 px-2 text-right font-mono font-bold text-emerald-400">
                            R$ {(item.quantity * item.unitPrice - (item.discount || 0)).toLocaleString('pt-BR')}
                          </td>

                          <td className="py-2 px-2 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <button
                                type="button"
                                onClick={() => handleMoveItem(idx, 'up')}
                                title="Mover para cima"
                                className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveItem(idx, 'down')}
                                title="Mover para baixo"
                                className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDuplicateItem(idx)}
                                title="Duplicar Item"
                                className="p-1 rounded hover:bg-indigo-600 text-zinc-400 hover:text-white"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
                                title="Remover Item"
                                className="p-1 rounded hover:bg-rose-600 text-zinc-400 hover:text-white"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 5: Cálculo Automático & Valor por Extenso */}
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3 font-mono">
                <span className="font-bold text-emerald-400 text-xs block">💰 Resumo Financeiro da Proposta</span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="text-zinc-400 block mb-1">Subtotal de Itens:</label>
                    <div className="p-2 rounded bg-zinc-950 border border-zinc-800 text-zinc-200 font-bold">
                      R$ {calculated.subtotal.toLocaleString('pt-BR')}
                    </div>
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Frete / Logística (R$):</label>
                    <input
                      type="number"
                      min={0}
                      value={formFreight}
                      onChange={(e) => setFormFreight(parseFloat(e.target.value) || 0)}
                      className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Outras Despesas (R$):</label>
                    <input
                      type="number"
                      min={0}
                      value={formOtherExpenses}
                      onChange={(e) => setFormOtherExpenses(parseFloat(e.target.value) || 0)}
                      className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Impostos / Tributos (R$):</label>
                    <input
                      type="number"
                      min={0}
                      value={formTaxes}
                      onChange={(e) => setFormTaxes(parseFloat(e.target.value) || 0)}
                      className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-zinc-100"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-extrabold text-emerald-400 block">TOTAL GERAL DA PROPOSTA</span>
                    <span className="text-[11px] text-zinc-300 font-sans italic">
                      Valor Por Extenso: <strong className="text-emerald-300">{calculated.totalValueInWords}</strong>
                    </span>
                  </div>
                  <div className="text-xl font-extrabold text-emerald-400">
                    R$ {calculated.totalValue.toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>

              {/* SECTION 6: Condições Comerciais */}
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="font-bold text-amber-400 font-mono text-xs">📝 Condições Comerciais & Cláusulas</span>
                  <button
                    type="button"
                    onClick={() => setFormConditions(DEFAULT_CONDITIONS)}
                    className="text-[10px] font-mono text-amber-400 hover:underline"
                  >
                    Restaurar Modelo Padrão
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">Prazo de Execução</label>
                    <input
                      type="text"
                      value={formConditions.executionTerm}
                      onChange={(e) => setFormConditions({ ...formConditions, executionTerm: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">Prazo de Entrega / Início</label>
                    <input
                      type="text"
                      value={formConditions.deliveryTerm}
                      onChange={(e) => setFormConditions({ ...formConditions, deliveryTerm: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">Forma de Pagamento</label>
                    <input
                      type="text"
                      value={formConditions.paymentMethod}
                      onChange={(e) => setFormConditions({ ...formConditions, paymentMethod: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">Garantia Oferecida</label>
                    <input
                      type="text"
                      value={formConditions.warranty}
                      onChange={(e) => setFormConditions({ ...formConditions, warranty: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-zinc-300 font-semibold block mb-1">Responsabilidades da Empresa</label>
                    <textarea
                      rows={2}
                      value={formConditions.companyResponsibilities}
                      onChange={(e) => setFormConditions({ ...formConditions, companyResponsibilities: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-zinc-300 font-semibold block mb-1">Responsabilidades do Cliente</label>
                    <textarea
                      rows={2}
                      value={formConditions.clientResponsibilities}
                      onChange={(e) => setFormConditions({ ...formConditions, clientResponsibilities: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 7: Observações */}
              <div>
                <label className="text-zinc-300 font-semibold block mb-1">Observações Finais (Campo Livre)</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Instruções para vistoria, detalhes de projeto ou restrições de horário..."
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowProposalModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-400 font-semibold hover:text-zinc-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-950 cursor-pointer"
                >
                  {editingProposal ? 'Salvar Alterações na Proposta' : 'Emitir Proposta Comercial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VISUALIZADOR DE PDF PROFISSIONAL A4 (IMPRESSÃO) */}
      {previewProposal && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-start bg-zinc-950/90 backdrop-blur-md p-4 sm:p-6 font-sans overflow-y-auto print:p-0 print:m-0 print:bg-white print:static print:h-auto print:w-full print:overflow-visible">
          <div className="w-full max-w-4xl rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden print:max-w-none print:bg-white print:text-black print:p-0 print:m-0 print:border-none print:shadow-none print:overflow-visible font-sans my-auto">
            {/* Modal Control Header (Hidden when printing) */}
            <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 p-4 print:hidden">
              <div className="flex items-center space-x-2">
                <Eye className="w-4.5 h-4.5 text-amber-400" />
                <span className="font-bold text-zinc-100 font-mono text-xs">
                  Proposta Comercial {previewProposal.proposalNumber} ({previewProposal.currentVersion})
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center space-x-2 shadow-md cursor-pointer transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir / Gerar PDF (A4)</span>
                </button>

                <button
                  onClick={() => handleSendWhatsApp(previewProposal)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-2 shadow-md cursor-pointer transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Enviar WhatsApp</span>
                </button>

                <button onClick={() => setPreviewProposal(null)} className="text-zinc-400 hover:text-zinc-100 p-1.5 rounded-lg bg-zinc-800">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* A4 PRINTABLE DOCUMENT SHEET (FULL PAGE FORMAT FIT) */}
            <div className="proposal-print-sheet bg-white text-zinc-950 font-sans p-8 sm:p-12 flex flex-col justify-between min-h-[280mm] print:min-h-[270mm] space-y-6 print:p-0 print:m-0 print:w-full print:shadow-none print:border-none">
              {/* TOP / BODY CONTENT CONTAINER */}
              <div className="space-y-5 flex-1">
                {/* PDF Header with Company Logo */}
                <div className="flex items-center justify-between border-b-2 pb-4" style={{ borderColor: companyConfig.primaryColor || '#18181b' }}>
                  <div className="flex items-center space-x-4">
                    {companyConfig.logoUrl ? (
                      <img
                        src={companyConfig.logoUrl}
                        alt="Logo Empresa"
                        className="h-16 max-w-[180px] object-contain shrink-0"
                      />
                    ) : (
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-white font-mono text-base shrink-0 shadow-md"
                        style={{ backgroundColor: companyConfig.primaryColor || '#2563eb' }}
                      >
                        {companyConfig.nomeFantasia?.substring(0, 2).toUpperCase() || 'PV'}
                      </div>
                    )}

                    <div className="space-y-0.5">
                      <h1 className="text-lg font-black text-zinc-950 font-mono tracking-tight uppercase leading-tight">
                        {companyConfig.razaoSocial || 'MOURA SOLUÇÕES ELÉTRICAS LTDA'}
                      </h1>
                      <p className="text-xs text-zinc-600 font-mono">
                        CNPJ: {companyConfig.cnpj} | CREA Jurídico: {companyConfig.creaJuridico}
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        {companyConfig.endereco} — {companyConfig.cidade}/{companyConfig.estado} | Tel: {companyConfig.telefone}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className="text-[10px] font-extrabold uppercase font-mono tracking-wider px-3 py-1 rounded-md text-white block mb-1 shadow-sm"
                      style={{ backgroundColor: companyConfig.primaryColor || '#2563eb' }}
                    >
                      PROPOSTA COMERCIAL
                    </span>
                    <span className="text-base font-black font-mono text-zinc-950 block">{previewProposal.proposalNumber}</span>
                    <span className="text-xs font-mono text-zinc-500">Versão: {previewProposal.currentVersion}</span>
                  </div>
                </div>

                {/* Proposal Metadata & Client Info (Structured Box) */}
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 grid grid-cols-2 gap-6 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase font-mono tracking-wider block border-b border-zinc-200 pb-1">
                      DADOS DO CLIENTE
                    </span>
                    <p className="font-bold text-zinc-950 text-sm">{previewProposal.clientName}</p>
                    <p className="text-zinc-700 font-mono">CPF/CNPJ: {previewProposal.clientCpfCnpj}</p>
                    <p className="text-zinc-700">Endereço: {previewProposal.clientAddress} ({previewProposal.clientCity}/{previewProposal.clientState})</p>
                    <p className="text-zinc-700">Contato: {previewProposal.clientPhone} | {previewProposal.clientEmail}</p>
                  </div>

                  <div className="space-y-1 text-right">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase font-mono tracking-wider block border-b border-zinc-200 pb-1">
                      DETALHES DO ORÇAMENTO
                    </span>
                    <p className="text-zinc-700">Data da Proposta: <strong className="font-mono text-zinc-950">{previewProposal.date}</strong></p>
                    <p className="text-zinc-700">Validade do Orçamento: <strong className="font-mono text-zinc-950">{previewProposal.validityDate}</strong></p>
                    <p className="text-zinc-700">Tipo de Serviço: <strong className="text-zinc-950">{previewProposal.proposalType}</strong></p>
                    <p className="text-zinc-700">Vendedor/Responsável: <strong className="text-zinc-950">{previewProposal.sellerName}</strong></p>
                  </div>
                </div>

                {/* Items Table */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-zinc-900 uppercase font-mono tracking-wider border-b-2 border-zinc-950 pb-1">
                    1. ITENS E ESPECIFICAÇÕES DOS SERVIÇOS
                  </h3>
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-zinc-100 text-zinc-900 font-mono uppercase text-[10px] border-y border-zinc-300">
                        <th className="py-2 px-3 text-center w-12">Item</th>
                        <th className="py-2 px-4">Descrição do Serviço / Material</th>
                        <th className="py-2 px-3 text-center w-16">Unid.</th>
                        <th className="py-2 px-3 text-center w-16">Qtd.</th>
                        <th className="py-2 px-4 text-right w-32">Valor Unit.</th>
                        <th className="py-2 px-4 text-right w-36">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      {previewProposal.items.map((it, idx) => (
                        <tr key={it.id} className="hover:bg-zinc-50">
                          <td className="py-2.5 px-3 text-center font-mono font-semibold text-zinc-500">{idx + 1}</td>
                          <td className="py-2.5 px-4 font-medium text-zinc-950">{it.description}</td>
                          <td className="py-2.5 px-3 text-center font-mono text-zinc-600">{it.unit}</td>
                          <td className="py-2.5 px-3 text-center font-mono text-zinc-950 font-bold">{it.quantity}</td>
                          <td className="py-2.5 px-4 text-right font-mono text-zinc-700">R$ {it.unitPrice.toLocaleString('pt-BR')}</td>
                          <td className="py-2.5 px-4 text-right font-mono font-black text-zinc-950">R$ {it.totalPrice.toLocaleString('pt-BR')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Total Box */}
                <div className="p-4 rounded-xl bg-zinc-900 text-white font-mono space-y-1 shadow-sm">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-black uppercase tracking-wider">TOTAL GERAL DA PROPOSTA COMERCIAL:</span>
                    <span className="text-xl font-black text-emerald-400">R$ {previewProposal.totalValue.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="text-xs text-zinc-300 font-sans italic pt-1 border-t border-zinc-800">
                    Valor Por Extenso: <strong className="text-amber-300">{previewProposal.totalValueInWords}</strong>
                  </div>
                </div>

                {/* Commercial Conditions & Warranties */}
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2 text-xs">
                  <h3 className="text-xs font-bold text-zinc-900 uppercase font-mono tracking-wider border-b border-zinc-200 pb-1">
                    2. CONDIÇÕES COMERCIAIS E GARANTIAS
                  </h3>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-zinc-800 text-xs">
                    <div>• Prazo de Execução: <strong>{previewProposal.conditions?.executionTerm}</strong></div>
                    <div>• Prazo de Entrega: <strong>{previewProposal.conditions?.deliveryTerm}</strong></div>
                    <div>• Forma de Pagamento: <strong>{previewProposal.conditions?.paymentMethod}</strong></div>
                    <div>• Garantia Técnica: <strong>{previewProposal.conditions?.warranty}</strong></div>
                    <div className="col-span-2">• Responsabilidades da Contratada: {previewProposal.conditions?.companyResponsibilities}</div>
                    <div className="col-span-2">• Responsabilidades do Contratante: {previewProposal.conditions?.clientResponsibilities}</div>
                  </div>
                </div>

                {/* Notes (if any) */}
                {previewProposal.notes && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-zinc-800">
                    <strong className="font-mono text-amber-900 block uppercase text-[10px] mb-0.5">Observações Finais:</strong>
                    <p className="leading-relaxed">{previewProposal.notes}</p>
                  </div>
                )}
              </div>

              {/* BOTTOM / FOOTER & SIGNATURES CONTAINER (Anchored to Page Bottom) */}
              <div className="space-y-6 pt-6 mt-auto border-t border-zinc-200">
                {/* Signatures & Acceptance */}
                <div className="grid grid-cols-2 gap-12 text-center text-xs pt-4">
                  <div>
                    <div className="border-b border-zinc-950 mb-1.5 pb-8"></div>
                    <span className="font-bold text-zinc-950 block">{companyConfig.razaoSocial}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">Emitente da Proposta</span>
                  </div>

                  <div>
                    <div className="border-b border-zinc-950 mb-1.5 pb-8"></div>
                    <span className="font-bold text-zinc-950 block">{previewProposal.clientName}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">De Acordo / Aceite do Cliente</span>
                  </div>
                </div>

                {/* PDF Footer Tagline */}
                <div className="text-center text-[9.5px] text-zinc-500 font-mono space-y-0.5 pt-2 border-t border-zinc-200">
                  <p className="font-bold text-zinc-700">ProObras ERP — Sistema Integrado de Gestão de Obras de Energia Elétrica e Distribuição</p>
                  <p>Agradecemos pela confiança. Este documento possui validade legal de {previewProposal.conditions?.validityDays || 15} dias corridos.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* MODAL: HISTÓRICO DE EDIÇÕES E VERSÕES */}
      {historyProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans">
          <div className="w-full max-w-lg rounded-2xl bg-zinc-950 border border-zinc-800 p-6 space-y-4 text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100 font-mono flex items-center space-x-2">
                <History className="w-4 h-4 text-purple-400" />
                <span>Histórico de Edições — Proposta {historyProposal.proposalNumber}</span>
              </h3>
              <button onClick={() => setHistoryProposal(null)} className="text-zinc-400 hover:text-zinc-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {historyProposal.history.map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400 font-mono text-[11px]">{log.version}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">{log.date}</span>
                  </div>
                  <p className="text-zinc-200 font-semibold">{log.action}</p>
                  <p className="text-[10px] text-zinc-400">Usuário: {log.user}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-zinc-800">
              <button onClick={() => setHistoryProposal(null)} className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-semibold">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CADASTRAR / EDITAR CLIENTE (CRM) */}
      {showAddClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans">
          <div className="w-full max-w-md rounded-2xl bg-zinc-950 border border-zinc-800 p-6 space-y-4 text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100 font-mono flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span>{editingClient ? `Editar Cliente — ${editingClient.id}` : 'Cadastrar Novo Cliente'}</span>
              </h3>
              <button onClick={() => setShowAddClientModal(false)} className="text-zinc-400 hover:text-zinc-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddClientSubmit} className="space-y-3">
              <div>
                <label className="text-zinc-300 font-semibold block mb-1">Razão Social / Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Concessionária de Energia Tocantins S.A."
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-semibold block mb-1">CNPJ / CPF</label>
                <input
                  type="text"
                  required
                  placeholder="00.000.000/0001-00 ou 000.000.000-00"
                  value={clientCpfCnpj}
                  onChange={(e) => setClientCpfCnpj(maskCpfCnpj(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    required
                    placeholder="(00) 90000-0000"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(maskPhone(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">E-mail</label>
                  <input
                    type="email"
                    required
                    placeholder="contato@empresa.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Endereço Completo</label>
                  <input
                    type="text"
                    placeholder="Quadra 104 Sul, Alameda 02"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Cidade</label>
                  <input
                    type="text"
                    placeholder="Palmas - TO"
                    value={clientCity}
                    onChange={(e) => setClientCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-zinc-800">
                <button type="button" onClick={() => setShowAddClientModal(false)} className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-400 font-semibold">
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold">
                  {editingClient ? 'Salvar Alterações' : 'Salvar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
