import React, { useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import { useAuth } from '../../context/AuthContext';
import { PostCard } from '../feed/PostCard';
import { Tv, Plus, Film, AlertCircle } from 'lucide-react';

export const VideosView: React.FC = () => {
  const { posts, setIsCreatePostModalOpen } = useSocial();
  const { currentUser, requireAuth } = useAuth();

  const videoPosts = Array.from(
    new Map(posts.filter((p) => p.mediaType === 'video').map((p) => [p.id, p])).values()
  );

  return (
    <div className="w-full max-w-3xl mx-auto py-2 sm:py-4 px-2 sm:px-4 space-y-4">
      {/* Watch Header Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Tv className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">LLite Watch</h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Discover video reels, tutorials, and clips from the community
            </p>
          </div>
        </div>

        <button
          onClick={() => requireAuth('partilhar um vídeo', () => setIsCreatePostModalOpen(true))}
          className="flex items-center gap-2 bg-[#1877F2] hover:bg-[#155dfc] text-white text-xs sm:text-sm font-bold py-2 px-3 sm:px-4 rounded-full shadow-xs transition-colors shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Carregar Vídeo</span>
        </button>
      </div>

      {/* Videos List */}
      {videoPosts.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 shadow-sm space-y-3">
          <Film className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-base">No videos uploaded yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Be the first creator to share a video clip with your friends on LLite!
          </p>
          {currentUser && (
            <button
              onClick={() => setIsCreatePostModalOpen(true)}
              className="mt-2 bg-[#1877F2] text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-blue-600 transition-colors"
            >
              Upload Video Now
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {videoPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};
