import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import { UserAvatar } from '../common/UserAvatar';
import { PostCard } from '../feed/PostCard';
import {
  Camera,
  Edit3,
  MapPin,
  Briefcase,
  Calendar,
  UserPlus,
  UserCheck,
  MessageCircle,
  Users,
  Grid,
  Film,
  X,
  Loader2,
  Globe,
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { currentUser, availableUsers, updateProfile, requireAuth } = useAuth();
  const {
    selectedUserId,
    posts,
    friends,
    sendFriendRequest,
    acceptFriendRequest,
    removeFriend,
    startConversationWithUser,
    pendingRequests,
    openLightbox,
  } = useSocial();

  const [activeTab, setActiveTab] = useState<'posts' | 'about' | 'friends' | 'photos' | 'videos'>('posts');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit fields
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editWorkplace, setEditWorkplace] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editCover, setEditCover] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Determine which user profile to show (if guest hasn't selected a user, show first featured user)
  const targetId = selectedUserId || currentUser?.id;
  const user = availableUsers.find((u) => u.id === targetId) || currentUser || availableUsers[0];

  if (!user) return null;

  const isMe = currentUser?.id === user.id;
  const isFriend = friends.some((f) => f.id === user.id);
  const isPendingReceived = pendingRequests.some((r) => r.user.id === user.id);

  // Filter posts by this user
  const userPosts = Array.from(
    new Map(posts.filter((p) => p.authorId === user.id).map((p) => [p.id, p])).values()
  );
  const userPhotos = userPosts.filter((p) => p.mediaType === 'photo' && p.mediaUrl);
  const userVideos = userPosts.filter((p) => p.mediaType === 'video' && p.mediaUrl);

  const openEditModal = () => {
    setEditName(user.name);
    setEditBio(user.bio || '');
    setEditLocation(user.location || '');
    setEditWorkplace(user.workplace || '');
    setEditAvatar(user.avatar || '');
    setEditCover(user.coverPhoto || '');
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        name: editName,
        bio: editBio,
        location: editLocation,
        workplace: editWorkplace,
        avatar: editAvatar, // Allows setting to empty string to remove avatar!
        coverPhoto: editCover || user.coverPhoto,
      });
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Failed to update profile', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setEditAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setEditCover(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-2 sm:py-4 px-2 sm:px-4 space-y-4">
      {/* Header Container */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200/80">
        {/* Cover Photo */}
        <div className="relative h-44 sm:h-64 lg:h-72 w-full bg-slate-200 overflow-hidden group">
          <img
            src={user.coverPhoto || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80'}
            alt="Cover photo"
            className="w-full h-full object-cover"
          />
          {isMe && (
            <button
              onClick={openEditModal}
              className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-white/90 hover:bg-white text-slate-800 text-xs sm:text-sm font-bold py-1.5 px-3 rounded-xl shadow-md backdrop-blur-xs flex items-center gap-1.5 transition-all"
            >
              <Camera className="w-4 h-4" />
              <span>Edit Cover Photo</span>
            </button>
          )}
        </div>

        {/* Profile Info Header */}
        <div className="px-4 sm:px-8 pb-5 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              <UserAvatar
                src={user.avatar}
                name={user.name}
                userId={user.id}
                size="2xl"
                showBadge
              />
              {isMe && (
                <button
                  onClick={openEditModal}
                  className="absolute bottom-1 right-1 p-2 rounded-full bg-[#1877F2] text-white ring-2 ring-white hover:bg-blue-600 transition-colors shadow-md z-10"
                  title="Update profile picture"
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 self-start sm:self-end">
              {isMe ? (
                <button
                  onClick={openEditModal}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold py-2 px-4 rounded-xl transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  {isFriend ? (
                    <button
                      onClick={() => removeFriend(user.id)}
                      className="flex items-center gap-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 text-xs sm:text-sm font-bold py-2 px-3 sm:px-4 rounded-xl transition-colors"
                    >
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                      <span>Friends</span>
                    </button>
                  ) : isPendingReceived ? (
                    <button
                      onClick={() => acceptFriendRequest(user.id)}
                      className="flex items-center gap-1.5 bg-[#1877F2] hover:bg-[#155dfc] text-white text-xs sm:text-sm font-bold py-2 px-4 rounded-xl transition-colors shadow-xs"
                    >
                      <span>Accept Request</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => requireAuth('adicionar amigos', () => sendFriendRequest(user.id))}
                      className="flex items-center gap-1.5 bg-[#1877F2] hover:bg-[#155dfc] text-white text-xs sm:text-sm font-bold py-2 px-4 rounded-xl transition-colors shadow-xs cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Adicionar Amigo</span>
                    </button>
                  )}

                  <button
                    onClick={() => requireAuth('enviar mensagens', () => startConversationWithUser(user.id))}
                    className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-[#1877F2] text-xs sm:text-sm font-bold py-2 px-4 rounded-xl transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Mensagem</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* User Bio and Meta */}
          <div className="space-y-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {user.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">@{user.username}</p>
            </div>

            {user.bio && (
              <p className="text-xs sm:text-sm text-slate-700 max-w-2xl leading-relaxed whitespace-pre-line">
                {user.bio}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1 font-medium">
              {user.workplace && (
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user.workplace}</span>
                </div>
              )}
              {user.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Joined {user.joinedAt || 'Recently'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#1877F2]" />
                <span className="font-bold text-slate-800">{user.friendsCount || 0} friends</span>
              </div>
            </div>
          </div>

          {/* Profile Tab Navigation */}
          <div className="flex items-center gap-1 sm:gap-2 border-t border-slate-100 mt-5 pt-2 overflow-x-auto scrollbar-none">
            {[
              { id: 'posts', label: 'Posts' },
              { id: 'about', label: 'About' },
              { id: 'friends', label: 'Friends' },
              { id: 'photos', label: 'Photos' },
              { id: 'videos', label: 'Videos' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
                  activeTab === tab.id
                    ? 'text-[#1877F2] bg-blue-50/70 border-b-2 border-[#1877F2]'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {userPosts.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-slate-400 text-sm border border-slate-200">
              No posts published yet.
            </div>
          ) : (
            userPosts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      )}

      {activeTab === 'about' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base">About {user.name}</h3>
          <div className="space-y-3 text-xs sm:text-sm text-slate-700">
            <div className="flex items-center gap-3">
              <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Works at <strong className="text-slate-900">{user.workplace || 'LLite'}</strong></span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Lives in <strong className="text-slate-900">{user.location || 'Earth'}</strong></span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Member since <strong className="text-slate-900">{user.joinedAt || '2024'}</strong></span>
            </div>
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Contact: <strong className="text-slate-900">{user.email}</strong></span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'friends' && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm">
          <h3 className="font-bold text-slate-900 text-base mb-4">Friends ({friends.length})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {friends.map((f) => (
              <div key={f.id} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 border border-slate-100">
                <UserAvatar src={f.avatar} name={f.name} userId={f.id} size="md" showBadge />
                <div className="min-w-0">
                  <p className="font-bold text-xs text-slate-900 truncate">{f.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">@{f.username}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'photos' && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm">
          <h3 className="font-bold text-slate-900 text-base mb-4">Photos ({userPhotos.length})</h3>
          {userPhotos.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">No photos uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {userPhotos.map((p) => (
                <div
                  key={p.id}
                  onClick={() => openLightbox(p.mediaUrl!)}
                  className="aspect-square rounded-2xl overflow-hidden cursor-pointer group bg-slate-100"
                >
                  <img
                    src={p.mediaUrl}
                    alt="Photo upload"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'videos' && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm">
          <h3 className="font-bold text-slate-900 text-base mb-4">Videos ({userVideos.length})</h3>
          {userVideos.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">No videos uploaded yet.</p>
          ) : (
            <div className="space-y-4">
              {userVideos.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="py-3.5 px-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Edit Profile</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-5 overflow-y-auto space-y-4 flex-1">
              {/* Profile Picture Upload */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase">Fotografia de Perfil</label>
                <div className="flex items-center gap-4">
                  <UserAvatar
                    src={editAvatar}
                    name={editName || user.name}
                    size="xl"
                    showBadge={false}
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 px-3.5 rounded-xl cursor-pointer transition-colors">
                      <input
                        type="file"
                        ref={avatarInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarFile}
                      />
                      {editAvatar ? 'Alterar Fotografia' : 'Carregar Fotografia'}
                    </label>

                    {editAvatar && (
                      <button
                        type="button"
                        onClick={() => setEditAvatar('')}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold py-2 px-3 rounded-xl transition-colors cursor-pointer"
                      >
                        Remover Fotografia
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  {editAvatar
                    ? 'A sua fotografia personalizada está ativa.'
                    : 'Sem fotografia carregada. É apresentado o avatar padrão neutro.'}
                </p>
              </div>

              {/* Cover Photo Upload */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase">Cover Banner</label>
                <div className="space-y-2">
                  <div className="h-24 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                    <img
                      src={editCover || user.coverPhoto}
                      alt="Preview cover"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <label className="inline-block bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 px-3.5 rounded-xl cursor-pointer transition-colors">
                    <input
                      type="file"
                      ref={coverInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={handleCoverFile}
                    />
                    Upload New Cover
                  </label>
                </div>
              </div>

              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Display Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm outline-none focus:border-[#1877F2]"
                  required
                />
              </div>

              {/* Bio */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Biography</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm outline-none focus:border-[#1877F2] resize-none"
                />
              </div>

              {/* Location */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Location</label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  placeholder="City, Country"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm outline-none focus:border-[#1877F2]"
                />
              </div>

              {/* Workplace */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Workplace / Role</label>
                <input
                  type="text"
                  value={editWorkplace}
                  onChange={(e) => setEditWorkplace(e.target.value)}
                  placeholder="e.g. Software Engineer @ LLite"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm outline-none focus:border-[#1877F2]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-[#1877F2] hover:bg-[#155dfc] text-white text-xs sm:text-sm font-bold py-2 px-5 rounded-xl transition-colors shadow-xs flex items-center gap-2"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
