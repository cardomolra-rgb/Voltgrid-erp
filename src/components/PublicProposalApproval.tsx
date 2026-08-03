import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  FileText,
  ShieldCheck,
  Building2,
  Calendar,
  DollarSign,
  User,
  CreditCard,
  Printer,
  ArrowRight,
  Sparkles,
  Lock,
  MessageSquare,
  X,
} from 'lucide-react';
import { CommercialProposal, SystemCompanyConfig } from '../types';

interface PublicProposalApprovalProps {
  proposal: CommercialProposal;
  companyConfig: SystemCompanyConfig;
  onApprove: (proposal: CommercialProposal, signerName: string, signerCpf: string) => void;
  onReject?: (proposal: CommercialProposal, reason: string) => void;
  onClose?: () => void;
}

export const PublicProposalApproval: React.FC<PublicProposalApprovalProps> = ({
  proposal,
  companyConfig,
  onApprove,
  onReject,
  onClose,
}) => {
  const [signerName, setSignerName] = useState(proposal.clientName);
  const [signerCpf, setSignerCpf] = useState(proposal.clientCpfCnpj);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [isApproved, setIsApproved] = useState(proposal.status === 'Aprovada');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const handleConfirmApproval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedTerms || !signerName.trim() || !signerCpf.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsApproved(true);
      onApprove(proposal, signerName.trim(), signerCpf.trim());
    }, 600);
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason.trim()) return;
    if (onReject) {
      onReject(proposal, rejectReason.trim());
    }
    setShowRejectModal(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans p-4 sm:p-8 flex flex-col items-center justify-start overflow-y-auto">
      {/* Top Banner Navigation */}
      <div className="w-full max-w-4xl flex items-center justify-between py-4 px-6 mb-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 backdrop-blur-md shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-mono font-bold text-sm">
            PRO
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-zinc-100 font-mono uppercase tracking-tight">
              Portal de Aceite Digital — ProObras ERP
            </h1>
            <p className="text-[11px] text-zinc-400 font-mono">
              Proposta Comercial Nº <span className="text-amber-400 font-bold">{proposal.proposalNumber}</span> ({proposal.currentVersion})
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Voltar ao Sistema</span>
          </button>
        )}
      </div>

      {/* Main Proposal Card Container */}
      <div className="w-full max-w-4xl rounded-2xl bg-white text-zinc-950 p-6 sm:p-10 space-y-6 shadow-2xl border border-zinc-200">
        {/* PDF Header with Company Logo */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-zinc-900 pb-4">
          <div className="flex items-center space-x-4">
            {companyConfig.logoUrl ? (
              <img
                src={companyConfig.logoUrl}
                alt="Logo Empresa"
                className="h-14 max-w-[160px] object-contain shrink-0"
              />
            ) : (
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white font-mono text-sm shrink-0 shadow-md"
                style={{ backgroundColor: companyConfig.primaryColor || '#2563eb' }}
              >
                {companyConfig.nomeFantasia?.substring(0, 2).toUpperCase() || 'PV'}
              </div>
            )}

            <div className="space-y-0.5">
              <h2 className="text-base font-black text-zinc-950 font-mono tracking-tight uppercase leading-tight">
                {companyConfig.razaoSocial || 'MOURA SOLUÇÕES ELÉTRICAS LTDA'}
              </h2>
              <p className="text-[11px] text-zinc-600 font-mono">
                CNPJ: {companyConfig.cnpj} | CREA Jurídico: {companyConfig.creaJuridico}
              </p>
              <p className="text-[10.5px] text-zinc-500">
                {companyConfig.endereco} — {companyConfig.cidade}/{companyConfig.estado} | Tel: {companyConfig.telefone}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <span
              className="text-[10px] font-extrabold uppercase font-mono tracking-wider px-3 py-1 rounded text-white block mb-1 shadow-sm"
              style={{ backgroundColor: companyConfig.primaryColor || '#2563eb' }}
            >
              PROPOSTA COMERCIAL
            </span>
            <span className="text-base font-black font-mono text-zinc-950 block">{proposal.proposalNumber}</span>
            <span className="text-xs font-mono text-zinc-500">Validade: {proposal.validityDate}</span>
          </div>
        </div>

        {/* Status Badge Notification */}
        {isApproved ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold text-sm text-emerald-900 block">Proposta APROVADA Digitalmente!</span>
                <span className="text-emerald-700 text-[11px]">
                  Esta proposta foi aceita e homologada em nosso sistema. Obrigado pela parceria!
                </span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-mono font-bold text-[10px] uppercase tracking-wider">
              APROVADA
            </span>
          </div>
        ) : proposal.status === 'Reprovada' ? (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-800 text-xs font-semibold flex items-center space-x-3">
            <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
            <div>
              <span className="font-bold text-sm text-rose-900 block">Proposta Recusada ou em Revisão</span>
              <span className="text-rose-700 text-[11px]">
                O cliente solicitou ajustes nesta proposta comercial.
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span>Aguardando seu aceite digital para iniciar os serviços de energia.</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-zinc-950 font-mono font-extrabold text-[10px] uppercase">
              PENDENTE DE ACEITE
            </span>
          </div>
        )}

        {/* Client & Proposal Metadata Box */}
        <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-zinc-500 uppercase font-mono tracking-wider block border-b border-zinc-200 pb-1">
              DADOS DO CLIENTE
            </span>
            <p className="font-bold text-zinc-950 text-sm">{proposal.clientName}</p>
            <p className="text-zinc-700 font-mono">CPF/CNPJ: {proposal.clientCpfCnpj}</p>
            <p className="text-zinc-700">Endereço: {proposal.clientAddress} ({proposal.clientCity}/{proposal.clientState})</p>
            <p className="text-zinc-700">Contato: {proposal.clientPhone} | {proposal.clientEmail}</p>
          </div>

          <div className="space-y-1 sm:text-right">
            <span className="text-[10px] font-bold text-zinc-500 uppercase font-mono tracking-wider block border-b border-zinc-200 pb-1">
              DETALHES DO ORÇAMENTO
            </span>
            <p className="text-zinc-700">Data da Proposta: <strong className="font-mono text-zinc-950">{proposal.date}</strong></p>
            <p className="text-zinc-700">Validade do Orçamento: <strong className="font-mono text-zinc-950">{proposal.validityDate}</strong></p>
            <p className="text-zinc-700">Tipo de Serviço: <strong className="text-zinc-950">{proposal.proposalType}</strong></p>
            <p className="text-zinc-700">Responsável Comercial: <strong className="text-zinc-950">{proposal.sellerName}</strong></p>
          </div>
        </div>

        {/* Items Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-zinc-900 uppercase font-mono tracking-wider border-b-2 border-zinc-950 pb-1">
            1. ITENS E ESPECIFICAÇÕES DOS SERVIÇOS
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[550px]">
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
                {proposal.items.map((it, idx) => (
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
        </div>

        {/* Total Value Summary Box */}
        <div className="p-4 rounded-xl bg-zinc-900 text-white font-mono space-y-1 shadow-md">
          <div className="flex items-center justify-between text-sm">
            <span className="font-black uppercase tracking-wider">TOTAL GERAL DA PROPOSTA COMERCIAL:</span>
            <span className="text-xl font-black text-emerald-400">R$ {proposal.totalValue.toLocaleString('pt-BR')}</span>
          </div>
          <div className="text-xs text-zinc-300 font-sans italic pt-1 border-t border-zinc-800">
            Valor Por Extenso: <strong className="text-amber-300">{proposal.totalValueInWords}</strong>
          </div>
        </div>

        {/* Commercial Conditions */}
        <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2 text-xs">
          <h3 className="text-xs font-bold text-zinc-900 uppercase font-mono tracking-wider border-b border-zinc-200 pb-1">
            2. CONDIÇÕES COMERCIAIS E GARANTIAS
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-zinc-800 text-xs">
            <div>• Prazo de Execução: <strong>{proposal.conditions?.executionTerm}</strong></div>
            <div>• Prazo de Entrega: <strong>{proposal.conditions?.deliveryTerm}</strong></div>
            <div>• Forma de Pagamento: <strong>{proposal.conditions?.paymentMethod}</strong></div>
            <div>• Garantia Técnica: <strong>{proposal.conditions?.warranty}</strong></div>
            <div className="sm:col-span-2">• Responsabilidades da Contratada: {proposal.conditions?.companyResponsibilities}</div>
            <div className="sm:col-span-2">• Responsabilidades do Contratante: {proposal.conditions?.clientResponsibilities}</div>
          </div>
        </div>

        {/* DIGITAL APPROVAL FORM BOX */}
        {!isApproved && proposal.status !== 'Reprovada' && (
          <div className="p-6 rounded-2xl bg-zinc-900 text-zinc-100 border border-amber-500/40 shadow-xl space-y-4">
            <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-sm text-zinc-100 font-mono">Formulário de Aceite & Assinatura Digital</h3>
            </div>

            <form onSubmit={handleConfirmApproval} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-300 font-semibold block mb-1">
                    Nome do Responsável pelo Aceite
                  </label>
                  <input
                    type="text"
                    required
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-300 font-semibold block mb-1">
                    CPF ou CNPJ do Assinante
                  </label>
                  <input
                    type="text"
                    required
                    value={signerCpf}
                    onChange={(e) => setSignerCpf(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-start space-x-3 pt-2">
                <input
                  type="checkbox"
                  id="agree-checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-0.5 rounded bg-zinc-950 border-zinc-700 text-emerald-500 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="agree-checkbox" className="text-xs text-zinc-300 cursor-pointer leading-relaxed">
                  Declaro que li e concordo integralmente com os itens, especificações técnicas, prazos e condições comerciais descritos nesta Proposta Comercial nº <strong className="text-white font-mono">{proposal.proposalNumber}</strong>.
                </label>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(true)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-rose-400 text-xs font-semibold flex items-center justify-center space-x-1.5 cursor-pointer transition-all"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Solicitar Ajustes / Recusar</span>
                </button>

                <button
                  type="submit"
                  disabled={!agreedTerms || !signerName.trim() || !signerCpf.trim() || isSubmitting}
                  className={`w-full sm:w-auto px-8 py-3 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-2 shadow-lg transition-all cursor-pointer ${
                    agreedTerms && signerName.trim() && signerCpf.trim()
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-950/50 scale-102'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-60'
                  }`}
                >
                  {isSubmitting ? (
                    <span>Processando Assinatura...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4.5 h-4.5" />
                      <span>APROVAR PROPOSTA COMERCIAL AGORA</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Confirmation Footer */}
        <div className="pt-4 border-t border-zinc-200 text-center text-[10px] text-zinc-500 font-mono space-y-1">
          <p className="font-bold text-zinc-700">ProObras ERP — Sistema Integrado de Gestão de Obras de Energia Elétrica</p>
          <p>Documento autenticado via Assinatura Digital ProObras. Hash de Validação: {proposal.id}</p>
        </div>
      </div>

      {/* MODAL: SOLICITAR AJUSTES / REJEITAR */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans">
          <div className="w-full max-w-md rounded-2xl bg-zinc-950 border border-zinc-800 p-6 space-y-4 text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100 font-mono flex items-center space-x-2">
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>Solicitar Ajustes na Proposta</span>
              </h3>
              <button onClick={() => setShowRejectModal(false)} className="text-zinc-400 hover:text-zinc-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-3">
              <div>
                <label className="text-zinc-300 font-semibold block mb-1">
                  Descreva as alterações ou motivos de recusa:
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Ex: Gostaria de alterar a quantidade de postes para 15 unidades e revisar o parcelamento..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-400 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Enviar Solicitação ao Engenheiro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
