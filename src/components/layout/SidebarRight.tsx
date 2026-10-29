import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import { UserAvatar } from '../common/UserAvatar';
import { Search, Sparkles, MessageCircle, MoreHorizontal } from 'lucide-react';

export const SidebarRight: React.FC = () => {
  const { currentUser, availableUsers, requireAuth } = useAuth();
  const { startConversationWithUser } = useSocial();

  // Contacts: other users available to chat with
  const contacts = availableUsers.filter((u) => u.id !== currentUser?.id);

  return (
    <aside className="hidden xl:flex flex-col w-72 shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto py-4 px-3 space-y-4">
      {/* Community Announcement */}
      <div className="bg-gradient-to-br from-blue-500 to-[#1877F2] text-white p-3.5 rounded-2xl shadow-sm space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-100">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Comunidade LLite</span>
        </div>
        <p className="text-xs leading-relaxed text-blue-50">
          Conecte-se com amigos, partilhe fotos e vídeos, ou converse em tempo real!
        </p>
      </div>

      {/* Online Contacts Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contactos</h3>
          <div className="flex items-center gap-1 text-slate-400">
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Ao Vivo
            </span>
          </div>
        </div>

        <div className="space-y-1">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => requireAuth('conversar com ' + contact.name, () => startConversationWithUser(contact.id))}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-200/60 cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <UserAvatar
                  src={contact.avatar}
                  name={contact.name}
                  userId={contact.id}
                  size="md"
                />
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 text-sm truncate group-hover:text-[#1877F2] transition-colors">
                    {contact.name}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {contact.workplace ? contact.workplace.split('@')[0] : `@${contact.username}`}
                  </p>
                </div>
              </div>

              <button
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-white text-slate-500 transition-opacity"
                title="Send Message"
              >
                <MessageCircle className="w-4 h-4 text-[#1877F2]" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
