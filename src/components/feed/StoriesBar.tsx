import React, { useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import { UserAvatar } from '../common/UserAvatar';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';

export const StoriesBar: React.FC = () => {
  const { currentUser } = useAuth();
  const { stories, openLightbox } = useSocial();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -220 : 220;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group mb-4">
      <div
        ref={scrollRef}
        className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none snap-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Create Story Card */}
        {currentUser && (
          <div className="relative w-28 sm:w-32 h-44 sm:h-48 rounded-2xl overflow-hidden shrink-0 shadow-sm border border-slate-200/90 cursor-pointer group/card flex flex-col bg-white snap-start hover:scale-[1.02] transition-transform">
            <div className="h-32 sm:h-34 overflow-hidden">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="absolute top-28 sm:top-30 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#1877F2] border-4 border-white flex items-center justify-center text-white shadow-md">
              <Plus className="w-4 h-4 stroke-[3]" />
            </div>
            <div className="flex-1 flex items-end justify-center pb-2 px-1">
              <span className="text-[11px] sm:text-xs font-bold text-slate-800 text-center leading-tight">
                Create story
              </span>
            </div>
          </div>
        )}

        {/* Stories list */}
        {stories.map((story) => (
          <div
            key={story.id}
            onClick={() => openLightbox(story.mediaUrl)}
            className="relative w-28 sm:w-32 h-44 sm:h-48 rounded-2xl overflow-hidden shrink-0 shadow-sm cursor-pointer group/card snap-start hover:scale-[1.02] transition-transform"
          >
            <img
              src={story.mediaUrl}
              alt={story.authorName}
              className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/75" />

            {/* Author Avatar with vibrant blue ring */}
            <div className="absolute top-2.5 left-2.5">
              <UserAvatar
                src={story.authorAvatar}
                name={story.authorName}
                userId={story.authorId}
                size="sm"
                showBadge={true}
              />
            </div>

            {/* Author Name */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5">
              <p className="text-white text-xs font-bold leading-tight drop-shadow-md truncate">
                {story.authorName}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Scroll buttons */}
      <button
        onClick={() => scroll('left')}
        className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-md border border-slate-200 items-center justify-center text-slate-700 opacity-0 group-hover:opacity-100 hover:bg-white transition-opacity z-10"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => scroll('right')}
        className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-md border border-slate-200 items-center justify-center text-slate-700 opacity-0 group-hover:opacity-100 hover:bg-white transition-opacity z-10"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};
