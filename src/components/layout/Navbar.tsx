import React, { useState, useRef, useEffect } from 'react';
import { Logo } from '../brand/Logo';
import { FirebaseStatusModal } from '../firebase/FirebaseStatusModal';
import { UserAvatar } from '../common/UserAvatar';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import {
  Search,
  Home,
  Users,
  Tv,
  MessageCircle,
  Bell,
  Plus,
  LogOut,
  User as UserIcon,
  Settings,
  UserCheck,
  Check,
  ChevronDown,
} from 'lucide-react';
import { NavigationTab } from '../../types';

export const Navbar: React.FC = () => {
  const { currentUser, logout, openAuthModal, availableUsers, demoSwitchUser, requireAuth } = useAuth();
  const {
    activeTab,
    setActiveTab,
    setSelectedUserId,
    searchQuery,
    setSearchQuery,
    pendingRequests,
    unreadMessagesCount,
    unreadNotificationsCount,
    notifications,
    markNotificationsAsRead,
    setIsCreatePostModalOpen,
  } = useSocial();

  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);
  const [isSwitchMenuOpen, setIsSwitchMenuOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
        setIsSwitchMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target as Node)) {
        setIsNotifMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveTab('search');
      setIsSearchActive(false);
    }
  };

  const navItems: { tab: NavigationTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { tab: 'feed', label: 'Home', icon: Home },
    { tab: 'friends', label: 'Friends', icon: Users, badge: pendingRequests.length },
    { tab: 'videos', label: 'Watch', icon: Tv },
    { tab: 'messages', label: 'Messages', icon: MessageCircle, badge: unreadMessagesCount },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs px-3 sm:px-5 h-14 sm:h-16 flex items-center justify-between transition-all">
      {/* Left: Logo & Search */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-xs md:max-w-sm">
        <div
          onClick={() => {
            setSelectedUserId(null);
            setActiveTab('feed');
          }}
        >
          <Logo size="sm" showText={true} />
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 hidden sm:block">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search LLite..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchActive(true)}
              className="w-full pl-9 pr-4 py-2 bg-slate-100 hover:bg-slate-200/80 focus:bg-white text-sm text-slate-800 placeholder-slate-400 rounded-full border border-transparent focus:border-[#1877F2] outline-none transition-all duration-200"
            />
          </div>
        </form>

        {/* Mobile Search Icon Trigger */}
        <button
          onClick={() => {
            setActiveTab('search');
          }}
          className="sm:hidden p-2 rounded-full text-slate-600 hover:bg-slate-100"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>

      {/* Middle: Desktop Navigation Tabs */}
      <nav className="hidden md:flex items-center justify-center gap-1 lg:gap-2 flex-1 max-w-md">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => {
                if (item.tab === 'feed') setSelectedUserId(null);
                setActiveTab(item.tab);
              }}
              title={item.label}
              className={`relative flex items-center justify-center flex-1 py-2 px-3 lg:px-5 rounded-xl transition-all duration-150 ${
                isActive
                  ? 'text-[#1877F2] bg-blue-50/70 border-b-2 border-[#1877F2]'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="relative">
                <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.4px]' : 'stroke-[1.8px]'}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-rose-600 text-white font-bold text-[10px] min-w-[17px] h-[17px] rounded-full flex items-center justify-center px-1 shadow-xs animate-scale">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Right: Quick Actions, Notifications, & Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Create Post quick button */}
        <button
          onClick={() => requireAuth('criar uma publicação', () => setIsCreatePostModalOpen(true))}
          className="flex items-center gap-1.5 bg-[#1877F2] hover:bg-[#155dfc] text-white text-xs sm:text-sm font-semibold py-2 px-3 sm:px-4 rounded-full shadow-xs shadow-blue-600/30 transition-all duration-150 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">Criar Publicação</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifMenuRef}>
          <button
            onClick={() => {
              setIsNotifMenuOpen(!isNotifMenuOpen);
              if (!isNotifMenuOpen && unreadNotificationsCount > 0) {
                markNotificationsAsRead();
              }
            }}
            className={`p-2 sm:p-2.5 rounded-full transition-colors relative ${
              isNotifMenuOpen || unreadNotificationsCount > 0
                ? 'bg-blue-50 text-[#1877F2]'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-0 right-0 bg-rose-600 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 shadow-xs border-2 border-white">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Notifications Popover */}
          {isNotifMenuOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">Notifications</h3>
                {unreadNotificationsCount > 0 && (
                  <button
                    onClick={() => markNotificationsAsRead()}
                    className="text-xs text-[#1877F2] font-semibold hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-sm">No notifications yet</div>
                ) : (
                  notifications.slice(0, 10).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        setIsNotifMenuOpen(false);
                        if (n.type === 'friend_request' || n.type === 'friend_accepted') {
                          setActiveTab('friends');
                        } else if (n.type === 'message') {
                          setActiveTab('messages');
                        } else {
                          setActiveTab('feed');
                        }
                      }}
                      className={`p-3 flex items-start gap-3 hover:bg-slate-50 cursor-pointer transition-colors ${
                        !n.read ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <UserAvatar
                        src={n.senderAvatar}
                        name={n.senderName}
                        userId={n.senderId}
                        size="md"
                      />
                      <div className="flex-1 text-xs sm:text-sm">
                        <p className="text-slate-800">
                          <span className="font-semibold text-slate-900">{n.senderName}</span> {n.text}
                        </p>
                        <span className="text-[11px] text-slate-400 mt-0.5 block">Recently</span>
                      </div>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-[#1877F2] shrink-0 mt-1.5" />}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Account Menu */}
        {currentUser ? (
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-1.5 p-1 rounded-full hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
            >
              <UserAvatar
                src={currentUser.avatar}
                name={currentUser.name}
                userId={currentUser.id}
                size="sm"
              />
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
            </button>

            {/* User Dropdown */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* User Info Header */}
                <div
                  onClick={() => {
                    setSelectedUserId(currentUser.id);
                    setActiveTab('profile');
                    setIsUserMenuOpen(false);
                  }}
                  className="p-3 bg-slate-50 hover:bg-blue-50/60 rounded-xl cursor-pointer flex items-center gap-3 transition-colors mb-2"
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

                <div className="space-y-0.5">
                  <button
                    onClick={() => {
                      setSelectedUserId(currentUser.id);
                      setActiveTab('profile');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-left"
                  >
                    <UserIcon className="w-4 h-4 text-slate-500" />
                    <span>My Profile</span>
                  </button>

                  {/* Switch Demo User (For testing multiple accounts) */}
                  <div className="relative">
                    <button
                      onClick={() => setIsSwitchMenuOpen(!isSwitchMenuOpen)}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm text-[#1877F2] font-semibold hover:bg-blue-50 rounded-lg transition-colors text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <UserCheck className="w-4 h-4" />
                        <span>Switch Demo Account</span>
                      </div>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${isSwitchMenuOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {isSwitchMenuOpen && (
                      <div className="mt-1 pl-2 space-y-1 bg-slate-50 p-2 rounded-xl border border-slate-200/80 mb-2">
                        <p className="text-[11px] text-slate-500 font-medium px-2 py-0.5">
                          Switch user to test chat & friend requests:
                        </p>
                        {availableUsers.map((u) => (
                          <button
                            key={u.id}
                            onClick={() => {
                              demoSwitchUser(u.id);
                              setIsUserMenuOpen(false);
                              setIsSwitchMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-1.5 rounded-lg text-xs transition-colors ${
                              u.id === currentUser.id
                                ? 'bg-[#1877F2] text-white font-semibold'
                                : 'text-slate-800 hover:bg-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <UserAvatar src={u.avatar} name={u.name} userId={u.id} size="xs" />
                              <span className="truncate">{u.name}</span>
                            </div>
                            {u.id === currentUser.id && <Check className="w-3.5 h-3.5 shrink-0" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedUserId(currentUser.id);
                      setActiveTab('profile');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-left"
                  >
                    <Settings className="w-4 h-4 text-slate-500" />
                    <span>Settings & Privacy</span>
                  </button>

                  <hr className="my-1 border-slate-100" />

                  <button
                    onClick={() => {
                      logout();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-left font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => openAuthModal('login')}
              className="text-slate-700 hover:text-slate-900 font-bold text-xs sm:text-sm px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Entrar
            </button>
            <button
              onClick={() => openAuthModal('register')}
              className="bg-[#1877F2] text-white font-bold text-xs sm:text-sm px-3.5 py-1.5 rounded-full hover:bg-[#155dfc] transition-colors shadow-xs cursor-pointer"
            >
              Criar Conta
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
