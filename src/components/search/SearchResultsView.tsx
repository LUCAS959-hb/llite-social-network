import React, { useState, useEffect } from 'react';
import { useSocial } from '../../context/SocialContext';
import { useAuth } from '../../context/AuthContext';
import { PostCard } from '../feed/PostCard';
import { UserAvatar } from '../common/UserAvatar';
import { api } from '../../services/api';
import { User, Post } from '../../types';
import { Search, UserPlus, MessageCircle, Users, Loader2 } from 'lucide-react';

export const SearchResultsView: React.FC = () => {
  const { searchQuery, sendFriendRequest, startConversationWithUser, setSelectedUserId, setActiveTab } = useSocial();
  const { currentUser, requireAuth } = useAuth();

  const [activeTab, setActiveTabFilter] = useState<'all' | 'people' | 'posts' | 'videos'>('all');
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [videos, setVideos] = useState<Post[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    api
      .search(searchQuery)
      .then((res) => {
        const uUsers = Array.from(new Map((res.users || []).map((u) => [u.id, u])).values());
        const uPosts = Array.from(new Map((res.posts || []).map((p) => [p.id, p])).values());
        const uVideos = Array.from(new Map((res.videos || []).map((v) => [v.id, v])).values());
        setUsers(uUsers);
        setPosts(uPosts);
        setVideos(uVideos);
      })
      .finally(() => {
        setIsSearching(false);
      });
  }, [searchQuery]);

  return (
    <div className="w-full max-w-3xl mx-auto py-2 sm:py-4 px-2 sm:px-4 space-y-4">
      {/* Search Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1877F2] flex items-center justify-center shrink-0">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900">
              Search Results for <span className="text-[#1877F2]">"{searchQuery}"</span>
            </h1>
            <p className="text-xs text-slate-400">
              Found {users.length} people, {posts.length} posts
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 overflow-x-auto scrollbar-none">
          {[
            { id: 'all', label: 'All Results', count: users.length + posts.length },
            { id: 'people', label: 'People', count: users.length },
            { id: 'posts', label: 'Posts', count: posts.length },
            { id: 'videos', label: 'Videos', count: videos.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTabFilter(tab.id as typeof activeTab)}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === tab.id
                  ? 'bg-[#1877F2] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {isSearching ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-[#1877F2]" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* People Section */}
          {(activeTab === 'all' || activeTab === 'people') && users.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-[#1877F2]" />
                <span>People</span>
              </h2>

              <div className="divide-y divide-slate-100">
                {users.map((u) => (
                  <div key={u.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div
                      className="flex items-center gap-3 cursor-pointer min-w-0"
                      onClick={() => {
                        setSelectedUserId(u.id);
                        setActiveTab('profile');
                      }}
                    >
                      <UserAvatar
                        src={u.avatar}
                        name={u.name}
                        userId={u.id}
                        size="md"
                        showBadge
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">{u.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">@{u.username}</p>
                        {u.bio && <p className="text-xs text-slate-600 truncate mt-0.5">{u.bio}</p>}
                      </div>
                    </div>

                    {currentUser?.id !== u.id && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => requireAuth('adicionar ' + u.name, () => sendFriendRequest(u.id))}
                          className="bg-[#1877F2] hover:bg-[#155dfc] text-white text-xs font-bold py-1.5 px-3 rounded-xl transition-colors cursor-pointer"
                        >
                          <UserPlus className="w-3.5 h-3.5 inline mr-1" />
                          Adicionar
                        </button>
                        <button
                          onClick={() => requireAuth('conversar com ' + u.name, () => startConversationWithUser(u.id))}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                          title="Mensagem"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Posts Section */}
          {(activeTab === 'all' || activeTab === 'posts') && posts.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2">
                Posts mentioning "{searchQuery}"
              </h2>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {/* Videos Section */}
          {activeTab === 'videos' && videos.length > 0 && (
            <div className="space-y-4">
              {videos.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {users.length === 0 && posts.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center text-slate-400 text-sm border border-slate-200">
              No results found for "{searchQuery}". Try searching for another name or keyword.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
