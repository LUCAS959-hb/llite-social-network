import React from 'react';
import { useSocial } from '../../context/SocialContext';
import { UserAvatar } from '../common/UserAvatar';
import { Bell, Heart, MessageCircle, UserPlus, UserCheck, Clock } from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationsAsRead,
    setActiveTab,
    setSelectedUserId,
  } = useSocial();

  const handleNotificationClick = (notif: typeof notifications[0]) => {
    markNotificationsAsRead(notif.id);
    if (notif.type === 'friend_request' || notif.type === 'friend_accepted') {
      if (notif.senderId) setSelectedUserId(notif.senderId);
      setActiveTab('friends');
    } else if (notif.type === 'message') {
      setActiveTab('messages');
    } else {
      setActiveTab('feed');
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />;
      case 'comment':
        return <MessageCircle className="w-3.5 h-3.5 text-blue-500" />;
      case 'friend_request':
        return <UserPlus className="w-3.5 h-3.5 text-sky-500" />;
      case 'friend_accepted':
        return <UserCheck className="w-3.5 h-3.5 text-emerald-500" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-[#1877F2]" />;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-2 sm:py-4 px-2 sm:px-4 space-y-4">
      {/* Notifications Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1877F2] flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight">Notificações</h1>
            <p className="text-xs text-slate-500">
              {unreadNotificationsCount > 0
                ? `Tem ${unreadNotificationsCount} nova(s) notificação(ões)`
                : 'Todas as notificações foram lidas'}
            </p>
          </div>
        </div>

        {unreadNotificationsCount > 0 && (
          <button
            onClick={() => markNotificationsAsRead()}
            className="text-xs text-[#1877F2] font-bold hover:bg-blue-50 px-3 py-1.5 rounded-xl transition-colors"
          >
            Marcar todas como lidas
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Bell className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">Sem notificações</p>
            <p className="text-xs text-slate-400">
              Quando alguém interagir com as suas publicações ou enviar pedidos de amizade, verá aqui.
            </p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className={`p-4 flex items-start gap-3.5 hover:bg-slate-50 cursor-pointer transition-colors ${
                !n.read ? 'bg-blue-50/50' : ''
              }`}
            >
              {/* Sender Avatar with icon badge */}
              <div className="relative shrink-0">
                <UserAvatar
                  src={n.senderAvatar}
                  name={n.senderName}
                  userId={n.senderId}
                  size="md"
                  showBadge
                />
                <span className="absolute -bottom-1 -right-1 p-0.5 bg-white rounded-full shadow-xs border border-slate-100 z-10">
                  {getNotifIcon(n.type)}
                </span>
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-slate-800 leading-snug">
                  <strong className="text-slate-900 font-bold">{n.senderName}</strong>{' '}
                  {n.text}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                  <Clock className="w-3 h-3" />
                  <span>Recentemente</span>
                </div>
              </div>

              {!n.read && (
                <span className="w-2.5 h-2.5 rounded-full bg-[#1877F2] shrink-0 mt-2" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
