import React, { useState, useRef, useEffect } from 'react';
import { useSocial } from '../../context/SocialContext';
import { useAuth } from '../../context/AuthContext';
import { usePresence } from '../../context/PresenceContext';
import { UserAvatar } from '../common/UserAvatar';
import {
  MessageCircle,
  Search,
  Send,
  Image,
  ArrowLeft,
  Check,
  CheckCheck,
  Phone,
  Video,
  Info,
  Smile,
  X,
  Loader2,
} from 'lucide-react';

export const MessengerView: React.FC = () => {
  const { currentUser, availableUsers, openAuthModal } = useAuth();
  const { isUserOnline } = usePresence();
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    messages,
    isLoadingMessages,
    sendMessage,
    startConversationWithUser,
  } = useSocial();

  const [messageText, setMessageText] = useState('');
  const [mediaAttachment, setMediaAttachment] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!currentUser) {
    return (
      <div className="w-full max-w-md mx-auto py-12 px-4 text-center space-y-4">
        <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-[#1877F2] mx-auto flex items-center justify-center">
            <MessageCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Mensagens e Conversas</h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
            Inicie sessão ou crie uma conta no LLite para enviar mensagens instantâneas e falar com amigos em tempo real.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => openAuthModal('login')}
              className="bg-[#1877F2] hover:bg-[#155dfc] text-white text-xs sm:text-sm font-bold py-2.5 px-6 rounded-full shadow-xs transition-colors cursor-pointer"
            >
              Iniciar Sessão
            </button>
            <button
              onClick={() => openAuthModal('register')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold py-2.5 px-6 rounded-full transition-colors cursor-pointer"
            >
              Criar Conta
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeConv = conversations.find((c) => c.id === activeConversationId);
  const otherParticipantId = activeConv?.participantIds.find((id) => id !== currentUser.id);
  const otherUser = availableUsers.find((u) => u.id === otherParticipantId);

  const filteredConversations = conversations.filter((c) => {
    const otherId = c.participantIds.find((id) => id !== currentUser.id);
    const u = availableUsers.find((user) => user.id === otherId);
    return u?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!messageText.trim() && !mediaAttachment) || isSending || !activeConversationId) return;

    setIsSending(true);
    try {
      await sendMessage(messageText.trim(), mediaAttachment || undefined);
      setMessageText('');
      setMediaAttachment('');
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setIsSending(false);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setMediaAttachment(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatMsgTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto h-[calc(100vh-8rem)] md:h-[calc(100vh-5.5rem)] my-2 sm:my-3 px-2 sm:px-4 flex rounded-3xl overflow-hidden bg-white border border-slate-200/90 shadow-sm">
      {/* Left Sidebar: Conversations list */}
      <div
        className={`w-full md:w-80 lg:w-96 border-r border-slate-200/80 flex flex-col h-full bg-white shrink-0 ${
          activeConversationId ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Chats</h2>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <button
            onClick={() => setIsNewChatOpen(!isNewChatOpen)}
            className="p-2 rounded-full bg-blue-50 text-[#1877F2] hover:bg-blue-100 transition-colors"
            title="Start new conversation"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-100 rounded-full text-xs sm:text-sm border-none outline-none focus:ring-2 focus:ring-[#1877F2]/20"
            />
          </div>
        </div>

        {/* New Chat Picker modal dropdown */}
        {isNewChatOpen && (
          <div className="p-3 bg-blue-50/50 border-b border-blue-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Start chat with:</span>
              <button
                onClick={() => setIsNewChatOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {availableUsers
                .filter((u) => u.id !== currentUser.id)
                .map((user) => (
                  <button
                    key={user.id}
                    onClick={async () => {
                      await startConversationWithUser(user.id);
                      setIsNewChatOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 p-1.5 hover:bg-white rounded-xl text-left text-xs transition-colors"
                  >
                    <UserAvatar src={user.avatar} name={user.name} userId={user.id} size="xs" showBadge />
                    <span className="font-semibold text-slate-900 truncate">{user.name}</span>
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No conversations yet. Tap the message icon above to start chatting!
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const otherId = conv.participantIds.find((id) => id !== currentUser.id) || currentUser.id;
              const contact = availableUsers.find((u) => u.id === otherId);
              const isActive = conv.id === activeConversationId;
              const unread = conv.unreadCount ? conv.unreadCount[currentUser.id] || 0 : 0;

              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                    isActive ? 'bg-blue-50/70 border-r-4 border-[#1877F2]' : 'hover:bg-slate-50'
                  }`}
                >
                  <UserAvatar
                    src={contact?.avatar}
                    name={contact?.name || 'User'}
                    userId={contact?.id}
                    size="lg"
                    showBadge
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="font-bold text-slate-900 text-sm truncate">{contact?.name}</p>
                      <span className="text-[10px] text-slate-400">
                        {formatMsgTime(conv.lastMessageTime || conv.updatedAt)}
                      </span>
                    </div>
                    <p
                      className={`text-xs truncate ${
                        unread > 0 ? 'text-slate-900 font-bold' : 'text-slate-500'
                      }`}
                    >
                      {conv.lastMessage || 'Sent a photo'}
                    </p>
                  </div>

                  {unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-[#1877F2] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {unread}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Pane: Chat Window */}
      {activeConversationId && otherUser ? (
        <div className="flex-1 flex flex-col h-full bg-slate-50/50">
          {/* Chat Header */}
          <div className="p-3.5 sm:p-4 bg-white border-b border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setActiveConversationId(null)}
                className="md:hidden p-1.5 rounded-full hover:bg-slate-100 text-slate-600"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <UserAvatar
                src={otherUser.avatar}
                name={otherUser.name}
                userId={otherUser.id}
                size="md"
                showBadge
              />

              <div className="min-w-0">
                <h3 className="font-bold text-slate-900 text-sm truncate leading-tight">
                  {otherUser.name}
                </h3>
                <span
                  className={`text-[11px] font-medium flex items-center gap-1.5 ${
                    isUserOnline(otherUser.id) ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isUserOnline(otherUser.id) ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  />
                  {isUserOnline(otherUser.id) ? 'Online agora' : 'Offline'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-500">
              <button className="p-2 rounded-full hover:bg-slate-100 transition-colors" title="Audio Call">
                <Phone className="w-4 h-4 text-[#1877F2]" />
              </button>
              <button className="p-2 rounded-full hover:bg-slate-100 transition-colors" title="Video Call">
                <Video className="w-4 h-4 text-[#1877F2]" />
              </button>
              <button className="p-2 rounded-full hover:bg-slate-100 transition-colors" title="Contact Info">
                <Info className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoadingMessages ? (
              <div className="flex items-center justify-center py-12 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-[#1877F2]" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <div className="flex justify-center">
                  <UserAvatar
                    src={otherUser.avatar}
                    name={otherUser.name}
                    userId={otherUser.id}
                    size="xl"
                    showBadge
                  />
                </div>
                <h4 className="font-bold text-slate-800 text-base">{otherUser.name}</h4>
                <p className="text-xs text-slate-400">
                  Say hi to {otherUser.name.split(' ')[0]}! You are connected on LLite.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === currentUser.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isMe && (
                      <UserAvatar
                        src={msg.senderAvatar || otherUser.avatar}
                        name={msg.senderName}
                        userId={msg.senderId || otherUser.id}
                        size="xs"
                        showBadge
                        className="mb-1"
                      />
                    )}

                    <div className="max-w-[80%] sm:max-w-md space-y-1">
                      {msg.mediaUrl && (
                        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
                          <img
                            src={msg.mediaUrl}
                            alt="Attached media"
                            className="max-h-60 w-full object-cover cursor-pointer hover:scale-[1.02] transition-transform"
                          />
                        </div>
                      )}

                      {msg.text && (
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed break-words whitespace-pre-wrap ${
                            isMe
                              ? 'bg-[#1877F2] text-white rounded-br-xs shadow-xs'
                              : 'bg-white text-slate-900 border border-slate-200/80 rounded-bl-xs shadow-xs'
                          }`}
                        >
                          {msg.text}
                        </div>
                      )}

                      <div
                        className={`flex items-center gap-1 text-[10px] text-slate-400 ${
                          isMe ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <span>{formatMsgTime(msg.createdAt)}</span>
                        {isMe && (
                          <span>
                            {msg.read ? (
                              <CheckCheck className="w-3 h-3 text-[#1877F2]" />
                            ) : (
                              <Check className="w-3 h-3 text-slate-400" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Media preview before send */}
          {mediaAttachment && (
            <div className="px-4 py-2 bg-slate-100 flex items-center justify-between border-t border-slate-200">
              <div className="flex items-center gap-2">
                <img
                  src={mediaAttachment}
                  alt="Attachment preview"
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <span className="text-xs text-slate-600 font-medium">Photo attached</span>
              </div>
              <button
                onClick={() => setMediaAttachment('')}
                className="p-1 rounded-full hover:bg-slate-200 text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Message Input Box */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white border-t border-slate-200/80 flex items-center gap-2"
          >
            <label
              className="p-2 rounded-full hover:bg-slate-100 text-[#1877F2] cursor-pointer transition-colors"
              title="Attach photo"
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handlePhotoSelect}
              />
              <Image className="w-5 h-5" />
            </label>

            <input
              type="text"
              placeholder={`Message ${otherUser.name.split(' ')[0]}...`}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="flex-1 bg-slate-100 hover:bg-slate-200/70 focus:bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 py-2.5 px-4 rounded-full border border-transparent focus:border-[#1877F2] outline-none transition-all"
            />

            <button
              type="submit"
              disabled={(!messageText.trim() && !mediaAttachment) || isSending}
              className="p-2.5 rounded-full bg-[#1877F2] hover:bg-[#155dfc] text-white disabled:opacity-40 disabled:hover:bg-[#1877F2] shadow-xs transition-colors"
            >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 flex-col items-center justify-center p-8 text-center bg-slate-50/50 space-y-3">
          <div className="w-16 h-16 rounded-full bg-blue-100 text-[#1877F2] flex items-center justify-center">
            <MessageCircle className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg">Your Messages</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm">
            Select a conversation from the left or start a new chat with any registered user.
          </p>
        </div>
      )}
    </div>
  );
};
