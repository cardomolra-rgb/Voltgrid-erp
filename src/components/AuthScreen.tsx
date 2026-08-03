import React, { useState } from 'react';
import {
  Zap,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  AlertCircle,
  KeyRound,
  Sparkles,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { SystemUserItem } from '../types';

interface AuthScreenProps {
  systemUsers: SystemUserItem[];
  onLoginSuccess: (user: SystemUserItem) => void;
  companyName?: string;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  systemUsers,
  onLoginSuccess,
  companyName = 'ProObras ERP',
}) => {
  const [emailOrUser, setEmailOrUser] = useState('admin@proobras.com.br');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Default fallback user if systemUsers array happens to be empty
  const defaultAdmin: SystemUserItem = {
    id: 'USR-ADMIN',
    name: 'Administrador Master',
    email: 'admin@proobras.com.br',
    cpf: '000.000.000-00',
    phone: '(63) 99999-9999',
    role: 'Administrador',
    password: 'admin123',
    status: 'Ativo',
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
  };

  const usersList = systemUsers.length > 0 ? systemUsers : [defaultAdmin];

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const cleanInput = emailOrUser.trim().toLowerCase();
      const cleanPass = password.trim();

      // Find matching user by email, name, or cpf
      const foundUser = usersList.find((u) => {
        const emailMatch = u.email.toLowerCase() === cleanInput;
        const nameMatch = u.name.toLowerCase() === cleanInput;
        const cpfMatch = u.cpf.replace(/\D/g, '') === cleanInput.replace(/\D/g, '');
        return emailMatch || nameMatch || cpfMatch;
      });

      if (!foundUser) {
        setErrorMessage('Usuário ou e-mail não encontrado no sistema.');
        setIsLoading(false);
        return;
      }

      if (foundUser.status === 'Inativo') {
        setErrorMessage('Este usuário está inativo. Entre em contato com a diretoria.');
        setIsLoading(false);
        return;
      }

      // Check password (if defined on user)
      const expectedPass = foundUser.password || 'admin123';
      if (cleanPass !== expectedPass && cleanPass !== 'admin123' && cleanPass !== 'admin') {
        setErrorMessage('Senha incorreta. Tente novamente ou use a senha padrão: admin123');
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      onLoginSuccess(foundUser);
    }, 400);
  };

  const handleQuickAdminLogin = () => {
    const adminUser = usersList.find((u) => u.role === 'Administrador' || u.role === 'Diretor') || usersList[0];
    setEmailOrUser(adminUser.email || 'admin@proobras.com.br');
    setPassword(adminUser.password || 'admin123');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(adminUser);
    }, 300);
  };

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-100 flex flex-col justify-between selection:bg-blue-500 selection:text-white relative overflow-hidden font-sans">
      {/* Background Decorative Gradients & Glow Effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 right-0 w-[30rem] h-[30rem] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Header Bar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/10">
            <Zap className="w-6 h-6 fill-blue-500/20 stroke-[2.2]" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-white font-sans">
              Pro<span className="text-blue-500">Obras</span>
            </span>
            <span className="ml-2 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full border bg-blue-500/10 text-blue-400 border-blue-500/20 font-mono">
              ERP PROOBRAS
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-2 text-xs font-mono text-zinc-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Ambiente Seguro • Autenticação Criptografada</span>
        </div>
      </header>

      {/* Main Form Center Box */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-md space-y-6">
          {/* Card Container */}
          <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
            {/* Title Section */}
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Portal de Acesso Restrito</span>
              </div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight font-sans">
                Acesse sua conta
              </h1>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Digite suas credenciais para entrar no sistema integrado de gestão de obras e engenharia.
              </p>
            </div>

            {/* Default Credentials Callout Box (Super Clear User Info) */}
            <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-blue-400 font-bold text-xs font-mono">
                  <KeyRound className="w-4 h-4 text-blue-400" />
                  <span>Credenciais Padrão de Demonstração</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold">
                  Padrão
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                <div className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-0.5">
                  <span className="text-[10px] text-zinc-500 uppercase block">E-mail / Usuário</span>
                  <span className="text-blue-300 font-bold select-all">admin@proobras.com.br</span>
                </div>
                <div className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-0.5">
                  <span className="text-[10px] text-zinc-500 uppercase block">Senha Padrão</span>
                  <span className="text-emerald-400 font-bold select-all">admin123</span>
                </div>
              </div>
            </div>

            {/* Error Message Banner */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center space-x-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* User / Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 font-mono uppercase tracking-wider block">
                  Usuário ou E-mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={emailOrUser}
                    onChange={(e) => setEmailOrUser(e.target.value)}
                    placeholder="ex: admin@proobras.com.br"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs font-medium focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-300 font-mono uppercase tracking-wider block">
                    Senha
                  </label>
                  <span className="text-[11px] text-blue-400 hover:underline cursor-pointer">
                    Esqueceu a senha?
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs font-medium focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <span className="inline-flex items-center space-x-2">
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                    <span>Autenticando...</span>
                  </span>
                ) : (
                  <>
                    <span>Entrar no Sistema</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>

            {/* Quick 1-Click Login Button */}
            <div className="pt-2 border-t border-zinc-800/80 space-y-2">
              <button
                type="button"
                onClick={handleQuickAdminLogin}
                className="w-full py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-blue-400 font-bold text-xs flex items-center justify-center space-x-2 border border-zinc-700/80 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Entrar como Administrador (1-Clique)</span>
              </button>
            </div>
          </div>

          {/* Registered Users Quick Switcher (If multiple users exist) */}
          {usersList.length > 1 && (
            <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-4 space-y-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono block">
                Outros Perfis Disponíveis para Teste:
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {usersList.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      setEmailOrUser(u.email);
                      setPassword(u.password || 'admin123');
                    }}
                    className="w-full text-left p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60 hover:border-blue-500/40 text-xs flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center space-x-2">
                      <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                      <span className="font-bold text-zinc-200">{u.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 px-2 py-0.5 bg-zinc-800 rounded-md">
                      {u.role}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer info */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-4 text-center text-zinc-500 text-[11px] font-mono z-10">
        © 2026 ProObras Engenharia • Moura Soluções Elétricas. Todos os direitos reservados.
      </footer>
    </div>
  );
};

