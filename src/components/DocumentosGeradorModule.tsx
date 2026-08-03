import React, { useState, useEffect } from 'react';
import {
  FileText,
  Printer,
  Copy,
  CheckCircle2,
  Sliders,
  ChevronDown,
  ChevronUp,
  Check,
  FileCheck,
  History,
  Paperclip,
  ShieldCheck,
  AlertCircle,
  X,
} from 'lucide-react';
import {
  Client,
  Obra,
  SystemCompanyConfig,
  TechnicalEngineer,
  CommercialProposal,
  ApprovedContract,
  maskCpfCnpj,
  maskPhone,
} from '../types';
import { Tabs } from './ui/Tabs';

interface DocumentosGeradorModuleProps {
  clients: Client[];
  obras: Obra[];
  engineers?: TechnicalEngineer[];
  companyConfig?: SystemCompanyConfig;
  proposals?: CommercialProposal[];
  approvedContracts?: ApprovedContract[];
  onApproveContract?: (contract: ApprovedContract) => void;
}

type DocumentType = 'contrato' | 'procuracao';
export type FormaPagamentoTipo = 'PIX' | 'Imovel' | 'Veiculo' | 'Parcelado' | 'Misto';

export const DocumentosGeradorModule: React.FC<DocumentosGeradorModuleProps> = ({
  clients,
  obras,
  engineers = [],
  companyConfig,
  proposals = [],
  approvedContracts = [],
  onApproveContract,
}) => {
  const [activeMainTab, setActiveMainTab] = useState<'gerador' | 'historico_aprovados'>('gerador');
  const [docType, setDocType] = useState<DocumentType>('contrato');
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [selectedObraId, setSelectedObraId] = useState<string>(obras[0]?.id || 'NONE');
  const [selectedEngineerId, setSelectedEngineerId] = useState<string>(engineers[0]?.id || '');
  const [showVariableForm, setShowVariableForm] = useState(false);
  const [copied, setCopied] = useState(false);

  // Approval Modal State
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalResponsible, setApprovalResponsible] = useState('Diretoria Comercial ProObras');
  const [approvalStatus, setApprovalStatus] = useState<'Aprovado' | 'Assinado' | 'Em Execução'>('Aprovado');
  const [approvalSuccessMessage, setApprovalSuccessMessage] = useState<string | null>(null);

  // Selected entities
  const selectedClient = clients.find((c) => c.id === selectedClientId) || clients[0];
  const selectedObra = obras.find((o) => o.id === selectedObraId) || obras[0];
  const selectedEngineer = engineers.find((e) => e.id === selectedEngineerId) || engineers[0];

  // DYNAMIC CALENDAR DATE IN FULL BRAZILIAN FORMAT
  const getDynamicCalendarDate = () => {
    const today = new Date();
    const monthNames = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
    ];
    const day = today.getDate();
    const monthName = monthNames[today.getMonth()];
    const year = today.getFullYear();
    return `${day} de ${monthName} de ${year}`;
  };

  const dynamicDateText = getDynamicCalendarDate();

  // FIXED CONTRACTOR DATA (A CONTRATADA será sempre Moura Soluções Elétricas LTDA)
  const fixedCompany = {
    name: 'MOURA SOLUÇÕES ELÉTRICAS LTDA',
    cnpj: '54.729.118/0001-84',
    address: 'Quadra 812 Sul, QI 06, Lote 01, Sala 05, Palmas/TO, CEP 77.023-120',
    representative: 'Ricardo Damacena de Moura',
    repTitle: 'empresário, casado',
    repCpf: '048.846.721-78',
    repAddress: 'Quadra 1304 Sul, Rua 02, QI 01, Lote 06, Palmas/TO',
  };

  // VARIABLE FIELDS STATE
  // Contratante (strictly derived from selectedClient)
  const [contratanteNome, setContratanteNome] = useState('');
  const [contratanteNacionalidade, setContratanteNacionalidade] = useState('');
  const [contratanteEstadoCivil, setContratanteEstadoCivil] = useState('');
  const [contratanteProfissao, setContratanteProfissao] = useState('');
  const [contratanteRg, setContratanteRg] = useState('');
  const [contratanteOrgao, setContratanteOrgao] = useState('');
  const [contratanteCpf, setContratanteCpf] = useState('');
  const [contratanteEndereco, setContratanteEndereco] = useState('');

  // Objeto & Obra (strictly derived from selectedObra)
  const [tipoRede, setTipoRede] = useState('');
  const [extensaoRede, setExtensaoRede] = useState('');
  const [tensao, setTensao] = useState('34,5 kV');
  const [tipoSubestacao, setTipoSubestacao] = useState('subestação aérea');
  const [potenciaTransformador, setPotenciaTransformador] = useState('');

  // Local da Execução
  const [localDaObra, setLocalDaObra] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [uf, setUf] = useState('');

  // Valores & Forma de Pagamento (strictly derived from selectedObra.totalValue)
  const [valorContrato, setValorContrato] = useState('');
  const [valorPorExtenso, setValorPorExtenso] = useState('');
  const [formaPagamentoTipo, setFormaPagamentoTipo] = useState<FormaPagamentoTipo>('PIX');
  
  // Dados de Imóvel
  const [descricaoImovel, setDescricaoImovel] = useState('');
  const [matriculaImovel, setMatriculaImovel] = useState('');
  const [cartorioImovel, setCartorioImovel] = useState('');
  const [codigoIncra, setCodigoIncra] = useState('');
  const [valorImovel, setValorImovel] = useState('');

  // Dados de Veículo (Carro)
  const [descricaoVeiculo, setDescricaoVeiculo] = useState('');
  const [placaVeiculo, setPlacaVeiculo] = useState('');
  const [renavamVeiculo, setRenavamVeiculo] = useState('');
  const [valorVeiculo, setValorVeiculo] = useState('');

  // Pagamento Misto
  const [valorPixMisto, setValorPixMisto] = useState('');
  const [valorParceladoMisto, setValorParceladoMisto] = useState('');

  // Vigência & Datas
  const [prazoExecucao, setPrazoExecucao] = useState('120 dias');
  const [cidadeData, setCidadeData] = useState('Palmas');
  const [estadoData, setEstadoData] = useState('TO');
  const [dataContrato, setDataContrato] = useState(dynamicDateText);

  // Handle Obra selection change and automatically sync to that Obra's Client
  const handleObraSelect = (obraId: string) => {
    setSelectedObraId(obraId);
    const targetObra = obras.find((o) => o.id === obraId);
    if (targetObra && targetObra.clientId) {
      setSelectedClientId(targetObra.clientId);
    }
  };

  // Handle Client selection change and automatically sync to Client's Obra if available
  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    const targetObra = obras.find((o) => o.clientId === clientId);
    if (targetObra) {
      setSelectedObraId(targetObra.id);
    }
  };

  // Synchronize Contratante fields STRICTLY with currently selectedClient
  useEffect(() => {
    if (selectedClient) {
      setContratanteNome(selectedClient.name || '');
      setContratanteCpf(maskCpfCnpj(selectedClient.cpfCnpj || ''));
      setContratanteEndereco(selectedClient.address || '');
      setContratanteRg(selectedClient.rgIe && selectedClient.rgIe !== 'Isento / N/I' ? selectedClient.rgIe : '');
      setMunicipio(selectedClient.city || 'Palmas');
      setUf(selectedClient.state || 'TO');
      setCidadeData(selectedClient.city || 'Palmas');
      setEstadoData(selectedClient.state || 'TO');
    }
  }, [selectedClientId, clients]);

  // Proposal Conditions Sync State
  const [formaPagamentoDesc, setFormaPagamentoDesc] = useState('');
  const [garantiaDesc, setGarantiaDesc] = useState('');
  const [empresaRespon, setEmpresaRespon] = useState('');
  const [clienteRespon, setClienteRespon] = useState('');

  // Synchronize Objeto, Local & Valores STRICTLY with currently selectedObra
  useEffect(() => {
    if (selectedObra) {
      setTipoRede(selectedObra.type || 'Rede RDR 34,5 kV');
      setPotenciaTransformador(selectedObra.powerKva ? `${selectedObra.powerKva} kVA` : '');
      setValorContrato(selectedObra.totalValue ? `R$ ${selectedObra.totalValue.toLocaleString('pt-BR')}` : '');
      const addr = selectedObra.address || selectedClient?.address;
      setLocalDaObra(
        addr
          ? `${addr} (${selectedObra.projectName})`
          : `${selectedObra.projectName} (Ref: ${selectedObra.projectNumber || selectedObra.code})`
      );
      setMunicipio(selectedObra.municipality || selectedClient?.city || 'Palmas');
      setUf(selectedObra.state || selectedClient?.state || 'TO');
    }
  }, [selectedObraId, obras]);

  // Synchronize strictly with Proposal conditions if available for selected client/obra
  useEffect(() => {
    if (proposals && proposals.length > 0) {
      const matchProp = proposals.find(
        (p) => p.clientId === selectedClientId || p.clientName === selectedClient?.name
      );
      if (matchProp && matchProp.conditions) {
        if (matchProp.conditions.executionTerm) setPrazoExecucao(matchProp.conditions.executionTerm);
        if (matchProp.conditions.paymentMethod) setFormaPagamentoDesc(matchProp.conditions.paymentMethod);
        if (matchProp.conditions.warranty) setGarantiaDesc(matchProp.conditions.warranty);
        if (matchProp.conditions.companyResponsibilities) setEmpresaRespon(matchProp.conditions.companyResponsibilities);
        if (matchProp.conditions.clientResponsibilities) setClienteRespon(matchProp.conditions.clientResponsibilities);
        if (matchProp.totalValue) setValorContrato(`R$ ${matchProp.totalValue.toLocaleString('pt-BR')}`);
        if (matchProp.totalValueInWords) setValorPorExtenso(matchProp.totalValueInWords);
      }
    }
  }, [selectedClientId, selectedObraId, proposals]);

  // Strict Bracket Formatting Helper: If missing or empty, output in brackets [NOME_DO_CAMPO]
  const valOrBracket = (value: string | undefined | null, fieldPlaceholder: string) => {
    if (value && value.trim() !== '') {
      return value;
    }
    return `[${fieldPlaceholder}]`;
  };

  // Dynamic Title (16pt, Bold, Uppercase, Centered)
  const titlePower = selectedObra?.powerKva ? `${selectedObra.powerKva} kVA` : valOrBracket(potenciaTransformador, 'POTÊNCIA KVA');
  const generatedTitle = `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE EXECUÇÃO DE REDE ELÉTRICA E TRANSFORMADOR DE ${titlePower.toUpperCase()}`;

  const handleCopyText = () => {
    const textToCopy = docType === 'contrato' ? document.getElementById('contract-body-print')?.innerText : document.getElementById('procuracao-body-print')?.innerText;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrintDocument = () => {
    window.print();
  };

  const handleConfirmApprove = () => {
    const contractNumber = `CTR-2026-${String(approvedContracts.length + 101).padStart(3, '0')}`;
    const isObraLinked = selectedObraId !== 'NONE' && !!selectedObra;

    const newApproved: ApprovedContract = {
      id: `CTR-APP-${Date.now()}`,
      contractNumber,
      clientName: selectedClient?.name || contratanteNome || 'Cliente Geral',
      clientId: selectedClientId,
      obraId: isObraLinked ? selectedObra.id : undefined,
      obraCode: isObraLinked ? (selectedObra.projectNumber || selectedObra.code) : undefined,
      projectName: isObraLinked ? selectedObra.projectName : undefined,
      contractValue: Number((valorContrato || '').replace(/\D/g, '')) || selectedObra?.totalValue || 150000,
      paymentMethod: formaPagamentoTipo,
      approvedAt: new Date().toISOString().split('T')[0],
      approvedBy: approvalResponsible || 'Diretoria Comercial ProObras',
      status: approvalStatus,
      documentType: docType,
      fileName: `Contrato_${(selectedClient?.name || 'Cliente').replace(/\s+/g, '_')}_${contractNumber}.pdf`,
    };

    if (onApproveContract) {
      onApproveContract(newApproved);
    }

    setShowApprovalModal(false);

    if (isObraLinked) {
      setApprovalSuccessMessage(
        `🎉 Contrato ${contractNumber} Homologado com Sucesso! Ele foi anexado automaticamente na aba de Documentos da Obra ${selectedObra.projectNumber || selectedObra.code} (${selectedObra.projectName}).`
      );
    } else {
      setApprovalSuccessMessage(
        `🎉 Contrato ${contractNumber} Homologado com Sucesso! Como não há obra vinculada, ele foi armazenado no Histórico de Contratos Aprovados.`
      );
    }

    setTimeout(() => {
      setApprovalSuccessMessage(null);
    }, 8000);
  };

  return (
    <div className="space-y-6 font-sans print:p-0 print:m-0">
      {/* Inject Print-Specific A4 Times New Roman CSS Standard (Clean Layout) */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 2.5cm 2.0cm 2.5cm 3.0cm; /* Top 2.5cm, Right 2.0cm, Bottom 2.5cm, Left 3.0cm */
          }
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
            font-family: "Times New Roman", Times, serif !important;
            -webkit-print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          .a4-print-container {
            width: 100% !important;
            max-width: none !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: #ffffff !important;
          }
        }
      `}</style>

      {/* Main Module Navigation Subtabs (Hidden when printing) */}
      <Tabs
        className="no-print"
        items={[
          {
            id: 'gerador',
            label: '📄 Gerador & Minuta de Contrato',
            icon: <FileText className="w-4 h-4" />,
          },
          {
            id: 'historico_aprovados',
            label: '📜 Histórico de Contratos Aprovados',
            icon: <History className="w-4 h-4" />,
            badge: approvedContracts.length,
          },
        ]}
        activeId={activeMainTab}
        onChange={(id) => setActiveMainTab(id as 'gerador' | 'historico_aprovados')}
      />

      {/* Notification Toast Banner */}
      {approvalSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-between no-print animate-pulse">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{approvalSuccessMessage}</span>
          </div>
          <button onClick={() => setApprovalSuccessMessage(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Control Action Header (Hidden when printing) */}
      {activeMainTab === 'gerador' && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm no-print">
          <div>
            <h1 className="text-base font-semibold text-zinc-100 flex items-center space-x-2 font-mono">
              <FileText className="w-5 h-5 text-blue-500" />
              <span>Gerador de Contratos & Procurações (Padrão PDF Limpo)</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Visualização limpa em papel A4 Times New Roman 12pt, sem molduras ou cabeçalhos visuais decorativos.
            </p>
          </div>

          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            <button
              onClick={() => setShowVariableForm(!showVariableForm)}
              className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>{showVariableForm ? 'Ocultar Edição' : 'Complementar Dados [Colchetes]'}</span>
              {showVariableForm ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={handleCopyText}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
            </button>

            <button
              onClick={() => setShowApprovalModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              <span>Aprovar & Homologar Contrato</span>
            </button>

            <button
              onClick={handlePrintDocument}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 stroke-[2.5]" />
              <span>Imprimir / Gerar PDF A4</span>
            </button>
          </div>
        </div>
      )}

      {/* Primary Selector Bar (Hidden when printing) */}
      <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm space-y-4 no-print">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-sans">
          {/* Document Template Selection */}
          <div>
            <label className="font-semibold text-zinc-400 block mb-1">Modelo de Documento *</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value as DocumentType)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 font-bold focus:outline-none focus:border-blue-500"
            >
              <option value="contrato">1. Contrato Mestre A4 (11 Cláusulas Fixas)</option>
              <option value="procuracao">2. Procuração A4 para Concessionária</option>
            </select>
          </div>

          {/* Obra Selection (Auto Syncs Client) */}
          <div>
            <label className="font-semibold text-zinc-400 block mb-1">1. Selecionar Obra Elétrica *</label>
            <select
              value={selectedObraId}
              onChange={(e) => handleObraSelect(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 font-bold focus:outline-none focus:border-blue-500"
            >
              <option value="NONE">⚠️ Sem Obra Vinculada (Contrato Direto de Cliente)</option>
              {obras.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.projectNumber || o.code} - {o.projectName} (R$ {o.totalValue.toLocaleString('pt-BR')})
                </option>
              ))}
            </select>
          </div>

          {/* Client Selection (Auto Syncs Obra) */}
          <div>
            <label className="font-semibold text-zinc-400 block mb-1">2. Cliente Cadastrado Vinculado *</label>
            <select
              value={selectedClientId}
              onChange={(e) => handleClientSelect(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 font-bold focus:outline-none focus:border-blue-500"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.cpfCnpj})
                </option>
              ))}
            </select>
          </div>

          {/* Technical Engineer Selection */}
          <div>
            <label className="font-semibold text-zinc-400 block mb-1">3. Responsável Técnico Cadastrado</label>
            <select
              value={selectedEngineerId}
              onChange={(e) => setSelectedEngineerId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 font-bold focus:outline-none focus:border-blue-500"
            >
              {engineers.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.crea})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sync Summary Info Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 text-xs font-sans">
          <div>
            <span className="text-zinc-500 text-[10px] block">Cliente Vinculado:</span>
            <strong className="text-zinc-100">{valOrBracket(selectedClient?.name, 'NOME CLIENTE')}</strong>
          </div>
          <div>
            <span className="text-zinc-500 text-[10px] block">CPF / CNPJ:</span>
            <strong className="text-blue-400">{valOrBracket(selectedClient?.cpfCnpj, 'CPF/CNPJ')}</strong>
          </div>
          <div>
            <span className="text-zinc-500 text-[10px] block">Obra & Valor Inserido:</span>
            <strong className="text-emerald-400 font-mono">
              {selectedObra?.projectNumber || selectedObra?.code} • R$ {selectedObra?.totalValue?.toLocaleString('pt-BR') || '[VALOR]'}
            </strong>
          </div>
          <div>
            <span className="text-zinc-500 text-[10px] block">Data Dinâmica do Calendário:</span>
            <strong className="text-amber-400">{cidadeData}/{estadoData}, {dynamicDateText}</strong>
          </div>
        </div>
      </div>

      {/* Expandable Variable Editor Form (Hidden when printing) */}
      {showVariableForm && (
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-4 no-print text-xs font-sans">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-bold text-amber-400 uppercase tracking-wider font-mono">
              Formulário de Complementação de Dados [Colchetes]
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">
              Campos não preenchidos aparecem como [CAMPO] no documento final.
            </span>
          </div>

          {/* Section A: Contratante */}
          <div className="space-y-2">
            <span className="font-bold text-zinc-200 block font-mono uppercase text-[11px]">1. Qualificação do Contratante</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-zinc-400 block mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={contratanteNome}
                  onChange={(e) => setContratanteNome(e.target.value)}
                  placeholder="[NOME DO CLIENTE]"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 font-sans focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Nacionalidade</label>
                <input
                  type="text"
                  value={contratanteNacionalidade}
                  onChange={(e) => setContratanteNacionalidade(e.target.value)}
                  placeholder="[NACIONALIDADE]"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 font-sans focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Estado Civil</label>
                <input
                  type="text"
                  value={contratanteEstadoCivil}
                  onChange={(e) => setContratanteEstadoCivil(e.target.value)}
                  placeholder="[ESTADO CIVIL]"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 font-sans focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Profissão</label>
                <input
                  type="text"
                  value={contratanteProfissao}
                  onChange={(e) => setContratanteProfissao(e.target.value)}
                  placeholder="[PROFISSÃO]"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 font-sans focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">RG</label>
                <input
                  type="text"
                  value={contratanteRg}
                  onChange={(e) => setContratanteRg(e.target.value)}
                  placeholder="[RG]"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Órgão Expedidor</label>
                <input
                  type="text"
                  value={contratanteOrgao}
                  onChange={(e) => setContratanteOrgao(e.target.value)}
                  placeholder="[ÓRGÃO EXPEDIDOR]"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">CPF / CNPJ</label>
                <input
                  type="text"
                  value={contratanteCpf}
                  onChange={(e) => setContratanteCpf(e.target.value)}
                  placeholder="[CPF/CNPJ DO CLIENTE]"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Endereço Residencial</label>
                <input
                  type="text"
                  value={contratanteEndereco}
                  onChange={(e) => setContratanteEndereco(e.target.value)}
                  placeholder="[ENDEREÇO DO CLIENTE]"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 font-sans focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section B: Objeto & Dados Técnicos da Obra Selecionada */}
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <span className="font-bold text-zinc-200 block font-mono uppercase text-[11px]">2. Especificações da Obra Selecionada</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-zinc-400 block mb-1">Tipo de Rede</label>
                <input
                  type="text"
                  value={tipoRede}
                  onChange={(e) => setTipoRede(e.target.value)}
                  placeholder="[TIPO DE REDE]"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 font-sans focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Extensão da Rede</label>
                <input
                  type="text"
                  value={extensaoRede}
                  onChange={(e) => setExtensaoRede(e.target.value)}
                  placeholder="[EXTENSÃO DA REDE]"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 font-sans focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Tensão Primária</label>
                <input
                  type="text"
                  value={tensao}
                  onChange={(e) => setTensao(e.target.value)}
                  placeholder="[TENSÃO PRIMÁRIA]"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Potência do Transformador</label>
                <input
                  type="text"
                  value={potenciaTransformador}
                  onChange={(e) => setPotenciaTransformador(e.target.value)}
                  placeholder="[POTÊNCIA DO TRANSFORMADOR]"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section C: Local de Prestação de Serviços */}
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <span className="font-bold text-zinc-200 block font-mono uppercase text-[11px]">3. Local de Prestação de Serviços</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-zinc-400 block mb-1">Endereço / Local de Prestação de Serviços *</label>
                <input
                  type="text"
                  value={localDaObra}
                  onChange={(e) => setLocalDaObra(e.target.value)}
                  placeholder="[ENDEREÇO ONDE OS SERVIÇOS SERÃO EXECUTADOS]"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 font-sans focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-zinc-400 block mb-1">Cidade</label>
                  <input
                    type="text"
                    value={cidadeData}
                    onChange={(e) => setCidadeData(e.target.value)}
                    placeholder="[MUNICÍPIO]"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 font-sans focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Estado (UF)</label>
                  <input
                    type="text"
                    value={estadoData}
                    onChange={(e) => setEstadoData(e.target.value)}
                    placeholder="[UF]"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono uppercase focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section D: Valores da Obra Selecionada */}
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <span className="font-bold text-zinc-200 block font-mono uppercase text-[11px]">4. Valor da Obra & Forma de Pagamento</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-zinc-400 block mb-1">Valor da Obra (Puxado da Obra)</label>
                <input
                  type="text"
                  value={valorContrato}
                  onChange={(e) => setValorContrato(e.target.value)}
                  placeholder="[VALOR DA OBRA]"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-emerald-400 font-bold font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Valor por Extenso</label>
                <input
                  type="text"
                  value={valorPorExtenso}
                  onChange={(e) => setValorPorExtenso(e.target.value)}
                  placeholder="[VALOR POR EXTENSO]"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 font-sans focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Modalidade de Pagamento</label>
                <select
                  value={formaPagamentoTipo}
                  onChange={(e) => setFormaPagamentoTipo(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 font-sans focus:outline-none focus:border-blue-500 font-bold"
                >
                  <option value="PIX">1. PIX / TED / Transferência Bancária À Vista</option>
                  <option value="Imovel">2. Permuta / Transferência de Imóvel</option>
                  <option value="Veiculo">3. Permuta / Transferência de Veículo (Carro)</option>
                  <option value="Parcelado">4. Parcelado conforme Medições de Obra</option>
                  <option value="Misto">5. Misto / Múltiplas Modalidades (Dinheiro + Imóvel + Carro + Parcelas)</option>
                </select>
              </div>
            </div>

            {/* Campos de Permuta de Imóvel */}
            {(formaPagamentoTipo === 'Imovel' || formaPagamentoTipo === 'Misto') && (
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 mt-2">
                <span className="font-bold text-amber-400 block font-mono text-[10px] uppercase">
                  Dados da Permuta / Transferência de Imóvel
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-zinc-400 block mb-1">Descrição do Imóvel</label>
                    <input
                      type="text"
                      value={descricaoImovel}
                      onChange={(e) => setDescricaoImovel(e.target.value)}
                      placeholder="Ex: Lote 05 Quadra 12 Loteamento Sol"
                      className="w-full px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-100 font-sans"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1">Matrícula nº</label>
                    <input
                      type="text"
                      value={matriculaImovel}
                      onChange={(e) => setMatriculaImovel(e.target.value)}
                      placeholder="[MATRÍCULA]"
                      className="w-full px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1">Cartório de Registro</label>
                    <input
                      type="text"
                      value={cartorioImovel}
                      onChange={(e) => setCartorioImovel(e.target.value)}
                      placeholder="[CARTÓRIO]"
                      className="w-full px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-100 font-sans"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1">Código INCRA/SNCR</label>
                    <input
                      type="text"
                      value={codigoIncra}
                      onChange={(e) => setCodigoIncra(e.target.value)}
                      placeholder="[INCRA]"
                      className="w-full px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-100 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Campos de Permuta de Veículo / Carro */}
            {(formaPagamentoTipo === 'Veiculo' || formaPagamentoTipo === 'Misto') && (
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 mt-2">
                <span className="font-bold text-blue-400 block font-mono text-[10px] uppercase">
                  Dados da Permuta / Transferência de Veículo (Carro)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-zinc-400 block mb-1">Marca / Modelo / Ano</label>
                    <input
                      type="text"
                      value={descricaoVeiculo}
                      onChange={(e) => setDescricaoVeiculo(e.target.value)}
                      placeholder="Ex: Toyota Hilux SRX 4x4 2024"
                      className="w-full px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-100 font-sans"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1">Placa do Veículo</label>
                    <input
                      type="text"
                      value={placaVeiculo}
                      onChange={(e) => setPlacaVeiculo(e.target.value.toUpperCase())}
                      placeholder="Ex: ABC-1D23"
                      className="w-full px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-100 font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1">Número RENAVAM</label>
                    <input
                      type="text"
                      value={renavamVeiculo}
                      onChange={(e) => setRenavamVeiculo(e.target.value)}
                      placeholder="[RENAVAM]"
                      className="w-full px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1">Valor de Avaliação (R$)</label>
                    <input
                      type="text"
                      value={valorVeiculo}
                      onChange={(e) => setValorVeiculo(e.target.value)}
                      placeholder="Ex: R$ 180.000,00"
                      className="w-full px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-emerald-400 font-mono font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Campos Específicos para Pagamento Misto */}
            {formaPagamentoTipo === 'Misto' && (
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 mt-2">
                <span className="font-bold text-emerald-400 block font-mono text-[10px] uppercase">
                  Valores Fracionados da Modalidade Mista
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-zinc-400 block mb-1">Valor em Dinheiro / PIX (R$)</label>
                    <input
                      type="text"
                      value={valorPixMisto}
                      onChange={(e) => setValorPixMisto(e.target.value)}
                      placeholder="Ex: R$ 50.000,00"
                      className="w-full px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-emerald-400 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1">Valor Parcelado / Medições (R$)</label>
                    <input
                      type="text"
                      value={valorParceladoMisto}
                      onChange={(e) => setValorParceladoMisto(e.target.value)}
                      placeholder="Ex: R$ 30.000,00 em 3x"
                      className="w-full px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-emerald-400 font-mono font-bold"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 100% CLEAN A4 PRINT CONTAINER (EXCLUSIVELY ORGANIZED CONTRACT TEXT) */}
      <div
        className="a4-print-container bg-white text-black p-8 md:p-12 shadow-2xl border border-zinc-300 max-w-4xl mx-auto space-y-5 leading-relaxed text-justify"
        style={{
          fontFamily: '"Times New Roman", Times, serif',
          fontSize: '12pt',
          lineHeight: '1.5',
        }}
      >
        {/* DOCUMENT TITLE: 16pt, Bold, Uppercase, Centered */}
        <div className="text-center mb-8">
          <h1
            className="font-bold uppercase tracking-wide text-black font-serif"
            style={{ fontSize: '16pt', lineHeight: '1.3' }}
          >
            {docType === 'contrato' ? generatedTitle : 'PROCURAÇÃO PARTICULAR DE REPRESENTAÇÃO TÉCNICA E ADMINISTRATIVA'}
          </h1>
        </div>

        {/* DOCUMENT BODY: 12pt Times New Roman, 1.5 line spacing, 6pt after paragraph, 1.25cm indent (BOLD ONLY ON TITLES) */}
        {docType === 'contrato' ? (
          <div id="contract-body-print" className="space-y-4 font-serif text-[12pt] text-black">
            {/* 1. CONTRATANTE */}
            <div style={{ breakInside: 'avoid' }}>
              <h2 className="font-bold uppercase text-black font-serif mb-1" style={{ fontSize: '12pt' }}>
                1. CONTRATANTE
              </h2>
              <p style={{ textIndent: '1.25cm', marginBottom: '6pt' }}>
                {valOrBracket(contratanteNome, 'NOME DO CLIENTE')}, {valOrBracket(contratanteNacionalidade, 'NACIONALIDADE')}, {valOrBracket(contratanteEstadoCivil, 'ESTADO CIVIL')}, {valOrBracket(contratanteProfissao, 'PROFISSÃO')}, portador(a) da Cédula de Identidade RG nº {valOrBracket(contratanteRg, 'RG')}, expedida pela {valOrBracket(contratanteOrgao, 'ÓRGÃO EXPEDIDOR')}, inscrito(a) no CPF/CNPJ sob o nº {valOrBracket(contratanteCpf, 'CPF/CNPJ DO CLIENTE')}, residente e domiciliado(a) na {valOrBracket(contratanteEndereco, 'ENDEREÇO DO CLIENTE')}.
              </p>
            </div>

            {/* 2. CONTRATADA */}
            <div style={{ breakInside: 'avoid' }}>
              <h2 className="font-bold uppercase text-black font-serif mb-1" style={{ fontSize: '12pt' }}>
                2. CONTRATADA
              </h2>
              <p style={{ textIndent: '1.25cm', marginBottom: '6pt' }}>
                {fixedCompany.name}, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº {fixedCompany.cnpj}, com sede na {fixedCompany.address}, neste ato representada pelo sócio Sr. {fixedCompany.representative}, {fixedCompany.repTitle}, portador do CPF nº {fixedCompany.repCpf}, residente e domiciliado na {fixedCompany.repAddress}.
              </p>
            </div>

            {/* 3. DO OBJETO */}
            <div style={{ breakInside: 'avoid' }}>
              <h2 className="font-bold uppercase text-black font-serif mb-1" style={{ fontSize: '12pt' }}>
                3. DO OBJETO
              </h2>
              <p style={{ textIndent: '1.25cm', marginBottom: '6pt' }}>
                3.1. O presente contrato tem por objeto Obra: "{valOrBracket(selectedObra?.projectName, 'NOME DA OBRA')}", Número do Projeto: {valOrBracket(selectedObra?.projectNumber || selectedObra?.code, 'NÚMERO DO PROJETO')}, compreendendo o fornecimento de mão de obra, montagem de estruturas, lançamento e instalação de condutores, instalação de equipamentos, conexões elétricas, aterramento, testes, comissionamento e todos os demais serviços necessários para a execução da obra, em conformidade com as normas técnicas aplicáveis, os padrões da concessionária {valOrBracket(selectedObra?.concessionaria, 'Energisa')} e a legislação vigente.
              </p>
            </div>

            {/* 4. DO LOCAL DE PRESTAÇÃO DE SERVIÇOS */}
            <div style={{ breakInside: 'avoid' }}>
              <h2 className="font-bold uppercase text-black font-serif mb-1" style={{ fontSize: '12pt' }}>
                4. DO LOCAL DE PRESTAÇÃO DE SERVIÇOS
              </h2>
              <p style={{ textIndent: '1.25cm', marginBottom: '6pt' }}>
                4.1. CLÁUSULA – DO LOCAL DE PRESTAÇÃO DE SERVIÇOS
              </p>
              <p style={{ textIndent: '1.25cm', marginBottom: '6pt' }}>
                Os serviços objeto deste contrato serão executados no local de prestação de serviços: {valOrBracket(localDaObra, 'LOCAL DE PRESTAÇÃO DE SERVIÇOS')}, tendo como interessado {valOrBracket(contratanteNome, 'NOME DO INTERESSADO / CLIENTE')}.
              </p>
            </div>

            {/* 5. CLÁUSULA – DA FORMA DE PAGAMENTO */}
            <div style={{ breakInside: 'avoid' }}>
              <h2 className="font-bold uppercase text-black font-serif mb-1" style={{ fontSize: '12pt' }}>
                5. CLÁUSULA – DA FORMA DE PAGAMENTO
              </h2>
              <p style={{ textIndent: '1.25cm', marginBottom: '6pt' }}>
                5.1. O preço para a execução dos serviços objeto deste contrato será de {valOrBracket(valorContrato, 'VALOR DA OBRA')}{valorPorExtenso ? ` (${valorPorExtenso})` : ''}.
              </p>
              {formaPagamentoTipo === 'Imovel' && (
                <>
                  <p style={{ textIndent: '1.25cm', marginBottom: '6pt' }}>
                    5.2. A forma de pagamento será realizada mediante a dação em pagamento / transferência de propriedade do seguinte imóvel:
                  </p>
                  <p style={{ textIndent: '1.25cm', marginBottom: '4pt' }}>
                    • Descrição do Imóvel: {valOrBracket(descricaoImovel, 'DESCRIÇÃO DO IMÓVEL')}.
                  </p>
                  <p style={{ textIndent: '1.25cm', marginBottom: '4pt' }}>
                    • Matrícula do Imóvel nº: {valOrBracket(matriculaImovel, 'MATRÍCULA DO IMÓVEL')}.
                  </p>
                  <p style={{ textIndent: '1.25cm', marginBottom: '4pt' }}>
                    • Cartório de Registro de Imóveis: {valOrBracket(cartorioImovel, 'CARTÓRIO DE REGISTRO')}.
                  </p>
                  <p style={{ textIndent: '1.25cm', marginBottom: '4pt' }}>
                    • Código INCRA/SNCR: {valOrBracket(codigoIncra, 'CÓDIGO INCRA')}.
                  </p>
                  <p style={{ textIndent: '1.25cm', marginBottom: '6pt' }}>
                    5.3. A transferência da propriedade do referido imóvel será realizada livre e desembaraçada de quaisquer ônus, gravames, débitos ou restrições ao CONTRATADO, obrigando-se o CONTRATANTE a fornecer a documentação para a respectiva escritura pública.
                  </p>
                </>
              )}

              {formaPagamentoTipo === 'Veiculo' && (
                <>
                  <p style={{ textIndent: '1.25cm', marginBottom: '6pt' }}>
                    5.2. A forma de pagamento será realizada mediante a dação em pagamento / transferência de propriedade do seguinte veículo automotor:
                  </p>
                  <p style={{ textIndent: '1.25cm', marginBottom: '4pt' }}>
                    • Veículo / Modelo / Ano: {valOrBracket(descricaoVeiculo, 'MODELO/ANO DO VEÍCULO')}.
                  </p>
                  <p style={{ textIndent: '1.25cm', marginBottom: '4pt' }}>
                    • Placa: {valOrBracket(placaVeiculo, 'PLACA DO VEÍCULO')}.
                  </p>
                  <p style={{ textIndent: '1.25cm', marginBottom: '4pt' }}>
                    • Número RENAVAM: {valOrBracket(renavamVeiculo, 'RENAVAM')}.
                  </p>
                  {valorVeiculo && (
                    <p style={{ textIndent: '1.25cm', marginBottom: '4pt' }}>
                      • Valor de Avaliação Acordado: {valorVeiculo}.
                    </p>
                  )}
                  <p style={{ textIndent: '1.25cm', marginBottom: '6pt' }}>
                    5.3. O CONTRATANTE responsabiliza-se integralmente pela transferência da propriedade do veículo junto ao DETRAN, garantindo a inexistência de multas, débitos fiscais ou gravames.
                  </p>
                </>
              )}

              {formaPagamentoTipo === 'Misto' && (
                <>
                  <p style={{ textIndent: '1.25cm', marginBottom: '6pt' }}>
                    5.2. A forma de pagamento será efetuada de modo MISTO / COMBINADO, mediante a composição das seguintes modalidades acordadas entre as partes:
                  </p>
                  {valorPixMisto && (
                    <p style={{ textIndent: '1.25cm', marginBottom: '4pt' }}>
                      a) {valorPixMisto} efetuados mediante transferência bancária (PIX / TED) diretamente na conta de titularidade da CONTRATADA;
                    </p>
                  )}
                  {descricaoImovel && (
                    <p style={{ textIndent: '1.25cm', marginBottom: '4pt' }}>
                      b) {valorImovel ? `${valorImovel} mediante ` : ''}transferência de propriedade do Imóvel: {descricaoImovel}, Matrícula nº {valOrBracket(matriculaImovel, 'MATRÍCULA')}, Cartório {valOrBracket(cartorioImovel, 'CARTÓRIO')};
                    </p>
                  )}
                  {descricaoVeiculo && (
                    <p style={{ textIndent: '1.25cm', marginBottom: '4pt' }}>
                      c) {valorVeiculo ? `${valorVeiculo} mediante ` : ''}transferência de propriedade do Veículo: {descricaoVeiculo}, Placa {valOrBracket(placaVeiculo, 'PLACA')}, RENAVAM {valOrBracket(renavamVeiculo, 'RENAVAM')};
                    </p>
                  )}
                  {valorParceladoMisto && (
                    <p style={{ textIndent: '1.25cm', marginBottom: '4pt' }}>
                      d) {valorParceladoMisto} parcelados em medições físico-financeiras de execução da obra.
                    </p>
                  )}
                  <p style={{ textIndent: '1.25cm', marginBottom: '6pt' }}>
                    5.3. A quitação de cada fração do pagamento misto se dará mediante a apresentação dos respectivos comprovantes de crédito bancário ou das escrituras/recibos de transferência dos bens.
                  </p>
                </>
              )}

              {(formaPagamentoTipo === 'PIX' || formaPagamentoTipo === 'Parcelado') && (
                <>
                  <p style={{ textIndent: '1.25cm', marginBottom: '6pt' }}>
                    5.2. A forma de pagamento será efetuada conforme acordado na Proposta Comercial: {formaPagamentoDesc || 'mediante transferência bancária (PIX / TED) ou medições periódicas diretamente na conta da CONTRATADA conforme cronograma financeiro aprovado entre as partes'}.
                  </p>
                  <p style={{ textIndent: '1.25cm', marginBottom: '6pt' }}>
                    5.3. A quitação será concedida mediante comprovante de crédito em conta bancária de titularidade da CONTRATADA.
                  </p>
                </>
              )}
            </div>

            {/* 6. DAS CONSIDERAÇÕES GERAIS E GARANTIA */}
            <div style={{ breakInside: 'avoid' }}>
              <h2 className="font-bold uppercase text-black font-serif mb-1" style={{ fontSize: '12pt' }}>
                6. DAS CONSIDERAÇÕES GERAIS E GARANTIA
              </h2>
              <p style={{ textIndent: '1.25cm', marginBottom: '4pt' }}>
                6.1. O prazo de execução dos serviços e vigência contratual será de {valOrBracket(prazoExecucao, 'PRAZO DE EXECUÇÃO')}, sem reajuste monetário no período.
              </p>
              <p style={{ textIndent: '1.25cm', marginBottom: '4pt' }}>
                6.2. Garantia oferecida: {garantiaDesc || '12 (doze) meses contra defeitos de fabricação de materiais e montagem eletromecânica'}.
              </p>
              <p style={{ textIndent: '1.25cm', marginBottom: '4pt' }}>
                6.2. O preço acordado inclui todas as despesas, custos, viagens e alimentação da CONTRATADA, não cabendo qualquer reembolso adicional.
              </p>
              <p style={{ textIndent: '1.25cm', marginBottom: '4pt' }}>
                6.3. O presente contrato não gera vínculo empregatício, societário ou de representação entre as partes.
              </p>
              <p style={{ textIndent: '1.25cm', marginBottom: '4pt' }}>
                6.4. Alterações somente terão validade se feitas por escrito e assinadas por ambas as partes.
              </p>
              <p style={{ textIndent: '1.25cm', marginBottom: '6pt' }}>
                6.5. O contrato obriga as partes e seus sucessores, permanecendo válido mesmo que alguma cláusula venha a ser considerada nula.
              </p>
            </div>

            {/* 7. DOS ENCARGOS E TRIBUTOS */}
            <div style={{ breakInside: 'avoid' }}>
              <h2 className="font-bold uppercase text-black font-serif mb-1" style={{ fontSize: '12pt' }}>
                7. DOS ENCARGOS E TRIBUTOS
              </h2>
              <p style={{ textIndent: '1.25cm', marginBottom: '4pt' }}>
                7.1. A CONTRATADA declara-se como única empregadora do pessoal utilizado na prestação dos serviços objeto deste contrato, responsabilizando-se integral e exclusivamente pelo cumprimento de toda a legislação trabalhista e previdenciária.
              </p>
              <p style={{ textIndent: '1.25cm', marginBottom: '6pt' }}>
                7.2. Todos os tributos, contribuições, emolumentos e demais encargos fiscais, civis e previdenciários relacionados com o presente contrato, existentes ou que vierem a ser criados ou modificados, e que devam ser suportados pela CONTRATADA nos termos da lei ou regulamentação aplicável, serão de sua exclusiva responsabilidade.
              </p>
            </div>

            {/* 8. DAS OBRIGAÇÕES DA CONTRATADA */}
            <div style={{ breakInside: 'avoid' }}>
              <h2 className="font-bold uppercase text-black font-serif mb-1" style={{ fontSize: '12pt' }}>
                8. DAS OBRIGAÇÕES DA CONTRATADA
              </h2>
              <p style={{ textIndent: '1.25cm', marginBottom: '4pt' }}>
                8.1. Constituem obrigações da CONTRATADA:
              </p>
              <p style={{ textIndent: '1.25cm', marginBottom: '2pt' }}>
                a) Executar os serviços de acordo com a melhor técnica disponível e atender às solicitações do CONTRATANTE;
              </p>
              <p style={{ textIndent: '1.25cm', marginBottom: '2pt' }}>
                b) Refazer ou desfazer, no todo ou em parte, por sua conta, sem qualquer ônus para o CONTRATANTE, os serviços realizados em desacordo com as condições estabelecidas neste contrato e na legislação;
              </p>
              <p style={{ textIndent: '1.25cm', marginBottom: '2pt' }}>
                c) Acatar integralmente as recomendações do CONTRATANTE;
              </p>
              <p style={{ textIndent: '1.25cm', marginBottom: '2pt' }}>
                d) Não infringir direitos autorais, de propriedade intelectual ou industrial durante a execução dos serviços, responsabilizando-se por indenizações e penalidades;
              </p>
              <p style={{ textIndent: '1.25cm', marginBottom: '2pt' }}>
                e) Fornecer ao CONTRATANTE, sempre que solicitado, todas as informações relativas à prestação de serviços, garantindo sua veracidade e qualidade;
              </p>
              <p style={{ textIndent: '1.25cm', marginBottom: '6pt' }}>
                f) Proporcionar aos seus empregados, sócios, prepostos e subcontratados os equipamentos exigidos pela legislação vigente, supervisionando seu uso, sob pena de suspensão dos serviços e responsabilização por atrasos e perdas.
              </p>
            </div>

            {/* 9. DAS PENALIDADES */}
            <div style={{ breakInside: 'avoid' }}>
              <h2 className="font-bold uppercase text-black font-serif mb-1" style={{ fontSize: '12pt' }}>
                9. DAS PENALIDADES
              </h2>
              <p style={{ textIndent: '1.25cm', marginBottom: '4pt' }}>
                9.1. O descumprimento de qualquer cláusula contratual sujeitará a parte infratora ao pagamento de multa de 10% (dez por cento) sobre o valor do contrato, além de perdas e danos.
              </p>
              <p style={{ textIndent: '1.25cm', marginBottom: '4pt' }}>
                9.2. O atraso no pagamento de qualquer parcela implicará multa de 2% (dois por cento), acrescida de juros de 1% (um por cento) ao mês.
              </p>
              <p style={{ textIndent: '1.25cm', marginBottom: '6pt' }}>
                9.3. Em caso de rescisão imotivada por qualquer das partes, será devida multa de 10% (dez por cento) sobre o valor total do contrato.
              </p>
            </div>

            {/* 10. DA RESCISÃO */}
            <div style={{ breakInside: 'avoid' }}>
              <h2 className="font-bold uppercase text-black font-serif mb-1" style={{ fontSize: '12pt' }}>
                10. DA RESCISÃO
              </h2>
              <p style={{ textIndent: '1.25cm', marginBottom: '4pt' }}>
                10.1. O presente contrato será rescindido de pleno direito nas seguintes hipóteses:
              </p>
              <p style={{ textIndent: '1.25cm', marginBottom: '2pt' }}>
                a) Imotivadamente, mediante notificação escrita com 30 (trinta) dias de antecedência;
              </p>
              <p style={{ textIndent: '1.25cm', marginBottom: '2pt' }}>
                b) Por inadimplemento de qualquer cláusula contratual, lei, norma técnica ou recomendações do CONTRATANTE;
              </p>
              <p style={{ textIndent: '1.25cm', marginBottom: '4pt' }}>
                c) Pedido de falência, recuperação judicial, liquidação judicial ou extrajudicial, ou dissolução de quaisquer das partes.
              </p>
              <p style={{ textIndent: '1.25cm', marginBottom: '4pt' }}>
                10.2. A rescisão ou término não desobriga a CONTRATADA da execução dos serviços já pagos.
              </p>
              <p style={{ textIndent: '1.25cm', marginBottom: '4pt' }}>
                10.3. A CONTRATADA deve deixar o local livre de pessoas e bens de sua propriedade. Caso não cumpra, o CONTRATANTE poderá fazê-lo às suas custas.
              </p>
              <p style={{ textIndent: '1.25cm', marginBottom: '6pt' }}>
                10.4. As partes permanecem obrigadas ao cumprimento das obrigações que tenham se tornado devidas na vigência deste contrato.
              </p>
            </div>

            {/* 11. DO FORO */}
            <div style={{ breakInside: 'avoid' }}>
              <h2 className="font-bold uppercase text-black font-serif mb-1" style={{ fontSize: '12pt' }}>
                11. DO FORO
              </h2>
              <p style={{ textIndent: '1.25cm', marginBottom: '8pt' }}>
                11.1. Fica eleito o foro da Comarca de Palmas, Estado do Tocantins, com renúncia a qualquer outro, por mais privilegiado que seja, para dirimir dúvidas e questões oriundas desta contratação.
              </p>
            </div>

            {/* DYNAMIC CALENDAR DATE & SIGNATURES SECTION */}
            <div style={{ breakInside: 'avoid', marginTop: '1.5cm' }} className="space-y-12 text-center">
              <p className="text-center font-serif" style={{ fontSize: '12pt' }}>
                {valOrBracket(cidadeData, 'Palmas')}/{valOrBracket(estadoData, 'TO')}, {dynamicDateText}.
              </p>

              {/* Signature Blocks with 4cm spacing */}
              <div className="grid grid-cols-1 gap-12 max-w-lg mx-auto pt-6 font-serif">
                <div>
                  <p className="mb-1 uppercase font-bold text-xs">CONTRATANTE</p>
                  <div className="border-b border-black w-64 mx-auto mb-2" style={{ height: '3.5cm' }}></div>
                  <p className="text-sm">{valOrBracket(contratanteNome, 'NOME DO CLIENTE')}</p>
                  <p className="text-xs">CPF/CNPJ: {valOrBracket(contratanteCpf, 'CPF/CNPJ DO CLIENTE')}</p>
                </div>

                <div>
                  <p className="mb-1 uppercase font-bold text-xs">CONTRATADA</p>
                  <div className="border-b border-black w-64 mx-auto mb-2" style={{ height: '3.5cm' }}></div>
                  <p className="text-sm">{fixedCompany.name}</p>
                  <p className="text-xs">CNPJ: {fixedCompany.cnpj}</p>
                  <p className="text-[11px] text-zinc-700">Sócio Administrador: {fixedCompany.representative}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* PROCURAÇÃO A4 PRINTABLE BODY */
          <div id="procuracao-body-print" className="space-y-6 font-serif text-[12pt] text-black">
            <div style={{ breakInside: 'avoid' }}>
              <h2 className="font-bold uppercase text-black font-serif mb-1" style={{ fontSize: '12pt' }}>
                OUTORGANTE:
              </h2>
              <p style={{ textIndent: '1.25cm', marginBottom: '6pt' }}>
                {valOrBracket(contratanteNome, 'NOME DO CLIENTE')}, inscrito(a) no CPF/CNPJ sob o nº {valOrBracket(contratanteCpf, 'CPF/CNPJ DO CLIENTE')}, estabelecido(a)/residente em {valOrBracket(contratanteEndereco, 'ENDEREÇO DO CLIENTE')}, no município de {valOrBracket(cidadeData, 'MUNICÍPIO')} – {valOrBracket(estadoData, 'UF')}.
              </p>
            </div>

            <div style={{ breakInside: 'avoid' }}>
              <h2 className="font-bold uppercase text-black font-serif mb-1" style={{ fontSize: '12pt' }}>
                OUTORGADO:
              </h2>
              <p style={{ textIndent: '1.25cm', marginBottom: '6pt' }}>
                {fixedCompany.name}, pessoa jurídica de direito privado, inscrita no CNPJ sob nº {fixedCompany.cnpj}, e seu Engenheiro Responsável Técnico Cadastrado {valOrBracket(selectedEngineer?.name || fixedCompany.representative, 'NOME DO ENGENHEIRO')}, portador do registro profissional {valOrBracket(selectedEngineer?.crea || 'CREA-TO 5069821-X', 'CREA DO ENGENHEIRO')}.
              </p>
            </div>

            <div style={{ breakInside: 'avoid' }}>
              <h2 className="font-bold uppercase text-black font-serif mb-1" style={{ fontSize: '12pt' }}>
                PODERES DE REPRESENTAÇÃO:
              </h2>
              <p style={{ textIndent: '1.25cm', marginBottom: '6pt' }}>
                Pelo presente instrumento particular de procuração, o OUTORGANTE nomeia e constitui o OUTORGADO e o Engenheiro Responsável como seus bastantes procuradores com poderes especiais para representá-lo exclusivamente perante a Concessionária de Energia Elétrica {valOrBracket(selectedObra?.concessionaria, 'CONCESSIONÁRIA')}, podendo requerer estudos de viabilidade técnica, emissão de Parecer de Acesso, solicitar aprovação de projetos de engenharia elétrica, emitir Anotação de Responsabilidade Técnica (ART), solicitar vistorias de padrão/subestação e firmar o Termo de Ligação e Encerramento da obra "{valOrBracket(selectedObra?.projectName, 'NOME DA OBRA')}" (Número do Projeto: {valOrBracket(selectedObra?.projectNumber || selectedObra?.code, 'NÚMERO DO PROJETO')}).
              </p>
              <p style={{ textIndent: '1.25cm', marginBottom: '6pt' }}>
                O presente instrumento é válido até a conclusão efetiva da ligação da referida obra.
              </p>
            </div>

            {/* DYNAMIC CALENDAR DATE & SIGNATURES SECTION */}
            <div style={{ breakInside: 'avoid', marginTop: '2.0cm' }} className="space-y-12 text-center">
              <p className="text-center font-serif" style={{ fontSize: '12pt' }}>
                {valOrBracket(cidadeData, 'Palmas')}/{valOrBracket(estadoData, 'TO')}, {dynamicDateText}.
              </p>

              <div className="grid grid-cols-1 gap-12 max-w-lg mx-auto pt-6 font-serif">
                <div>
                  <p className="mb-1 uppercase font-bold text-xs">OUTORGANTE</p>
                  <div className="border-b border-black w-64 mx-auto mb-2" style={{ height: '3.5cm' }}></div>
                  <p className="text-sm">{valOrBracket(contratanteNome, 'NOME DO CLIENTE')}</p>
                  <p className="text-xs">CPF/CNPJ: {valOrBracket(contratanteCpf, 'CPF/CNPJ DO CLIENTE')}</p>
                </div>

                <div>
                  <p className="mb-1 uppercase font-bold text-xs">ENGENHEIRO OUTORGADO</p>
                  <div className="border-b border-black w-64 mx-auto mb-2" style={{ height: '3.5cm' }}></div>
                  <p className="text-sm">{valOrBracket(selectedEngineer?.name || fixedCompany.representative, 'NOME DO ENGENHEIRO')}</p>
                  <p className="text-xs">REGISTRO CREA: {valOrBracket(selectedEngineer?.crea || 'CREA-TO 5069821-X', 'CREA')}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* VIEW: HISTÓRICO DE CONTRATOS APROVADOS */}
      {activeMainTab === 'historico_aprovados' && (
        <div className="space-y-6 font-sans no-print">
          {/* Header & KPI Summary */}
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-bold text-zinc-100 flex items-center space-x-2 font-mono">
                <History className="w-5 h-5 text-emerald-400" />
                <span>Histórico de Contratos Aprovados & Documentos Homologados</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Lista de todos os contratos aprovados no sistema. Contratos vinculados a obras são anexados automaticamente na aba de documentos da respectiva obra; contratos diretos sem obra são armazenados nesta central.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                <span className="text-zinc-400 block text-[10px]">Total de Contratos Aprovados</span>
                <span className="text-xl font-bold text-emerald-400">{approvedContracts.length}</span>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                <span className="text-zinc-400 block text-[10px]">Anexados em Obras</span>
                <span className="text-xl font-bold text-blue-400">
                  {approvedContracts.filter((c) => !!c.obraId).length} Contrato(s)
                </span>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                <span className="text-zinc-400 block text-[10px]">Contratos Diretos (Sem Obra)</span>
                <span className="text-xl font-bold text-amber-400">
                  {approvedContracts.filter((c) => !c.obraId).length} Contrato(s)
                </span>
              </div>
            </div>
          </div>

          {/* Approved Contracts Table */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono">
              Registros Oficiais de Contratos
            </h3>

            {approvedContracts.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 font-mono text-xs space-y-3">
                <p>Nenhum contrato foi aprovado ainda no sistema.</p>
                <button
                  onClick={() => setActiveMainTab('gerador')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                >
                  Ir para o Gerador & Aprovar o Primeiro Contrato
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400 text-[10px] uppercase tracking-wider">
                      <th className="py-2.5 px-3">Nº Contrato</th>
                      <th className="py-2.5 px-3">Cliente / Contratante</th>
                      <th className="py-2.5 px-3">Destino / Obra Vinculada</th>
                      <th className="py-2.5 px-3 text-right">Valor Contratado</th>
                      <th className="py-2.5 px-3 text-center">Modalidade</th>
                      <th className="py-2.5 px-3 text-center">Data Aprovação</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 font-medium">
                    {approvedContracts.map((c) => (
                      <tr key={c.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="py-3 px-3 font-bold text-emerald-400">{c.contractNumber}</td>
                        <td className="py-3 px-3 font-sans text-zinc-100 font-semibold">{c.clientName}</td>
                        <td className="py-3 px-3 font-sans">
                          {c.obraCode ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-mono font-bold">
                              <Paperclip className="w-3 h-3" />
                              <span>{c.obraCode} - {c.projectName}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono">
                              <span>Sem Obra Vinculada (Contrato Direto)</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-zinc-100">
                          R$ {c.contractValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-zinc-300">
                          <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px]">
                            {c.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center text-zinc-400">{c.approvedAt}</td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-[10px]">
                            ✓ {c.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => {
                              setSelectedClientId(c.clientId);
                              if (c.obraId) setSelectedObraId(c.obraId);
                              setActiveMainTab('gerador');
                            }}
                            className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-blue-400 font-bold text-[11px] border border-zinc-700"
                          >
                            Reabrir no Gerador
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* APPROVAL & HOMOLOGATION MODAL */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4 no-print">
          <div className="w-full max-w-xl rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 space-y-4 font-sans text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center space-x-2 text-emerald-400 font-mono">
                <ShieldCheck className="w-6 h-6" />
                <h3 className="text-sm font-bold text-zinc-100 uppercase">Aprovação & Homologação de Contrato</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowApprovalModal(false)}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contract Summary Box */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 font-mono">
              <div className="flex justify-between border-b border-zinc-800/80 pb-2">
                <span className="text-zinc-400">Cliente / Contratante:</span>
                <span className="font-bold text-zinc-100">{selectedClient?.name || contratanteNome || 'Cliente Geral'}</span>
              </div>

              <div className="flex justify-between border-b border-zinc-800/80 pb-2">
                <span className="text-zinc-400">Obra Vinculada:</span>
                <span className="font-bold text-blue-400">
                  {selectedObraId !== 'NONE' && selectedObra
                    ? `${selectedObra.projectNumber || selectedObra.code} - ${selectedObra.projectName}`
                    : 'Sem Obra Vinculada (Contrato Direto)'}
                </span>
              </div>

              <div className="flex justify-between border-b border-zinc-800/80 pb-2">
                <span className="text-zinc-400">Valor do Contrato:</span>
                <span className="font-bold text-emerald-400 text-sm">
                  R$ {(Number((valorContrato || '').replace(/\D/g, '')) || selectedObra?.totalValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-zinc-400">Modalidade de Pagamento:</span>
                <span className="font-bold text-amber-400">{formaPagamentoTipo}</span>
              </div>
            </div>

            {/* Destination Notice */}
            {selectedObraId !== 'NONE' && selectedObra ? (
              <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 space-y-1">
                <div className="flex items-center space-x-1.5 font-bold">
                  <Paperclip className="w-4 h-4 text-blue-400" />
                  <span>Anexo Automático em Documentos da Obra</span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  Ao confirmar a aprovação, o contrato será automaticamente vinculado e anexado à aba de <strong className="text-blue-400 font-mono">Documentos da Obra ({selectedObra.projectNumber || selectedObra.code})</strong> sob a categoria <strong className="text-zinc-100">Contrato</strong>.
                </p>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 space-y-1">
                <div className="flex items-center space-x-1.5 font-bold">
                  <History className="w-4 h-4 text-amber-400" />
                  <span>Armazenamento no Histórico Geral de Contratos</span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  Como nenhuma obra foi selecionada, este contrato será homologado e armazenado na aba <strong className="text-amber-400 font-mono">Histórico de Contratos Aprovados</strong>.
                </p>
              </div>
            )}

            {/* Form Settings */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="font-semibold text-zinc-300 block mb-1">Responsável pela Aprovação / Homologação</label>
                <input
                  type="text"
                  value={approvalResponsible}
                  onChange={(e) => setApprovalResponsible(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-300 block mb-1">Status Oficial do Contrato</label>
                <select
                  value={approvalStatus}
                  onChange={(e) => setApprovalStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 font-bold focus:outline-none focus:border-blue-500 font-mono"
                >
                  <option value="Aprovado">✓ Aprovado e Homologado</option>
                  <option value="Assinado">✍️ Assinado pelas Partes</option>
                  <option value="Em Execução">⚡ Em Execução na Obra</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowApprovalModal(false)}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmApprove}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Confirmar Aprovação & Anexar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
