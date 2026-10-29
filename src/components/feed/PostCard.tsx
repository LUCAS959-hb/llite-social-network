import React, { useState } from 'react';
import { Post } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import { CommentsSection } from './CommentsSection';
import { UserAvatar } from '../common/UserAvatar';
import {
  ThumbsUp,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Trash2,
  Link,
  Globe,
  Lock,
  Check,
} from 'lucide-react';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { currentUser, requireAuth } = useAuth();
  const { toggleLikePost, deletePost, sharePost, openLightbox, setSelectedUserId, setActiveTab } = useSocial();

  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const isLiked = currentUser ? post.likes.includes(currentUser.id) : false;
  const isAuthor = currentUser?.id === post.authorId;

  const handleLike = () => {
    requireAuth('gostar desta publicação', () => toggleLikePost(post.id));
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + `?post=${post.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setShowMenu(false);
  };

  const handleAuthorClick = () => {
    setSelectedUserId(post.authorId);
    setActiveTab('profile');
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / 60000);
      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  return (
    <article className="bg-white rounded-2xl shadow-sm border border-slate-200/80 mb-4 overflow-hidden transition-all duration-200">
      {/* Header */}
      <div className="p-3.5 sm:p-4 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={handleAuthorClick}>
          <UserAvatar
            src={post.authorAvatar}
            name={post.authorName}
            userId={post.authorId}
            size="md"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 text-sm group-hover:text-[#1877F2] transition-colors leading-tight">
                {post.authorName}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
              <span>{formatTimestamp(post.createdAt)}</span>
              <span>•</span>
              {post.privacy === 'public' ? (
                <span title="Public">
                  <Globe className="w-3 h-3 text-slate-400" />
                </span>
              ) : (
                <span title="Friends only">
                  <Lock className="w-3 h-3 text-slate-400" />
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Options Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
            aria-label="Post options"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-44 bg-white rounded-2xl shadow-lg border border-slate-200 p-1.5 z-20 animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl text-left transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Link className="w-4 h-4 text-slate-400" />}
                <span>{copied ? 'Link Copied!' : 'Copy Post Link'}</span>
              </button>

              {isAuthor && (
                <button
                  onClick={() => {
                    deletePost(post.id);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl text-left transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-rose-500" />
                  <span>Delete Post</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Text Content */}
      {post.content && (
        <div className="px-3.5 sm:px-4 pb-3">
          <p className="text-slate-900 text-sm sm:text-base leading-relaxed whitespace-pre-line break-words">
            {post.content}
          </p>
        </div>
      )}

      {/* Media: Photo or Video */}
      {post.mediaType === 'photo' && post.mediaUrl && (
        <div
          onClick={() => openLightbox(post.mediaUrl!)}
          className="relative bg-slate-100 cursor-pointer overflow-hidden group max-h-[500px] flex items-center justify-center"
        >
          <img
            src={post.mediaUrl}
            alt="Post content"
            loading="lazy"
            className="w-full max-h-[500px] object-cover group-hover:scale-[1.01] transition-transform duration-300"
          />
        </div>
      )}

      {post.mediaType === 'video' && post.mediaUrl && (
        <div className="relative bg-black max-h-[480px] flex items-center justify-center overflow-hidden">
          <video
            src={post.mediaUrl}
            poster={post.videoThumbnail}
            controls
            playsInline
            preload="metadata"
            className="w-full max-h-[480px] object-contain"
          />
        </div>
      )}

      {/* Reactions Count Line */}
      <div className="px-3.5 sm:px-4 py-2 flex items-center justify-between text-xs text-slate-500 border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          {post.likes.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-[9px]">
                👍
              </span>
              <span className="font-semibold text-slate-700">{post.likes.length}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {post.commentsCount > 0 && (
            <button
              onClick={() => setShowComments(!showComments)}
              className="hover:underline cursor-pointer"
            >
              {post.commentsCount} {post.commentsCount === 1 ? 'comment' : 'comments'}
            </button>
          )}
          {post.sharesCount > 0 && (
            <span>
              {post.sharesCount} {post.sharesCount === 1 ? 'share' : 'shares'}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons: Like, Comment, Share */}
      <div className="px-2 py-1 flex items-center justify-around">
        <button
          onClick={handleLike}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all active:scale-95 cursor-pointer ${
            isLiked
              ? 'text-[#1877F2] bg-blue-50/70 font-bold'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <ThumbsUp
            className={`w-4 h-4 sm:w-5 sm:h-5 ${isLiked ? 'fill-[#1877F2] stroke-[#1877F2]' : ''}`}
          />
          <span>Gosto</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors ${
            showComments ? 'bg-slate-100 text-slate-900' : ''
          }`}
        >
          <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Comment</span>
        </button>

        <button
          onClick={() => sharePost(post.id)}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors active:scale-95"
        >
          <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Share</span>
        </button>
      </div>

      {/* Expandable Comments Drawer */}
      {showComments && (
        <div className="px-3.5 sm:px-4 pb-3.5">
          <CommentsSection postId={post.id} />
        </div>
      )}
    </article>
  );
};
