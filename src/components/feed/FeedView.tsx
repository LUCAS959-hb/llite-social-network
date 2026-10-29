import React, { useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import { StoriesBar } from './StoriesBar';
import { CreatePostCard } from './CreatePostCard';
import { PostCard } from './PostCard';
import { Sparkles, Image, Users, Loader2 } from 'lucide-react';

export const FeedView: React.FC = () => {
  const { posts, isLoadingPosts, friends } = useSocial();
  const [feedFilter, setFeedFilter] = useState<'all' | 'photos' | 'friends'>('all');

  const friendIds = friends.map((f) => f.id);

  const filteredPosts = posts.filter((p) => {
    if (feedFilter === 'photos') return p.mediaType === 'photo';
    if (feedFilter === 'friends') return friendIds.includes(p.authorId);
    return true;
  });

  const uniquePosts = Array.from(new Map(filteredPosts.map((p) => [p.id, p])).values());

  return (
    <div className="w-full max-w-2xl mx-auto py-2 sm:py-4 px-2 sm:px-4">
      {/* Stories Reel */}
      <StoriesBar />

      {/* Create Post Section */}
      <CreatePostCard />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setFeedFilter('all')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
            feedFilter === 'all'
              ? 'bg-[#1877F2] text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>All Updates</span>
        </button>

        <button
          onClick={() => setFeedFilter('photos')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
            feedFilter === 'photos'
              ? 'bg-[#1877F2] text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Image className="w-3.5 h-3.5 text-emerald-500" />
          <span>Photos</span>
        </button>

        <button
          onClick={() => setFeedFilter('friends')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
            feedFilter === 'friends'
              ? 'bg-[#1877F2] text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-blue-500" />
          <span>Friends Only</span>
        </button>
      </div>

      {/* Feed Posts */}
      {isLoadingPosts ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 animate-pulse space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200" />
                <div className="space-y-1.5 flex-1">
                  <div className="w-32 h-4 bg-slate-200 rounded" />
                  <div className="w-20 h-3 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="w-full h-12 bg-slate-100 rounded-xl" />
              <div className="w-full h-48 bg-slate-200 rounded-2xl" />
            </div>
          ))}
        </div>
      ) : uniquePosts.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-sm space-y-3">
          <p className="text-slate-500 text-sm">No posts found for this filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {uniquePosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};
