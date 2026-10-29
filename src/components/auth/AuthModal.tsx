import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../brand/Logo';
import { X, Lock, Mail, User, Loader2, Check, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    setAuthModalMode,
    authPromptReason,
    login,
    register,
    demoSwitchUser,
    availableUsers,
    currentUser,
  } = useAuth();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Credenciais inválidas. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await register({
        name,
        username: username || name.toLowerCase().replace(/\s+/g, ''),
        email,
        password,
        bio,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Falha ao criar conta. Tente outro email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetSuccess('');
    setIsLoading(true);
    try {
      setResetSuccess(`Palavra-passe de ${resetEmail} redefinida. Pode iniciar sessão com a nova credencial.`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Falha ao redefinir palavra-passe');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header with Logo and Close button (Always accessible to guests) */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Logo size="sm" showText={true} />
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-full hover:bg-slate-200/80 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
            title="Fechar"
            aria-label="Fechar janela"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Prompt Banner for Guests */}
        {authPromptReason && (
          <div className="bg-blue-50/90 border-b border-blue-100 px-5 py-3 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[#1877F2] shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 leading-relaxed">
              <span className="font-bold">Ação necessária:</span> Inicie sessão ou crie uma conta no LLite para{' '}
              <strong className="text-[#1877F2]">{authPromptReason}</strong>. Após entrar, continuará diretamente com a sua ação!
            </div>
          </div>
        )}

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-slate-100 px-5 pt-3 gap-3">
          <button
            onClick={() => {
              setAuthModalMode('login');
              setError('');
            }}
            className={`pb-2.5 text-xs sm:text-sm font-bold transition-all relative ${
              authModalMode === 'login'
                ? 'text-[#1877F2]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Iniciar Sessão
            {authModalMode === 'login' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1877F2] rounded-full" />
            )}
          </button>

          <button
            onClick={() => {
              setAuthModalMode('register');
              setError('');
            }}
            className={`pb-2.5 text-xs sm:text-sm font-bold transition-all relative ${
              authModalMode === 'register'
                ? 'text-[#1877F2]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Criar Conta
            {authModalMode === 'register' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1877F2] rounded-full" />
            )}
          </button>

          <button
            onClick={() => {
              setAuthModalMode('switch');
              setError('');
            }}
            className={`pb-2.5 text-xs sm:text-sm font-bold transition-all relative ${
              authModalMode === 'switch'
                ? 'text-[#1877F2]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Contas de Teste
            {authModalMode === 'switch' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1877F2] rounded-full" />
            )}
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {resetSuccess && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{resetSuccess}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {authModalMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Email</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    placeholder="exemplo@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:border-[#1877F2]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Palavra-passe</label>
                  <button
                    type="button"
                    onClick={() => setAuthModalMode('reset')}
                    className="text-[11px] text-[#1877F2] font-semibold hover:underline"
                  >
                    Esqueceu-se?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    placeholder="Palavra-passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:border-[#1877F2]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1877F2] hover:bg-[#155dfc] text-white font-bold py-2.5 rounded-xl text-sm shadow-xs transition-colors flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>Entrar no LLite</span>
              </button>

              <div className="pt-2 text-center text-xs text-slate-400">
                Dica: Contas de teste usam a senha <code className="text-slate-700 bg-slate-100 px-1 py-0.5 rounded font-mono">password123</code>
              </div>
            </form>
          )}

          {/* SIGN UP FORM */}
          {authModalMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nome Completo</label>
                <div className="relative flex items-center">
                  <User className="absolute left-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="O seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:border-[#1877F2]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nome de utilizador (@username)</label>
                <input
                  type="text"
                  placeholder="ex: lucas"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:border-[#1877F2]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Email</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    placeholder="email@dominio.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:border-[#1877F2]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Palavra-passe</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    placeholder="Mínimo de 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:border-[#1877F2]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Biografia (Opcional)</label>
                <input
                  type="text"
                  placeholder="Breve frase de apresentação"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:border-[#1877F2]"
                />
              </div>

              <p className="text-[11px] text-slate-400 leading-tight">
                Nota: O perfil começará com o avatar padrão neutro. Poderá adicionar uma fotografia quando desejar.
              </p>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1877F2] hover:bg-[#155dfc] text-white font-bold py-2.5 rounded-xl text-sm shadow-xs transition-colors flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>Criar Conta no LLite</span>
              </button>
            </form>
          )}

          {/* DEMO SWITCHER */}
          {authModalMode === 'switch' && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500">
                Selecione um utilizador de teste para iniciar sessão instantaneamente e experimentar a aplicação:
              </p>
              <div className="space-y-1.5 pt-1">
                {availableUsers.map((u) => {
                  const isCurrent = currentUser?.id === u.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => demoSwitchUser(u.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left cursor-pointer ${
                        isCurrent
                          ? 'border-[#1877F2] bg-blue-50/70 shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <UserAvatar src={u.avatar} name={u.name} userId={u.id} size="md" />
                        <div className="truncate">
                          <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">{u.name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{u.workplace || u.location}</p>
                        </div>
                      </div>
                      {isCurrent ? (
                        <span className="text-xs font-bold text-[#1877F2] flex items-center gap-1">
                          <Check className="w-4 h-4" />
                          <span>Ativo</span>
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                          <span>Entrar</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* PASSWORD RESET */}
          {authModalMode === 'reset' && (
            <form onSubmit={handleResetSubmit} className="space-y-3.5">
              <p className="text-xs text-slate-500 leading-relaxed">
                Introduza o seu email e nova palavra-passe para redefinir as credenciais da sua conta.
              </p>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Email da Conta</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    placeholder="lucaslunguenda@gmail.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:border-[#1877F2]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nova Palavra-passe</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    placeholder="Nova palavra-passe"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:border-[#1877F2]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1877F2] hover:bg-[#155dfc] text-white font-bold py-2.5 rounded-xl text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>Redefinir Palavra-passe</span>
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setAuthModalMode('login')}
                  className="text-xs text-[#1877F2] font-semibold hover:underline"
                >
                  Voltar ao Início de Sessão
                </button>
              </div>
            </form>
          )}

          {/* Dismiss button for guest browsing */}
          {!currentUser && (
            <div className="pt-2 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={closeAuthModal}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold py-1 px-3 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Continuar a explorar como visitante →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
