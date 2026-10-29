import React, { useState } from 'react';
import { Database, ShieldCheck, ExternalLink, X, ChevronRight, CheckCircle2, AlertTriangle, Key } from 'lucide-react';
import { isFirebaseConfigured } from '../../firebase';

export const FirebaseStatusModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isLive = isFirebaseConfigured();

  return (
    <>
      {/* Firebase Status Badge in UI */}
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold transition-colors shadow-2xs ${
          isLive
            ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800'
            : 'bg-amber-50 hover:bg-amber-100 border-amber-200/90 text-amber-800'
        }`}
        title="Ver estado do Firebase e instruções de configuração"
      >
        <span
          className={`w-2 h-2 rounded-full ${
            isLive ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
          }`}
        />
        <span className="hidden sm:inline">Firebase:</span>
        <span>{isLive ? 'Cloud Ativo' : 'Aguardando Configuração Cloud'}</span>
      </button>

      {/* Modal with Step-by-Step Instructions */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-amber-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base sm:text-lg">
                    Configuração do Firebase & Cloud Firestore
                  </h3>
                  <p className="text-xs text-amber-800 font-medium">
                    Guia oficial de ativação passo a passo
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-xs uppercase tracking-wider text-blue-700">
                  <ShieldCheck className="w-4 h-4 text-[#1877F2]" />
                  Estado Atual da Aplicação
                </p>
                <p className="text-xs text-blue-950">
                  O assistente inicializou o LLite com persistência no servidor Express e armazenamento seguro local para testes imediatos. Para sincronização permanente com o Google Cloud Firebase, siga os passos abaixo:
                </p>
              </div>

              {/* Step 1 */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="w-6 h-6 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-xs">
                    1
                  </span>
                  <span>Aceder à Consola do Firebase</span>
                </div>
                <p className="text-xs text-slate-600 pl-8">
                  Vá a <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-[#1877F2] underline font-semibold inline-flex items-center gap-0.5">console.firebase.google.com <ExternalLink className="w-3 h-3" /></a> e crie um novo projeto (ex: <code>llite-social-app</code>).
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="w-6 h-6 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-xs">
                    2
                  </span>
                  <span>Ativar o Cloud Firestore</span>
                </div>
                <p className="text-xs text-slate-600 pl-8">
                  No menu lateral esquerdo, clique em <strong>Build &gt; Firestore Database</strong>, selecione <strong>Criar base de dados</strong> e escolha o modo de produção (ou modo de teste para desenvolvimento).
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="w-6 h-6 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-xs">
                    3
                  </span>
                  <span>Ativar o Firebase Authentication</span>
                </div>
                <p className="text-xs text-slate-600 pl-8">
                  No menu lateral esquerdo, clique em <strong>Build &gt; Authentication</strong>, clique em <strong>Get Started</strong> e ative o provedor <strong>E-mail/Palavra-passe</strong> (Email/Password).
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="w-6 h-6 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-xs">
                    4
                  </span>
                  <span>Registar a Aplicação Web</span>
                </div>
                <p className="text-xs text-slate-600 pl-8">
                  Nas definições do projeto (ícone de engrenagem), adicione uma <strong>Web App</strong> (ícone <code>&lt;/&gt;</code>) para gerar as chaves do SDK (apiKey, authDomain, projectId).
                </p>
              </div>

              {/* Step 5 */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="w-6 h-6 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-xs">
                    5
                  </span>
                  <span>Conectar ao AI Studio</span>
                </div>
                <p className="text-xs text-slate-600 pl-8">
                  Basta solicitar ao assistente no chat: <em>"Configurar Firebase com o meu projeto [ID]"</em> ou aceitar os termos no painel de ferramentas integrado.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-end bg-slate-50">
              <button
                onClick={() => setIsOpen(false)}
                className="bg-[#1877F2] hover:bg-[#155dfc] text-white text-xs sm:text-sm font-bold py-2 px-5 rounded-full shadow-xs transition-colors"
              >
                Entendido, Continuar no LLite
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
