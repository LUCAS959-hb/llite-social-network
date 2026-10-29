import React, { useState, useEffect } from 'react';
import { PostComment } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import { UserAvatar } from '../common/UserAvatar';
import { Send, Heart, Loader2 } from 'lucide-react';

interface CommentsSectionProps {
  postId: string;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({ postId }) => {
  const { currentUser, requireAuth } = useAuth();
  const { getCommentsForPost, addComment } = useSocial();
  const [comments, setComments] = useState<PostComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    getCommentsForPost(postId)
      .then((data) => {
        if (mounted) {
          const unique = Array.from(new Map(data.map((c) => [c.id, c])).values());
          setComments(unique);
        }
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [postId, getCommentsForPost]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    if (!currentUser) {
      requireAuth('escrever um comentário');
      return;
    }

    setIsSubmitting(true);
    try {
      const added = await addComment(postId, newComment.trim());
      setComments((prev) => [...prev.filter((c) => c.id !== added.id), added]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to post comment', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCommentLike = (commentId: string) => {
    requireAuth('reagir a este comentário', () => {
      if (!currentUser) return;
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === commentId) {
            const hasLiked = c.likes?.includes(currentUser.id);
            const updatedLikes = hasLiked
              ? (c.likes || []).filter((id: string) => id !== currentUser.id)
              : [...(c.likes || []), currentUser.id];
            return { ...c, likes: updatedLikes };
          }
          return c;
        })
      );
    });
  };

  return (
    <div className="pt-3 border-t border-slate-100 space-y-3">
      {/* Comments List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-4 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-2">Sem comentários ainda. Seja o primeiro a comentar!</p>
      ) : (
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {comments.map((comment) => {
            const hasLiked = currentUser ? comment.likes?.includes(currentUser.id) : false;
            return (
              <div key={comment.id} className="flex items-start gap-2.5">
                <UserAvatar
                  src={comment.authorAvatar}
                  name={comment.authorName}
                  userId={comment.authorId}
                  size="sm"
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="bg-slate-100 rounded-2xl px-3.5 py-2 inline-block max-w-[95%]">
                    <p className="font-bold text-xs text-slate-900 leading-tight">
                      {comment.authorName}
                    </p>
                    <p className="text-xs text-slate-800 mt-0.5 leading-relaxed break-words whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium ml-2 mt-1">
                    <button
                      onClick={() => toggleCommentLike(comment.id)}
                      className={`hover:underline cursor-pointer flex items-center gap-1 ${
                        hasLiked ? 'text-rose-600 font-bold' : ''
                      }`}
                    >
                      <Heart className={`w-3 h-3 ${hasLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
                      <span>{comment.likes?.length ? comment.likes.length : 'Gosto'}</span>
                    </button>
                    <span>Responder</span>
                    <span>Recentemente</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Write Comment Box */}
      {currentUser ? (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-1">
          <UserAvatar
            src={currentUser.avatar}
            name={currentUser.name}
            userId={currentUser.id}
            size="sm"
          />
          <div className="flex-1 relative flex items-center">
            <input
              type="text"
              placeholder="Escreva um comentário..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full bg-slate-100 hover:bg-slate-200/70 focus:bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 py-2 pl-3.5 pr-10 rounded-full border border-transparent focus:border-[#1877F2] outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="absolute right-1.5 p-1.5 rounded-full text-[#1877F2] hover:bg-blue-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      ) : (
        <div
          onClick={() => requireAuth('escrever um comentário')}
          className="flex items-center gap-2 pt-1 cursor-pointer group"
        >
          <UserAvatar size="sm" />
          <div className="flex-1 bg-slate-100 group-hover:bg-slate-200/80 text-xs text-slate-500 py-2 px-4 rounded-full border border-slate-200/80 transition-colors flex items-center justify-between">
            <span>Escreva um comentário...</span>
            <span className="text-[11px] text-[#1877F2] font-bold">Iniciar Sessão</span>
          </div>
        </div>
      )}
    </div>
  );
};
