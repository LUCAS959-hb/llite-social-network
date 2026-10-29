import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import { UserAvatar } from '../common/UserAvatar';
import { Home, Tv, MessageCircle, Bell, User as UserIcon } from 'lucide-react';
import { NavigationTab } from '../../types';

export const MobileNav: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    activeTab,
    setActiveTab,
    setSelectedUserId,
    unreadMessagesCount,
    unreadNotificationsCount,
    markNotificationsAsRead,
  } = useSocial();

  const navItems: { tab: NavigationTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { tab: 'feed', label: 'Início', icon: Home },
    { tab: 'videos', label: 'Vídeos', icon: Tv },
    { tab: 'messages', label: 'Mensagens', icon: MessageCircle, badge: unreadMessagesCount },
    { tab: 'notifications', label: 'Notificações', icon: Bell, badge: unreadNotificationsCount },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-1 py-1 shadow-lg pb-safe">
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => {
                if (item.tab === 'feed') setSelectedUserId(null);
                if (item.tab === 'notifications' && unreadNotificationsCount > 0) {
                  markNotificationsAsRead();
                }
                setActiveTab(item.tab);
              }}
              className={`relative flex flex-col items-center justify-center flex-1 h-full min-h-[48px] rounded-xl transition-all ${
                isActive ? 'text-[#1877F2]' : 'text-slate-500 hover:text-slate-800'
              }`}
              aria-label={item.label}
            >
              <div className="relative">
                <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-rose-600 text-white font-bold text-[9px] min-w-[15px] h-[15px] rounded-full flex items-center justify-center px-0.5 border border-white">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 font-medium leading-tight ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 bg-[#1877F2] rounded-full" />
              )}
            </button>
          );
        })}

        {/* Perfil */}
        <button
          onClick={() => {
            if (currentUser) setSelectedUserId(currentUser.id);
            setActiveTab('profile');
          }}
          className={`relative flex flex-col items-center justify-center flex-1 h-full min-h-[48px] rounded-xl transition-all ${
            activeTab === 'profile' ? 'text-[#1877F2]' : 'text-slate-500 hover:text-slate-800'
          }`}
          aria-label="Perfil"
        >
          {currentUser ? (
            <UserAvatar
              src={currentUser.avatar}
              name={currentUser.name}
              userId={currentUser.id}
              size="xs"
              showBadge={true}
              className={activeTab === 'profile' ? 'ring-2 ring-[#1877F2] rounded-full' : ''}
            />
          ) : (
            <UserIcon className="w-6 h-6" />
          )}
          <span
            className={`text-[10px] mt-0.5 font-medium leading-tight ${
              activeTab === 'profile' ? 'font-bold' : ''
            }`}
          >
            Perfil
          </span>
          {activeTab === 'profile' && (
            <span className="absolute top-0 w-8 h-0.5 bg-[#1877F2] rounded-full" />
          )}
        </button>
      </div>
    </nav>
  );
};
