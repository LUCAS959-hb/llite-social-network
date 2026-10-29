import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Post, Comment, Story, User, Conversation, Message, Notification, NavigationTab } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { sounds } from '../services/sound';

interface SocialContextType {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  selectedUserId: string | null;
  setSelectedUserId: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  // Posts
  posts: Post[];
  isLoadingPosts: boolean;
  createPost: (content: string, mediaType?: 'none' | 'photo' | 'video', mediaUrl?: string, videoThumbnail?: string, videoDuration?: string) => Promise<Post>;
  deletePost: (postId: string) => Promise<void>;
  toggleLikePost: (postId: string) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<Comment>;
  getCommentsForPost: (postId: string) => Promise<Comment[]>;
  sharePost: (postId: string) => Promise<void>;
  // Stories
  stories: Story[];
  // Friends
  friends: User[];
  pendingRequests: { friendshipId: string; createdAt: string; user: User }[];
  sentRequests: { friendshipId: string; createdAt: string; user: User }[];
  suggestions: User[];
  sendFriendRequest: (targetUserId: string) => Promise<void>;
  acceptFriendRequest: (requesterId: string) => Promise<void>;
  rejectFriendRequest: (requesterId: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
  reloadFriends: () => Promise<void>;
  // Conversations & Messages
  conversations: Conversation[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  messages: Message[];
  isLoadingMessages: boolean;
  sendMessage: (text: string, mediaUrl?: string) => Promise<void>;
  startConversationWithUser: (targetUserId: string) => Promise<string>;
  unreadMessagesCount: number;
  // Notifications
  notifications: Notification[];
  unreadNotificationsCount: number;
  markNotificationsAsRead: (notificationId?: string) => Promise<void>;
  // Modals
  isCreatePostModalOpen: boolean;
  setIsCreatePostModalOpen: (open: boolean) => void;
  isLightboxOpen: boolean;
  lightboxUrl: string | null;
  openLightbox: (url: string) => void;
  closeLightbox: () => void;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export const SocialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<NavigationTab>('feed');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Feed State
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [stories, setStories] = useState<Story[]>([]);

  // Friends State
  const [friends, setFriends] = useState<User[]>([]);
  const [pendingRequests, setPendingRequests] = useState<{ friendshipId: string; createdAt: string; user: User }[]>([]);
  const [sentRequests, setSentRequests] = useState<{ friendshipId: string; createdAt: string; user: User }[]>([]);
  const [suggestions, setSuggestions] = useState<User[]>([]);

  // Messages State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Modals
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Load Posts & Stories
  const loadPosts = useCallback(async () => {
    setIsLoadingPosts(true);
    try {
      const data = await api.getPosts();
      const unique = Array.from(new Map(data.map((p) => [p.id, p])).values());
      setPosts(unique);
    } finally {
      setIsLoadingPosts(false);
    }
  }, []);

  const loadStories = useCallback(async () => {
    const data = await api.getStories();
    setStories(data);
  }, []);

  // Load Friends Data
  const reloadFriends = useCallback(async () => {
    if (!currentUser) return;
    try {
      const data = await api.getFriendsList(currentUser.id);
      setFriends(data.friends || []);
      setPendingRequests(data.pendingRequests || []);
      setSentRequests(data.sentRequests || []);
      setSuggestions(data.suggestions || []);
    } catch (err) {
      console.error('Failed to reload friends', err);
    }
  }, [currentUser]);

  // Load Conversations
  const reloadConversations = useCallback(async () => {
    if (!currentUser) return;
    try {
      const data = await api.getConversations(currentUser.id);
      setConversations(data);
    } catch (err) {
      console.error('Failed to load conversations', err);
    }
  }, [currentUser]);

  // Load Notifications
  const reloadNotifications = useCallback(async () => {
    if (!currentUser) return;
    try {
      const data = await api.getNotifications(currentUser.id);
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  }, [currentUser]);

  // Initial Data Load
  useEffect(() => {
    loadPosts();
    loadStories();
  }, [loadPosts, loadStories]);

  useEffect(() => {
    if (currentUser) {
      reloadFriends();
      reloadConversations();
      reloadNotifications();
    }
  }, [currentUser, reloadFriends, reloadConversations, reloadNotifications]);

  // Load Messages for Active Conversation
  useEffect(() => {
    if (!activeConversationId || !currentUser) {
      setMessages([]);
      return;
    }
    let isCancelled = false;
    setIsLoadingMessages(true);
    api
      .getMessages(activeConversationId, currentUser.id)
      .then((msgs) => {
        if (!isCancelled) {
          setMessages(msgs);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoadingMessages(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [activeConversationId, currentUser]);

  // SSE Real-time Listener
  useEffect(() => {
    if (!currentUser) return;
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`/api/realtime?userId=${currentUser.id}`);

      eventSource.addEventListener('new_message', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          sounds.playMessageReceived();
          if (data.conversationId === activeConversationId) {
            setMessages((prev) => [...prev.filter((m) => m.id !== data.message.id), data.message]);
          }
          reloadConversations();
        } catch {}
      });

      eventSource.addEventListener('notification_created', (e: MessageEvent) => {
        try {
          const notif = JSON.parse(e.data);
          sounds.playPop();
          setNotifications((prev) => [notif, ...prev.filter((n) => n.id !== notif.id)]);
        } catch {}
      });

      eventSource.addEventListener('post_created', (e: MessageEvent) => {
        try {
          const post = JSON.parse(e.data);
          setPosts((prev) => [post, ...prev.filter((p) => p.id !== post.id)]);
        } catch {}
      });

      eventSource.addEventListener('post_liked', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          setPosts((prev) =>
            prev.map((p) => (p.id === data.postId ? { ...p, likes: data.likes } : p))
          );
        } catch {}
      });

      eventSource.addEventListener('comment_created', (e: MessageEvent) => {
        try {
          const comment = JSON.parse(e.data);
          setPosts((prev) =>
            prev.map((p) =>
              p.id === comment.postId ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p
            )
          );
        } catch {}
      });

      eventSource.addEventListener('post_deleted', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          setPosts((prev) => prev.filter((p) => p.id !== data.postId));
        } catch {}
      });

      eventSource.addEventListener('friendship_updated', () => {
        reloadFriends();
      });

      eventSource.addEventListener('friend_request_received', () => {
        reloadFriends();
      });
    } catch {}

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [currentUser, activeConversationId, reloadConversations, reloadFriends]);

  // Post Actions
  const createPost = async (
    content: string,
    mediaType: 'none' | 'photo' | 'video' = 'none',
    mediaUrl?: string,
    videoThumbnail?: string,
    videoDuration?: string
  ): Promise<Post> => {
    if (!currentUser) throw new Error('Must be logged in to create post');
    const newPost = await api.createPost({
      authorId: currentUser.id,
      content,
      mediaType,
      mediaUrl,
      videoThumbnail,
      videoDuration,
      privacy: 'public',
    });
    setPosts((prev) => [newPost, ...prev.filter((p) => p.id !== newPost.id)]);
    sounds.playPop();
    return newPost;
  };

  const deletePost = async (postId: string) => {
    if (!currentUser) return;
    await api.deletePost(postId, currentUser.id);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const toggleLikePost = async (postId: string) => {
    if (!currentUser) return;
    sounds.playPop();
    // Optimistic update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const hasLiked = p.likes.includes(currentUser.id);
          const updatedLikes = hasLiked
            ? p.likes.filter((id) => id !== currentUser.id)
            : [...p.likes, currentUser.id];
          return { ...p, likes: updatedLikes };
        }
        return p;
      })
    );
    try {
      const res = await api.toggleLikePost(postId, currentUser.id);
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, likes: res.likes } : p))
      );
    } catch {
      // Revert if error
      loadPosts();
    }
  };

  const addComment = async (postId: string, content: string): Promise<Comment> => {
    if (!currentUser) throw new Error('Must be logged in to comment');
    sounds.playPop();
    const comment = await api.addComment(postId, currentUser.id, content);
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p))
    );
    return comment;
  };

  const getCommentsForPost = async (postId: string): Promise<Comment[]> => {
    return api.getComments(postId);
  };

  const sharePost = async (postId: string) => {
    sounds.playPop();
    const sharesCount = await api.sharePost(postId);
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, sharesCount } : p))
    );
  };

  // Friends Actions
  const sendFriendRequest = async (targetUserId: string) => {
    if (!currentUser) return;
    sounds.playPop();
    await api.sendFriendRequest(currentUser.id, targetUserId);
    reloadFriends();
  };

  const acceptFriendRequest = async (requesterId: string) => {
    if (!currentUser) return;
    sounds.playPop();
    await api.acceptFriendRequest(currentUser.id, requesterId);
    reloadFriends();
  };

  const rejectFriendRequest = async (requesterId: string) => {
    if (!currentUser) return;
    await api.rejectFriendRequest(currentUser.id, requesterId);
    reloadFriends();
  };

  const removeFriend = async (friendId: string) => {
    if (!currentUser) return;
    await api.removeFriend(currentUser.id, friendId);
    reloadFriends();
  };

  // Messages Actions
  const sendMessage = async (text: string, mediaUrl?: string) => {
    if (!currentUser || !activeConversationId) return;
    sounds.playMessageSent();
    const newMsg = await api.sendMessage(activeConversationId, currentUser.id, text, mediaUrl);
    setMessages((prev) => [...prev.filter((m) => m.id !== newMsg.id), newMsg]);
    reloadConversations();
  };

  const startConversationWithUser = async (targetUserId: string): Promise<string> => {
    if (!currentUser) return '';
    const conv = await api.startConversation(currentUser.id, targetUserId);
    setActiveConversationId(conv.id);
    setActiveTab('messages');
    reloadConversations();
    return conv.id;
  };

  const markNotificationsAsRead = async (notificationId?: string) => {
    if (!currentUser) return;
    await api.markNotificationsRead(currentUser.id, notificationId);
    if (notificationId) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } else {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  const openLightbox = (url: string) => {
    setLightboxUrl(url);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setLightboxUrl(null);
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;
  const unreadMessagesCount = conversations.reduce((acc, c) => {
    if (currentUser && c.unreadCount && c.unreadCount[currentUser.id]) {
      return acc + c.unreadCount[currentUser.id];
    }
    return acc;
  }, 0);

  return (
    <SocialContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedUserId,
        setSelectedUserId,
        searchQuery,
        setSearchQuery,
        posts,
        isLoadingPosts,
        createPost,
        deletePost,
        toggleLikePost,
        addComment,
        getCommentsForPost,
        sharePost,
        stories,
        friends,
        pendingRequests,
        sentRequests,
        suggestions,
        sendFriendRequest,
        acceptFriendRequest,
        rejectFriendRequest,
        removeFriend,
        reloadFriends,
        conversations,
        activeConversationId,
        setActiveConversationId,
        messages,
        isLoadingMessages,
        sendMessage,
        startConversationWithUser,
        unreadMessagesCount,
        notifications,
        unreadNotificationsCount,
        markNotificationsAsRead,
        isCreatePostModalOpen,
        setIsCreatePostModalOpen,
        isLightboxOpen,
        lightboxUrl,
        openLightbox,
        closeLightbox,
      }}
    >
      {children}
    </SocialContext.Provider>
  );
};

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (!context) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
};
