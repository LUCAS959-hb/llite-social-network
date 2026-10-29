import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import { UserAvatar } from '../common/UserAvatar';
import { Home, Users, Tv, MessageCircle, Bookmark, Compass, UserCheck, Shield } from 'lucide-react';
import { NavigationTab } from '../../types';

export const SidebarLeft: React.FC = () => {
  const { currentUser, availableUsers, demoSwitchUser, openAuthModal } = useAuth();
  const { activeTab, setActiveTab, setSelectedUserId, pendingRequests, unreadMessagesCount } = useSocial();

  const menuItems = [
    {
      tab: 'feed' as NavigationTab,
      label: 'Home Feed',
      icon: Home,
      color: 'text-blue-500',
    },
    {
      tab: 'friends' as NavigationTab,
      label: 'Friends & Requests',
      icon: Users,
      color: 'text-sky-500',
      badge: pendingRequests.length,
    },
    {
      tab: 'videos' as NavigationTab,
      label: 'Watch Videos',
      icon: Tv,
      color: 'text-indigo-500',
    },
    {
      tab: 'messages' as NavigationTab,
      label: 'Real-time Messages',
      icon: MessageCircle,
      color: 'text-blue-600',
      badge: unreadMessagesCount,
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 xl:w-72 shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto py-4 px-3 space-y-4">
      {/* Current User Quick Link */}
      {currentUser ? (
        <div
          onClick={() => {
            setSelectedUserId(currentUser.id);
            setActiveTab('profile');
          }}
          className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-200/60 cursor-pointer transition-colors group"
        >
          <UserAvatar
            src={currentUser.avatar}
            name={currentUser.name}
            userId={currentUser.id}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-900 text-sm truncate">{currentUser.name}</p>
            <p className="text-xs text-slate-500 truncate">@{currentUser.username}</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center gap-2.5">
            <UserAvatar size="sm" />
            <div>
              <p className="font-bold text-xs text-slate-900 leading-tight">Modo Visitante</p>
              <p className="text-[10px] text-slate-500">Navegue livremente no LLite</p>
            </div>
          </div>
          <button
            onClick={() => openAuthModal('login')}
            className="w-full bg-[#1877F2] hover:bg-[#155dfc] text-white text-xs font-bold py-1.5 px-3 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            Entrar / Criar Conta
          </button>
        </div>
      )}

      {/* Navigation Shortcuts */}
      <div className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => {
                if (item.tab === 'feed') setSelectedUserId(null);
                setActiveTab(item.tab);
              }}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-blue-50 text-[#1877F2]'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isActive ? 'bg-[#1877F2] text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="bg-[#1877F2] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <hr className="border-slate-200" />

      {/* Demo Switcher Quick Section */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
          <UserCheck className="w-4 h-4 text-[#1877F2]" />
          <span>Switch Account (Test)</span>
        </div>
        <p className="text-[11px] text-slate-500">
          Switch to test peer-to-peer chats and friend requests:
        </p>
        <div className="space-y-1 pt-1">
          {availableUsers.map((u) => {
            const isCurrent = currentUser?.id === u.id;
            return (
              <button
                key={u.id}
                onClick={() => demoSwitchUser(u.id)}
                className={`w-full flex items-center justify-between p-1.5 rounded-lg text-xs transition-colors ${
                  isCurrent
                    ? 'bg-[#1877F2] text-white font-semibold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <UserAvatar src={u.avatar} name={u.name} userId={u.id} size="xs" />
                  <span className="truncate">{u.name.split(' ')[0]}</span>
                </div>
                {isCurrent && <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">Active</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-[11px] text-slate-400 px-2 space-y-1">
        <div className="flex items-center gap-1 text-slate-500 font-semibold">
          <Shield className="w-3.5 h-3.5 text-[#1877F2]" />
          <span>LLite Security & Privacy Guard</span>
        </div>
        <p>© 2026 LLite Social Network. Built for web & Android devices.</p>
      </div>
    </aside>
  );
};
