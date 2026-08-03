import React, { useState } from 'react';
import { UserCheck, ShieldCheck, Award, Plus, Edit, Trash2, Search, DollarSign, X, Paperclip, FileText, Phone, MapPin, CreditCard, Building, Eye, User, Calendar, TrendingDown } from 'lucide-react';
import { Employee, EmployeeDocument, Obra, EmployeePaymentLog } from '../types';

interface HRModuleProps {
  employees: Employee[];
  obras?: Obra[];
  paymentLogs?: EmployeePaymentLog[];
  onAddEmployee: (employee: Employee) => void;
  onUpdateEmployee?: (employee: Employee) => void;
  onDeleteEmployee?: (employeeId: string) => void;
  onAddPaymentLog?: (log: EmployeePaymentLog) => void;
  onUpdatePaymentLog?: (log: EmployeePaymentLog) => void;
  onDeletePaymentLog?: (logId: string) => void;
}

export const HRModule: React.FC<HRModuleProps> = ({
  employees,
  obras = [],
  paymentLogs = [],
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  onAddPaymentLog,
  onUpdatePaymentLog,
  onDeletePaymentLog,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'colaboradores' | 'pagamentos'>('colaboradores');
  const [searchTerm, setSearchTerm] = useState('');
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [activeFormTab, setActiveFormTab] = useState<'dados' | 'pagamento' | 'documentos'>('dados');

  // Form State for Payment Log (Diárias & Vales)
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingPaymentLog, setEditingPaymentLog] = useState<EmployeePaymentLog | null>(null);
  const [payEmployeeId, setPayEmployeeId] = useState(employees[0]?.id || '');
  const [payObraId, setPayObraId] = useState(obras[0]?.id || '');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payDaysWorked, setPayDaysWorked] = useState(8);
  const [payDailyRate, setPayDailyRate] = useState(150);
  const [payAdvancesValue, setPayAdvancesValue] = useState(0);
  const [payDescription, setPayDescription] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState<Employee['role']>('Eletricista Montador');
  const [salary, setSalary] = useState(3800);
  const [dailyRate, setDailyRate] = useState(150);
  const [status, setStatus] = useState<Employee['status']>('Ativo');

  // Payment State
  const [pixKey, setPixKey] = useState('');
  const [pixType, setPixType] = useState('CPF');
  const [bankName, setBankName] = useState('Itaú Unibanco');
  const [agency, setAgency] = useState('0481');
  const [account, setAccount] = useState('29810-4');
  const [accountType, setAccountType] = useState('Corrente');

  // Attached Documents State
  const [attachedDocs, setAttachedDocs] = useState<EmployeeDocument[]>([]);
  const [docCategory, setDocCategory] = useState('CNH / Habilitação');
  const [docFileName, setDocFileName] = useState('');
  const [docFileSize, setDocFileSize] = useState('');
  const [docFileUrl, setDocFileUrl] = useState('');

  // Viewer State for attached documents
  const [viewingDoc, setViewingDoc] = useState<EmployeeDocument | null>(null);

  const filteredEmployees = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.cpf && e.cpf.includes(searchTerm))
  );

  const handleOpenAddEmployee = () => {
    setEditingEmployee(null);
    setName('');
    setPhone('');
    setCpf('');
    setAddress('');
    setRole('Eletricista Montador');
    setSalary(3800);
    setDailyRate(150);
    setStatus('Ativo');
    setPixKey('');
    setPixType('CPF');
    setBankName('Itaú Unibanco');
    setAgency('0481');
    setAccount('29810-4');
    setAccountType('Corrente');
    setAttachedDocs([]);
    setActiveFormTab('dados');
    setShowEmployeeModal(true);
  };

  const handleOpenAddPaymentModal = () => {
    const defaultEmp = employees[0];
    setEditingPaymentLog(null);
    setPayEmployeeId(defaultEmp?.id || '');
    setPayObraId(obras[0]?.id || '');
    setPayDate(new Date().toISOString().split('T')[0]);
    setPayDaysWorked(8);
    setPayDailyRate(defaultEmp?.dailyRate || 150);
    setPayAdvancesValue(0);
    setPayDescription('');
    setShowPaymentModal(true);
  };

  const handleOpenEditPaymentModal = (log: EmployeePaymentLog) => {
    setEditingPaymentLog(log);
    setPayEmployeeId(log.employeeId);
    setPayObraId(log.obraId || obras[0]?.id || '');
    setPayDate(log.paymentDate || new Date().toISOString().split('T')[0]);
    setPayDaysWorked(log.daysWorked);
    setPayDailyRate(log.dailyRate);
    setPayAdvancesValue(log.advancesValue);
    setPayDescription(log.description || '');
    setShowPaymentModal(true);
  };

  const handleDeletePaymentLogClick = (logId: string) => {
    if (confirm('Tem certeza de que deseja excluir este lançamento de pagamento? O título correspondente no Contas a Pagar do Financeiro (Mão de Obra) também será removido.')) {
      if (onDeletePaymentLog) {
        onDeletePaymentLog(logId);
      }
    }
  };

  const handleSavePaymentLog = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === payEmployeeId);
    const obra = obras.find((o) => o.id === payObraId);
    const gross = payDaysWorked * payDailyRate;
    const net = gross - payAdvancesValue;

    if (editingPaymentLog && onUpdatePaymentLog) {
      const updatedLog: EmployeePaymentLog = {
        ...editingPaymentLog,
        employeeId: emp?.id || editingPaymentLog.employeeId,
        employeeName: emp?.name || editingPaymentLog.employeeName,
        obraId: obra?.id || editingPaymentLog.obraId,
        obraCode: obra?.projectNumber || obra?.code || editingPaymentLog.obraCode,
        paymentDate: payDate,
        daysWorked: payDaysWorked,
        dailyRate: payDailyRate,
        grossAmount: gross,
        advancesValue: payAdvancesValue,
        netAmount: net,
        description: payDescription,
        status: 'Pago',
      };
      onUpdatePaymentLog(updatedLog);
    } else {
      const newLog: EmployeePaymentLog = {
        id: `HRPAY-${Date.now()}`,
        employeeId: emp?.id || employees[0]?.id || 'EMP-001',
        employeeName: emp?.name || employees[0]?.name || 'Colaborador',
        obraId: obra?.id || obras[0]?.id || 'OBR-2026-001',
        obraCode: obra?.projectNumber || obra?.code || obras[0]?.projectNumber || obras[0]?.code || 'PRJ-001',
        paymentDate: payDate,
        daysWorked: payDaysWorked,
        dailyRate: payDailyRate,
        grossAmount: gross,
        advancesValue: payAdvancesValue,
        netAmount: net,
        description: payDescription,
        status: 'Pago',
      };
      if (onAddPaymentLog) {
        onAddPaymentLog(newLog);
      }
    }

    setShowPaymentModal(false);
  };

  const handleOpenEditEmployee = (emp: Employee) => {
    setEditingEmployee(emp);
    setName(emp.name);
    setPhone(emp.phone || '');
    setCpf(emp.cpf || '');
    setAddress(emp.address || '');
    setRole(emp.role);
    setSalary(emp.salary || 3800);
    setDailyRate(emp.dailyRate || 150);
    setStatus(emp.status || 'Ativo');
    setPixKey(emp.paymentDetails?.pixKey || emp.pixKey || '');
    setPixType(emp.paymentDetails?.pixType || 'CPF');
    setBankName(emp.paymentDetails?.bankName || 'Itaú Unibanco');
    setAgency(emp.paymentDetails?.agency || '0481');
    setAccount(emp.paymentDetails?.account || '29810-4');
    setAccountType(emp.paymentDetails?.accountType || 'Corrente');
    setAttachedDocs(emp.attachedDocs || []);
    setActiveFormTab('dados');
    setShowEmployeeModal(true);
  };

  const handleDeleteEmployeeClick = (empId: string) => {
    if (confirm('Tem certeza de que deseja excluir este colaborador da equipe?')) {
      if (onDeleteEmployee) {
        onDeleteEmployee(empId);
      }
    }
  };

  const handleDocFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDocFileName(file.name);
      setDocFileSize(`${(file.size / 1024).toFixed(1)} KB`);
      const url = URL.createObjectURL(file);
      setDocFileUrl(url);
    }
  };

  const handleAddDocumentToList = () => {
    if (!docFileName) {
      alert('Por favor, selecione um arquivo de documento para anexar.');
      return;
    }

    const newDoc: EmployeeDocument = {
      id: `DOC-${Date.now()}`,
      fileName: `${docCategory}: ${docFileName}`,
      fileType: docCategory,
      fileSize: docFileSize,
      fileUrl: docFileUrl || `blob:${docFileName}`,
      uploadedAt: new Date().toISOString().split('T')[0],
    };

    setAttachedDocs((prev) => [...prev, newDoc]);
    setDocFileName('');
    setDocFileSize('');
    setDocFileUrl('');
  };

  const handleRemoveDocumentFromList = (docId: string) => {
    setAttachedDocs((prev) => prev.filter((d) => d.id !== docId));
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert('Por favor, preencha o nome completo do colaborador.');
      return;
    }

    if (editingEmployee && onUpdateEmployee) {
      const updatedEmployee: Employee = {
        ...editingEmployee,
        name,
        phone: phone || editingEmployee.phone,
        cpf: cpf || editingEmployee.cpf,
        address: address || editingEmployee.address,
        role,
        salary,
        dailyRate,
        pixKey: pixKey || cpf || editingEmployee.pixKey,
        bankInfo: `${bankName} • Ag: ${agency} • Cc: ${account}`,
        paymentDetails: {
          pixKey: pixKey || cpf,
          pixType,
          bankName,
          agency,
          account,
          accountType,
        },
        status,
        documents: attachedDocs.map((d) => d.fileName),
        attachedDocs,
      };
      onUpdateEmployee(updatedEmployee);
    } else {
      const newEmployee: Employee = {
        id: `EMP-${Date.now()}`,
        name,
        phone: phone || '(11) 98765-4321',
        cpf: cpf || '000.000.000-00',
        address: address || 'Rua das Indústrias, 500 - São Paulo, SP',
        role,
        salary,
        dailyRate,
        pixKey: pixKey || cpf || '000.000.000-00',
        bankInfo: `${bankName} • Ag: ${agency} • Cc: ${account}`,
        paymentDetails: {
          pixKey: pixKey || cpf,
          pixType,
          bankName,
          agency,
          account,
          accountType,
        },
        status,
        certifications: [
          { title: 'NR-10 Segurança em Elétrica', validUntil: '2027-06-30', status: 'Ativo' },
          { title: 'NR-35 Trabalho em Altura', validUntil: '2027-06-30', status: 'Ativo' },
          { title: 'SEP Sistema Elétrico Potência', validUntil: '2027-12-31', status: 'Ativo' },
        ],
        epiIssued: ['Capacete Classe B 20kV', 'Bota Isolante 10kV', 'Luva Borracha Classe 2'],
        totalOvertimeHours: 0,
        documents: attachedDocs.map((d) => d.fileName),
        attachedDocs,
      };
      onAddEmployee(newEmployee);
    }

    setShowEmployeeModal(false);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-base font-semibold text-zinc-100 flex items-center space-x-2 font-mono">
            <UserCheck className="w-5 h-5 text-blue-500" />
            <span>Recursos Humanos, Gestão de Equipes & Fechamento de Diárias</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Cadastro de colaboradores, controle de NR-10/NR-35, fechamento de diárias, desconto de vales e integração com DRE.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Button 1: Cadastrar Colaborador */}
          <button
            onClick={handleOpenAddEmployee}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Cadastrar Colaborador</span>
          </button>

          {/* Button 2: Lançar Diárias / Vales */}
          <button
            onClick={handleOpenAddPaymentModal}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md transition-all cursor-pointer"
          >
            <DollarSign className="w-4 h-4 stroke-[2.5]" />
            <span>+ Lançar Diárias / Vales</span>
          </button>
        </div>
      </div>

      {/* Subtab Navigation Bar */}
      <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3 font-mono">
        <button
          type="button"
          onClick={() => setActiveSubTab('colaboradores')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'colaboradores'
              ? 'bg-zinc-100 text-zinc-950 font-extrabold shadow-sm'
              : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
          }`}
        >
          👥 Colaboradores & Equipe ({employees.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('pagamentos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'pagamentos'
              ? 'bg-emerald-500 text-zinc-950 font-extrabold shadow-sm'
              : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
          }`}
        >
          💳 Histórico de Pagamentos de Diárias & Vales ({paymentLogs.length})
        </button>
      </div>

      {/* SUBTAB 1: COLABORADORES & EQUIPE */}
      {activeSubTab === 'colaboradores' && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar por nome, CPF ou função..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-sans"
            />
          </div>

      {/* Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEmployees.map((emp) => (
          <div
            key={emp.id}
            className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm space-y-4 hover:border-zinc-700 transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold text-[10px] font-mono">
                  {emp.role}
                </span>
                <h3 className="text-sm font-extrabold text-zinc-100 mt-1 flex items-center space-x-1.5">
                  <User className="w-4 h-4 text-blue-400" />
                  <span>{emp.name}</span>
                </h3>
                {emp.cpf && (
                  <p className="text-[11px] font-mono text-zinc-400">CPF: {emp.cpf} • Tel: {emp.phone || 'Não informado'}</p>
                )}
                {emp.address && (
                  <p className="text-[10px] text-zinc-500 flex items-center space-x-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-zinc-500" />
                    <span>{emp.address}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {emp.status}
                </span>

                {/* Actions: Edit & Delete */}
                <button
                  type="button"
                  onClick={() => handleOpenEditEmployee(emp)}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-blue-600 text-zinc-400 hover:text-white transition-colors"
                  title="Editar Colaborador"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteEmployeeClick(emp.id)}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-600 text-zinc-400 hover:text-white transition-colors"
                  title="Excluir Colaborador"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Payment Details Box */}
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase block">Dados para Pagamento / PIX</span>
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-400">Chave PIX:</span>
                <span className="font-bold text-emerald-400">{emp.pixKey}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-400">Banco/Agência:</span>
                <span className="font-bold text-zinc-200">{emp.bankInfo}</span>
              </div>
            </div>

            {/* Attached Documents List */}
            {emp.attachedDocs && emp.attachedDocs.length > 0 && (
              <div className="space-y-1.5 p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs">
                <span className="text-[10px] font-bold text-zinc-400 uppercase font-mono block">
                  Documentos Anetados ({emp.attachedDocs.length})
                </span>
                <div className="space-y-1">
                  {emp.attachedDocs.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-1.5 rounded bg-zinc-900 border border-zinc-800/80 text-[11px]">
                      <div className="flex items-center space-x-1.5 truncate">
                        <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span className="text-zinc-200 truncate">{doc.fileName}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setViewingDoc(doc)}
                        className="px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600 hover:text-white font-bold text-[10px] inline-flex items-center space-x-1 transition-all cursor-pointer shrink-0"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Ver</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications Box */}
            <div className="space-y-2 bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-xs font-mono">
              <span className="text-[10px] font-bold text-zinc-400 uppercase block">
                Certificações Normativas
              </span>
              <div className="space-y-1">
                {emp.certifications.map((cert) => (
                  <div key={cert.title} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center space-x-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-bold text-zinc-200">{cert.title}</span>
                    </div>

                    <span className="font-bold text-emerald-400">
                      Validade: {cert.validUntil}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs font-mono">
              <div>
                <span className="text-zinc-400 text-[10px] block">Salário Base:</span>
                <span className="font-bold text-zinc-100">
                  R$ {emp.salary.toLocaleString('pt-BR')}
                </span>
              </div>

              <div className="text-right">
                <span className="text-zinc-400 text-[10px] block">Valor Diária de Campo:</span>
                <span className="font-bold text-amber-400">
                  R$ {emp.dailyRate.toLocaleString('pt-BR')} / dia
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )}

      {/* SUBTAB 2: HISTÓRICO DE PAGAMENTOS DE DIÁRIAS & VALES */}
      {activeSubTab === 'pagamentos' && (
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm space-y-4 font-sans">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
            <div>
              <h3 className="text-xs font-extrabold text-zinc-100 uppercase font-mono flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Histórico de Fechamento de Diárias & Desconto de Vales</span>
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Valores calculados por diária x dias trabalhados, com desconto de vales e lançamento automático no DRE.
              </p>
            </div>

            <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              ⚡ Sincronizado com Contas a Pagar (Mão de Obra) & DRE
            </span>
          </div>

          {paymentLogs.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 font-mono text-xs">
              Nenhum pagamento ou vale registrado até o momento. Clique em <strong>"+ Lançar Diárias / Vales"</strong> para começar.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 text-[10px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Data</th>
                    <th className="py-2.5 px-3">Colaborador</th>
                    <th className="py-2.5 px-3">Obra</th>
                    <th className="py-2.5 px-3 text-center">Dias Trabalhados</th>
                    <th className="py-2.5 px-3 text-right">Diária (R$)</th>
                    <th className="py-2.5 px-3 text-right">Subtotal Bruto (R$)</th>
                    <th className="py-2.5 px-3 text-right text-rose-400">Vales Descontados (R$)</th>
                    <th className="py-2.5 px-3 text-right text-emerald-400 font-bold">Saldo Líquido Pago (R$)</th>
                    <th className="py-2.5 px-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-medium">
                  {paymentLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-2.5 px-3 text-zinc-400">{log.paymentDate}</td>
                      <td className="py-2.5 px-3 font-bold text-zinc-100 font-sans">{log.employeeName}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold text-[10px]">
                          {log.obraCode}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center text-amber-400 font-bold">{log.daysWorked} dias</td>
                      <td className="py-2.5 px-3 text-right text-zinc-300">R$ {log.dailyRate.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right text-zinc-200">
                        R$ {log.grossAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-rose-400">
                        {log.advancesValue > 0 ? `- R$ ${log.advancesValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-emerald-400 text-sm">
                        R$ {log.netAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditPaymentModal(log)}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-blue-600 text-zinc-400 hover:text-white transition-colors"
                            title="Editar Lançamento"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeletePaymentLogClick(log.id)}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-600 text-zinc-400 hover:text-white transition-colors"
                            title="Excluir Lançamento"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal: Cadastro / Edição de Colaborador */}
      {showEmployeeModal && (
        <div className="fixed inset-0 z-50 bg-zinc-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider font-mono flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-blue-400" />
                <span>{editingEmployee ? 'Editar Colaborador / Equipe' : 'Cadastrar Novo Colaborador / Equipe'}</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowEmployeeModal(false)}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Tabs */}
            <div className="flex items-center space-x-2 border-b border-zinc-800 pb-2 text-xs font-bold font-mono">
              <button
                type="button"
                onClick={() => setActiveFormTab('dados')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeFormTab === 'dados'
                    ? 'bg-blue-600 text-white font-black'
                    : 'text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                1. Dados Pessoais & Função
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('pagamento')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeFormTab === 'pagamento'
                    ? 'bg-blue-600 text-white font-black'
                    : 'text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                2. Dados para Pagamento
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('documentos')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeFormTab === 'documentos'
                    ? 'bg-blue-600 text-white font-black'
                    : 'text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                3. Anexo de Documentos ({attachedDocs.length})
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-4 text-xs">
              {/* TAB 1: DADOS PESSOAIS */}
              {activeFormTab === 'dados' && (
                <div className="space-y-3.5">
                  <div>
                    <label className="font-semibold text-zinc-300 block mb-1">Nome Completo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Carlos Eduardo de Oliveira..."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-zinc-300 block mb-1">CPF *</label>
                      <input
                        type="text"
                        required
                        placeholder="000.000.000-00"
                        value={cpf}
                        onChange={(e) => setCpf(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-zinc-300 block mb-1">Telefone / WhatsApp</label>
                      <input
                        type="text"
                        placeholder="(11) 98765-4321"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-zinc-300 block mb-1">Endereço Completo</label>
                    <input
                      type="text"
                      placeholder="Rua, Número, Bairro, Cidade - Estado, CEP..."
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-zinc-300 block mb-1">Função / Cargo Especializado *</label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500 font-sans"
                      >
                        <option value="Linheiro de Linha Viva">Eletricista / Linheiro de Linha Viva</option>
                        <option value="Eletricista Montador">Eletricista Montador RDU / ST</option>
                        <option value="Engenheiro Eletricista">Engenheiro Eletricista</option>
                        <option value="Encarregado de Turma">Encarregado de Turma</option>
                        <option value="Operador de Munck">Operador de Munck / Guindaste</option>
                        <option value="Motorista">Motorista de Frota</option>
                        <option value="Técnico em Eletrotécnica">Técnico em Eletrotécnica / TST</option>
                        <option value="Almoxarife">Almoxarife de Materiais</option>
                        <option value="Auxiliar de Campo">Auxiliar de Campo / Ajudante</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-zinc-300 block mb-1">Status do Contrato</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500 font-sans"
                      >
                        <option value="Ativo">Ativo / Em Operação</option>
                        <option value="Em Férias">Em Férias</option>
                        <option value="Inativo">Inativo</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-zinc-300 block mb-1">Salário Base mensal (R$)</label>
                      <input
                        type="number"
                        value={salary}
                        onChange={(e) => setSalary(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-zinc-300 block mb-1">Valor Diária de Campo (R$)</label>
                      <input
                        type="number"
                        value={dailyRate}
                        onChange={(e) => setDailyRate(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: DADOS PARA PAGAMENTO */}
              {activeFormTab === 'pagamento' && (
                <div className="space-y-3.5">
                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono">
                    <p className="font-bold">Informações Bancárias e PIX do Colaborador</p>
                    <p className="text-[10px] text-zinc-400 font-sans mt-0.5">
                      Estes dados serão utilizados para reembolso de despesas de viagem, diárias e folha de pagamento.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="font-semibold text-zinc-300 block mb-1">Tipo de Chave PIX</label>
                      <select
                        value={pixType}
                        onChange={(e) => setPixType(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500 font-sans"
                      >
                        <option value="CPF">CPF</option>
                        <option value="Telefone">Telefone</option>
                        <option value="Email">E-mail</option>
                        <option value="Aleatoria">Chave Aleatória</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-semibold text-zinc-300 block mb-1">Chave PIX *</label>
                      <input
                        type="text"
                        placeholder="Informe a chave PIX do colaborador..."
                        value={pixKey}
                        onChange={(e) => setPixKey(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-zinc-300 block mb-1">Nome do Banco</label>
                    <input
                      type="text"
                      placeholder="Ex: Itaú, Bradesco, Banco do Brasil, Nubank, Caixa..."
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="font-semibold text-zinc-300 block mb-1">Agência</label>
                      <input
                        type="text"
                        placeholder="0001"
                        value={agency}
                        onChange={(e) => setAgency(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-zinc-300 block mb-1">Conta com Dígito</label>
                      <input
                        type="text"
                        placeholder="12345-6"
                        value={account}
                        onChange={(e) => setAccount(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-zinc-300 block mb-1">Tipo de Conta</label>
                      <select
                        value={accountType}
                        onChange={(e) => setAccountType(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500 font-sans"
                      >
                        <option value="Corrente">Corrente</option>
                        <option value="Poupança">Poupança</option>
                        <option value="Pagamento">Pagamento</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: ANEXO DE DOCUMENTOS */}
              {activeFormTab === 'documentos' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3 font-sans">
                    <span className="font-bold text-zinc-200 text-xs font-mono">Anexar Novo Documento (CNH, NR-10, NR-35, ASO, EPI)</span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-zinc-400 block mb-1 text-[11px]">Tipo de Documento</label>
                        <select
                          value={docCategory}
                          onChange={(e) => setDocCategory(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500 text-xs"
                        >
                          <option value="CNH / Habilitação">CNH / Habilitação</option>
                          <option value="Certificado NR-10 / SEP">Certificado NR-10 / SEP</option>
                          <option value="Certificado NR-35">Certificado NR-35</option>
                          <option value="ASO Exame Admissional">ASO Exame Admissional / Periódico</option>
                          <option value="Comprovante de Residência">Comprovante de Residência</option>
                          <option value="Carteira de Trabalho / Ficha EPI">Carteira de Trabalho / Ficha EPI</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-semibold text-zinc-400 block mb-1 text-[11px]">Selecionar Arquivo (PDF, JPG, PNG)</label>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={handleDocFileSelect}
                          className="w-full text-xs text-zinc-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 cursor-pointer"
                        />
                      </div>
                    </div>

                    {docFileName && (
                      <div className="flex items-center justify-between bg-zinc-900 p-2 rounded-lg border border-zinc-800 text-xs font-mono">
                        <span className="text-emerald-400 truncate">✓ Arquivo Selecionado: {docFileName} ({docFileSize})</span>
                        <button
                          type="button"
                          onClick={handleAddDocumentToList}
                          className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] shadow-sm"
                        >
                          Anexar à Lista
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Attached Documents List */}
                  <div className="space-y-2">
                    <span className="font-bold text-zinc-300 text-xs font-mono block">
                      Lista de Documentos Anetados ({attachedDocs.length})
                    </span>

                    {attachedDocs.length === 0 ? (
                      <div className="p-4 text-center rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-500 text-xs">
                        Nenhum documento anexado ainda. Escolha o arquivo acima e clique em "Anexar à Lista".
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {attachedDocs.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono"
                          >
                            <div className="flex items-center space-x-2 truncate">
                              <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                              <span className="text-zinc-200 truncate">{doc.fileName}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveDocumentFromList(doc.id)}
                              className="px-2 py-1 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-600 hover:text-white font-bold text-[10px] transition-colors"
                            >
                              Remover
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Form Navigation / Submit Buttons */}
              <div className="flex justify-between items-center pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowEmployeeModal(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 font-medium text-xs transition-colors"
                >
                  Cancelar
                </button>

                <div className="flex items-center space-x-2">
                  {activeFormTab !== 'documentos' ? (
                    <button
                      type="button"
                      onClick={() =>
                        setActiveFormTab(activeFormTab === 'dados' ? 'pagamento' : 'documentos')
                      }
                      className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs transition-colors"
                    >
                      Próxima Etapa ➔
                    </button>
                  ) : null}

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors"
                  >
                    {editingEmployee ? 'Salvar Alterações' : 'Salvar Colaborador'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Fechamento de Diárias & Vales (Cadastro / Edição) */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-zinc-950/85 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
          <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider font-mono flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>{editingPaymentLog ? 'Editar Lançamento de Diárias / Vales' : 'Lançar Pagamento de Diárias & Vales'}</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePaymentLog} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Colaborador / Funcionário *</label>
                  <select
                    value={payEmployeeId}
                    onChange={(e) => {
                      const empId = e.target.value;
                      setPayEmployeeId(empId);
                      const emp = employees.find((x) => x.id === empId);
                      if (emp && emp.dailyRate) {
                        setPayDailyRate(emp.dailyRate);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500 font-sans"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Obra Vinculada *</label>
                  <select
                    value={payObraId}
                    onChange={(e) => setPayObraId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500 font-sans"
                  >
                    {obras.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.projectNumber || o.code} - {o.projectName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Data do Pagamento</label>
                  <input
                    type="date"
                    required
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Dias Trabalhados (Qtd)</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={payDaysWorked}
                    onChange={(e) => setPayDaysWorked(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Valor da Diária (R$/dia)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={payDailyRate}
                    onChange={(e) => setPayDailyRate(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-rose-400 block mb-1">Vales / Adiantamentos (Desconto R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 200,00"
                    value={payAdvancesValue}
                    onChange={(e) => setPayAdvancesValue(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-rose-500/30 text-rose-300 focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-zinc-300 block mb-1">Descrição / Observações</label>
                <input
                  type="text"
                  placeholder="Ex: Referente a 8 diárias de campo na Obra Anhanguera..."
                  value={payDescription}
                  onChange={(e) => setPayDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>

              {/* Real-time Calculation Summary Box */}
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal Bruto ({payDaysWorked} diárias x R$ {payDailyRate.toFixed(2)}):</span>
                  <span className="font-bold text-zinc-200">
                    R$ {(payDaysWorked * payDailyRate).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between text-rose-400">
                  <span>(-) Vales / Adiantamentos Descontados:</span>
                  <span className="font-bold">
                    - R$ {payAdvancesValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between border-t border-zinc-800 pt-2 font-black text-emerald-400 text-sm">
                  <span>SALDO LÍQUIDO A PAGAR:</span>
                  <span>
                    R$ {((payDaysWorked * payDailyRate) - payAdvancesValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 font-semibold text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                >
                  {editingPaymentLog ? 'Salvar Alterações e Atualizar DRE' : 'Salvar e Lançar no Financeiro (DRE)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Visualizador de Documento de Colaborador */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider font-mono flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Documento — {viewingDoc.fileName}</span>
              </h2>
              <button
                type="button"
                onClick={() => setViewingDoc(null)}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-3 font-mono text-xs">
              <FileText className="w-12 h-12 text-blue-400 mx-auto" />
              <p className="font-bold text-zinc-100">{viewingDoc.fileName}</p>
              <p className="text-zinc-400 text-[10px]">Data do Upload: {viewingDoc.uploadedAt}</p>

              <button
                type="button"
                onClick={() => window.open(viewingDoc.fileUrl, '_blank')}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs inline-flex items-center space-x-1.5 shadow-md"
              >
                <Eye className="w-4 h-4" />
                <span>Abrir Documento em Nova Aba</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
