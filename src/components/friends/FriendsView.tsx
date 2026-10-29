import React, { useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import { useAuth } from '../../context/AuthContext';
import { UserAvatar } from '../common/UserAvatar';
import { Users, UserPlus, UserCheck, UserX, MessageCircle, Search } from 'lucide-react';

export const FriendsView: React.FC = () => {
  const { currentUser, requireAuth } = useAuth();
  const {
    friends,
    pendingRequests,
    sentRequests,
    suggestions,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    startConversationWithUser,
    setSelectedUserId,
    setActiveTab,
  } = useSocial();

  const [activeSubTab, setActiveSubTab] = useState<'requests' | 'all' | 'suggestions'>('requests');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFriends = friends.filter((f) =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-4xl mx-auto py-2 sm:py-4 px-2 sm:px-4 space-y-4">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Friends & Connections</h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Manage your friendships, requests, and meet new people on LLite
            </p>
          </div>
        </div>

        {/* Search bar inside Friends view */}
        <div className="relative sm:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filter friends..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-100 rounded-full text-xs sm:text-sm border-none outline-none focus:ring-2 focus:ring-[#1877F2]/30"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
        <button
          onClick={() => setActiveSubTab('requests')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeSubTab === 'requests'
              ? 'bg-[#1877F2] text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <span>Friend Requests</span>
          {pendingRequests.length > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {pendingRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('all')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeSubTab === 'all'
              ? 'bg-[#1877F2] text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <span>All Friends ({friends.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('suggestions')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeSubTab === 'suggestions'
              ? 'bg-[#1877F2] text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Suggestions ({suggestions.length})</span>
        </button>
      </div>

      {/* Content for Requests */}
      {activeSubTab === 'requests' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">
              Received Requests ({pendingRequests.length})
            </h2>
            {pendingRequests.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center text-slate-400 text-xs sm:text-sm border border-slate-200">
                No pending requests. Check suggestions to add friends!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {pendingRequests.map(({ friendshipId, user }) => (
                  <div
                    key={friendshipId}
                    className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between space-y-3"
                  >
                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => {
                        setSelectedUserId(user.id);
                        setActiveTab('profile');
                      }}
                    >
                      <UserAvatar
                        src={user.avatar}
                        name={user.name}
                        userId={user.id}
                        size="lg"
                        showBadge
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-sm truncate">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate">@{user.username}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">{user.location || 'Member'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => acceptFriendRequest(user.id)}
                        className="flex-1 bg-[#1877F2] hover:bg-[#155dfc] text-white text-xs font-bold py-2 rounded-xl transition-colors shadow-xs"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => rejectFriendRequest(user.id)}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 rounded-xl transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sent requests */}
          {sentRequests.length > 0 && (
            <div className="pt-2">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">
                Sent Requests ({sentRequests.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {sentRequests.map(({ friendshipId, user }) => (
                  <div
                    key={friendshipId}
                    className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <UserAvatar
                        src={user.avatar}
                        name={user.name}
                        userId={user.id}
                        size="md"
                        showBadge
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-xs truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-400">Request pending</p>
                      </div>
                    </div>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">
                      Sent
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Content for All Friends */}
      {activeSubTab === 'all' && (
        <div>
          {filteredFriends.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-slate-400 text-sm border border-slate-200">
              No friends found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredFriends.map((friend) => (
                <div
                  key={friend.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => {
                      setSelectedUserId(friend.id);
                      setActiveTab('profile');
                    }}
                  >
                    <UserAvatar
                      src={friend.avatar}
                      name={friend.name}
                      userId={friend.id}
                      size="lg"
                      showBadge
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-sm truncate">{friend.name}</p>
                      <p className="text-xs text-slate-400 truncate">@{friend.username}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">{friend.workplace || friend.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => startConversationWithUser(friend.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-[#1877F2] hover:bg-[#155dfc] text-white text-xs font-bold py-2 rounded-xl transition-colors shadow-xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Message</span>
                    </button>
                    <button
                      onClick={() => removeFriend(friend.id)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 text-xs font-semibold transition-colors"
                      title="Remove Friend"
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content for Suggestions */}
      {activeSubTab === 'suggestions' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {suggestions.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between space-y-3"
            >
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => {
                  setSelectedUserId(user.id);
                  setActiveTab('profile');
                }}
              >
                <UserAvatar
                  src={user.avatar}
                  name={user.name}
                  userId={user.id}
                  size="lg"
                  showBadge
                />
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 text-sm truncate">{user.name}</p>
                  <p className="text-xs text-slate-400 truncate">@{user.username}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">{user.workplace || user.location}</p>
                </div>
              </div>

              <div className="pt-1">
                <button
                  onClick={() => requireAuth('adicionar amigos', () => sendFriendRequest(user.id))}
                  className="w-full flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-[#1877F2] text-xs font-bold py-2 rounded-xl transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Adicionar Amigo</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
