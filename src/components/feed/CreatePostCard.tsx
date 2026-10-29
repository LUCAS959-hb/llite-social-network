import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import { UserAvatar } from '../common/UserAvatar';
import { Image, Video, Smile, X, Globe, Lock, Loader2, Sparkles, LogIn } from 'lucide-react';

export const CreatePostCard: React.FC = () => {
  const { currentUser, requireAuth } = useAuth();
  const { isCreatePostModalOpen, setIsCreatePostModalOpen, createPost } = useSocial();

  const [content, setContent] = useState('');
  const [mediaType, setMediaType] = useState<'none' | 'photo' | 'video'>('none');
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [privacy, setPrivacy] = useState<'public' | 'friends'>('public');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleTriggerAction = (actionDesc: string, callback?: () => void) => {
    const authed = requireAuth(actionDesc, () => {
      if (callback) {
        callback();
      } else {
        setIsCreatePostModalOpen(true);
      }
    });
    if (authed && callback) {
      callback();
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setMediaUrl(reader.result as string);
        setMediaType('photo');
        setIsCreatePostModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setMediaUrl(reader.result as string);
        setMediaType('video');
        setIsCreatePostModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!content.trim() && !mediaUrl) || isSubmitting) return;

    if (!currentUser) {
      requireAuth('publicar no feed', () => handleSubmit(e));
      return;
    }

    setIsSubmitting(true);
    try {
      await createPost(content, mediaType, mediaUrl || undefined);
      // Reset
      setContent('');
      setMediaUrl('');
      setMediaType('none');
      setIsCreatePostModalOpen(false);
    } catch (err) {
      console.error('Failed to publish post', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const emojis = ['😀', '😍', '🔥', '🚀', '🎉', '💡', '☕', '🏔️', '👏', '✨', '❤️', '🙌'];

  // GUEST STATE CARD
  if (!currentUser) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 mb-4 transition-all">
        <div className="flex items-center gap-3">
          <UserAvatar size="md" />
          <button
            onClick={() => handleTriggerAction('criar uma publicação')}
            className="flex-1 bg-slate-100 hover:bg-slate-200/80 text-slate-500 hover:text-slate-800 text-left px-4 py-2.5 rounded-full text-xs sm:text-sm transition-colors cursor-pointer"
          >
            No que está a pensar? Inicie sessão para publicar...
          </button>
        </div>

        <hr className="my-3 border-slate-100" />

        <div className="flex items-center justify-around text-xs sm:text-sm font-semibold">
          <button
            onClick={() => handleTriggerAction('publicar fotografias')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <Image className="w-5 h-5 text-emerald-500" />
            <span>Foto</span>
          </button>

          <button
            onClick={() => handleTriggerAction('publicar vídeos')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <Video className="w-5 h-5 text-rose-500" />
            <span>Vídeo</span>
          </button>

          <button
            onClick={() => handleTriggerAction('partilhar sentimentos e atividades')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <Smile className="w-5 h-5 text-amber-500" />
            <span>Sentimento</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Logged in Feed Trigger Card */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 shadow-sm border border-slate-200/80 mb-4 transition-all">
        <div className="flex items-center gap-3">
          <UserAvatar
            src={currentUser.avatar}
            name={currentUser.name}
            userId={currentUser.id}
            size="md"
          />
          <button
            onClick={() => setIsCreatePostModalOpen(true)}
            className="flex-1 bg-slate-100 hover:bg-slate-200/80 text-slate-500 hover:text-slate-700 text-left px-4 py-2.5 rounded-full text-xs sm:text-sm transition-colors cursor-pointer"
          >
            No que estás a pensar, {currentUser.name.split(' ')[0]}?
          </button>
        </div>

        <hr className="my-3 border-slate-100" />

        <div className="flex items-center justify-around">
          <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs sm:text-sm font-semibold cursor-pointer transition-colors">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handlePhotoSelect}
            />
            <Image className="w-5 h-5 text-emerald-500" />
            <span>Foto</span>
          </label>

          <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs sm:text-sm font-semibold cursor-pointer transition-colors">
            <input
              type="file"
              ref={videoInputRef}
              accept="video/*"
              className="hidden"
              onChange={handleVideoSelect}
            />
            <Video className="w-5 h-5 text-rose-500" />
            <span>Vídeo</span>
          </label>

          <button
            onClick={() => {
              setIsCreatePostModalOpen(true);
              setShowEmojiPicker(true);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs sm:text-sm font-semibold transition-colors"
          >
            <Smile className="w-5 h-5 text-amber-500" />
            <span>Sentimento</span>
          </button>
        </div>
      </div>

      {/* Create Post Modal */}
      {isCreatePostModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="relative py-3.5 px-5 border-b border-slate-100 flex items-center justify-center">
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">Criar Publicação</h3>
              <button
                onClick={() => setIsCreatePostModalOpen(false)}
                className="absolute right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Author details & Privacy */}
            <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
              <div className="flex items-center gap-3">
                <UserAvatar
                  src={currentUser.avatar}
                  name={currentUser.name}
                  userId={currentUser.id}
                  size="lg"
                />
                <div>
                  <p className="font-bold text-slate-900 text-sm">{currentUser.name}</p>
                  <button
                    type="button"
                    onClick={() => setPrivacy(privacy === 'public' ? 'friends' : 'public')}
                    className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold px-2 py-0.5 rounded-md mt-0.5 transition-colors"
                  >
                    {privacy === 'public' ? (
                      <>
                        <Globe className="w-3 h-3 text-slate-500" />
                        <span>Público</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3 text-slate-500" />
                        <span>Apenas Amigos</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Text Input */}
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`No que estás a pensar, ${currentUser.name.split(' ')[0]}?`}
                rows={4}
                autoFocus
                className="w-full text-slate-800 placeholder-slate-400 text-sm sm:text-base resize-none border-none outline-none focus:ring-0 leading-relaxed"
              />

              {/* Media Preview Box */}
              {mediaUrl && (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900">
                  <button
                    onClick={() => {
                      setMediaUrl('');
                      setMediaType('none');
                    }}
                    className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {mediaType === 'photo' ? (
                    <img
                      src={mediaUrl}
                      alt="Upload preview"
                      className="max-h-72 w-full object-contain mx-auto"
                    />
                  ) : (
                    <video
                      src={mediaUrl}
                      controls
                      className="max-h-72 w-full object-contain mx-auto bg-black"
                    />
                  )}
                </div>
              )}

              {/* Emoji bar */}
              {showEmojiPicker && (
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-2xl border border-slate-200/80">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setContent((prev) => prev + ' ' + emoji)}
                      className="text-lg p-1 hover:scale-125 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              {/* Add to your post bar */}
              <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 bg-slate-50/70">
                <span className="text-xs sm:text-sm font-semibold text-slate-700">Adicionar à publicação</span>
                <div className="flex items-center gap-1">
                  <label className="p-2 rounded-full hover:bg-slate-200 text-emerald-500 cursor-pointer transition-colors" title="Adicionar Foto">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoSelect}
                    />
                    <Image className="w-5 h-5" />
                  </label>
                  <label className="p-2 rounded-full hover:bg-slate-200 text-rose-500 cursor-pointer transition-colors" title="Adicionar Vídeo">
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={handleVideoSelect}
                    />
                    <Video className="w-5 h-5" />
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 rounded-full hover:bg-slate-200 text-amber-500 transition-colors"
                    title="Inserir emoji"
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="p-4 border-t border-slate-100 bg-white">
              <button
                onClick={handleSubmit}
                disabled={(!content.trim() && !mediaUrl) || isSubmitting}
                className="w-full bg-[#1877F2] hover:bg-[#155dfc] disabled:opacity-50 disabled:pointer-events-none text-white font-bold py-2.5 rounded-full text-sm sm:text-base shadow-sm transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>A publicar no LLite...</span>
                  </>
                ) : (
                  <span>Publicar</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
