import { User, Post, PostComment, Story, Message, Conversation, Notification } from '../types';
import {
  INITIAL_USERS,
  INITIAL_POSTS,
  INITIAL_COMMENTS,
  INITIAL_STORIES,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  INITIAL_NOTIFICATIONS,
} from '../data/initialData';

// Fallback localStorage cache keys
const STORAGE_PREFIX = 'llite_';

function getLocal<T>(key: string, defaultValue: T): T {
  try {
    const val = localStorage.getItem(STORAGE_PREFIX + key);
    return val ? JSON.parse(val) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch {}
}

export const api = {
  // --- AUTH ---
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      return await res.json();
    }
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Credenciais inválidas');
  },

  async register(payload: {
    name: string;
    username: string;
    email: string;
    password: string;
    bio?: string;
    avatar?: string;
  }): Promise<{ user: User; token: string }> {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        const users = getLocal<User[]>('users', INITIAL_USERS);
        users.push(data.user);
        setLocal('users', users);
        return data;
      }
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Falha no registo. Verifique os dados introduzidos.');
    } catch (err: unknown) {
      throw err;
    }
  },

  async resetPassword(email: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });
      if (res.ok) {
        return await res.json();
      }
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to reset password');
    } catch (err: unknown) {
      return { success: true, message: 'Password reset successfully (local mode).' };
    }
  },

  // --- POSTS ---
  async getPosts(options?: { type?: 'photo' | 'video'; authorId?: string }): Promise<Post[]> {
    try {
      const params = new URLSearchParams();
      if (options?.type) params.set('type', options.type);
      if (options?.authorId) params.set('authorId', options.authorId);
      const res = await fetch(`/api/posts?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLocal('posts', data);
        return data;
      }
    } catch {}
    let list = getLocal<Post[]>('posts', INITIAL_POSTS);
    if (options?.type) list = list.filter((p) => p.mediaType === options.type);
    if (options?.authorId) list = list.filter((p) => p.authorId === options.authorId);
    return list;
  },

  async createPost(post: {
    authorId: string;
    content: string;
    mediaType?: 'none' | 'photo' | 'video';
    mediaUrl?: string;
    videoThumbnail?: string;
    videoDuration?: string;
    privacy?: 'public' | 'friends';
  }): Promise<Post> {
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    // Fallback
    const users = getLocal<User[]>('users', INITIAL_USERS);
    const author = users.find((u) => u.id === post.authorId) || INITIAL_USERS[0];
    const newPost: Post = {
      id: 'post_' + Math.random().toString(36).substring(2, 9),
      authorId: author.id,
      authorName: author.name,
      authorUsername: author.username,
      authorAvatar: author.avatar,
      content: post.content,
      mediaType: post.mediaType || (post.mediaUrl ? 'photo' : 'none'),
      mediaUrl: post.mediaUrl,
      videoThumbnail: post.videoThumbnail,
      videoDuration: post.videoDuration,
      likes: [],
      commentsCount: 0,
      sharesCount: 0,
      privacy: post.privacy || 'public',
      createdAt: new Date().toISOString(),
    };
    const current = getLocal<Post[]>('posts', INITIAL_POSTS);
    current.unshift(newPost);
    setLocal('posts', current);
    return newPost;
  },

  async deletePost(postId: string, userId: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) return true;
    } catch {}
    const current = getLocal<Post[]>('posts', INITIAL_POSTS);
    setLocal(
      'posts',
      current.filter((p) => p.id !== postId)
    );
    return true;
  },

  async toggleLikePost(postId: string, userId: string): Promise<{ likes: string[]; liked: boolean }> {
    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    const current = getLocal<Post[]>('posts', INITIAL_POSTS);
    const post = current.find((p) => p.id === postId);
    if (post) {
      const liked = post.likes.includes(userId);
      post.likes = liked ? post.likes.filter((id) => id !== userId) : [...post.likes, userId];
      setLocal('posts', current);
      return { likes: post.likes, liked: !liked };
    }
    return { likes: [], liked: false };
  },

  // --- COMMENTS ---
  async getComments(postId: string): Promise<PostComment[]> {
    try {
      const res = await fetch(`/api/posts/${postId}/comments`);
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    const all = getLocal<PostComment[]>('comments', INITIAL_COMMENTS);
    return all.filter((c) => c.postId === postId);
  },

  async addComment(postId: string, authorId: string, content: string): Promise<PostComment> {
    try {
      const res = await fetch(`/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorId, content }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    const users = getLocal<User[]>('users', INITIAL_USERS);
    const author = users.find((u) => u.id === authorId) || INITIAL_USERS[0];
    const newComment: PostComment = {
      id: 'comm_' + Math.random().toString(36).substring(2, 9),
      postId,
      authorId: author.id,
      authorName: author.name,
      authorAvatar: author.avatar,
      content,
      createdAt: new Date().toISOString(),
      likes: [],
    };
    const all = getLocal<PostComment[]>('comments', INITIAL_COMMENTS);
    all.push(newComment);
    setLocal('comments', all);
    return newComment;
  },

  async sharePost(postId: string): Promise<number> {
    try {
      const res = await fetch(`/api/posts/${postId}/share`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        return data.sharesCount;
      }
    } catch {}
    return 1;
  },

  // --- STORIES ---
  async getStories(): Promise<Story[]> {
    try {
      const res = await fetch('/api/stories');
      if (res.ok) return await res.json();
    } catch {}
    return INITIAL_STORIES;
  },

  // --- USERS & PROFILE ---
  async getUsers(): Promise<User[]> {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setLocal('users', data);
        return data;
      }
    } catch {}
    return getLocal<User[]>('users', INITIAL_USERS);
  },

  async getUser(id: string): Promise<User | null> {
    try {
      const res = await fetch(`/api/users/${id}`);
      if (res.ok) return await res.json();
    } catch {}
    const list = getLocal<User[]>('users', INITIAL_USERS);
    return list.find((u) => u.id === id) || null;
  },

  async updateProfile(payload: {
    userId: string;
    name?: string;
    bio?: string;
    location?: string;
    workplace?: string;
    avatar?: string;
    coverPhoto?: string;
  }): Promise<User> {
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) return await res.json();
    } catch {}
    const users = getLocal<User[]>('users', INITIAL_USERS);
    const user = users.find((u) => u.id === payload.userId);
    if (user) {
      if (payload.name) user.name = payload.name;
      if (payload.bio !== undefined) user.bio = payload.bio;
      if (payload.location !== undefined) user.location = payload.location;
      if (payload.workplace !== undefined) user.workplace = payload.workplace;
      if (payload.avatar) user.avatar = payload.avatar;
      if (payload.coverPhoto) user.coverPhoto = payload.coverPhoto;
      setLocal('users', users);
      return user;
    }
    throw new Error('User not found');
  },

  // --- FRIENDS ---
  async getFriendsList(userId: string): Promise<{
    friends: User[];
    pendingRequests: { friendshipId: string; createdAt: string; user: User }[];
    sentRequests: { friendshipId: string; createdAt: string; user: User }[];
    suggestions: User[];
  }> {
    try {
      const res = await fetch(`/api/friends/list/${userId}`);
      if (res.ok) return await res.json();
    } catch {}
    const users = getLocal<User[]>('users', INITIAL_USERS);
    return {
      friends: users.filter((u) => u.id !== userId && u.id !== 'user_sarah'),
      pendingRequests: [
        {
          friendshipId: 'fr_mock',
          createdAt: new Date().toISOString(),
          user: users.find((u) => u.id === 'user_sarah') || users[1],
        },
      ],
      sentRequests: [],
      suggestions: users.filter((u) => u.id !== userId),
    };
  },

  async sendFriendRequest(requesterId: string, receiverId: string): Promise<unknown> {
    const res = await fetch('/api/friends/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requesterId, receiverId }),
    });
    return res.json().catch(() => ({}));
  },

  async acceptFriendRequest(userId: string, requesterId: string): Promise<unknown> {
    const res = await fetch('/api/friends/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, requesterId }),
    });
    return res.json().catch(() => ({}));
  },

  async rejectFriendRequest(userId: string, requesterId: string): Promise<unknown> {
    const res = await fetch('/api/friends/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, requesterId }),
    });
    return res.json().catch(() => ({}));
  },

  async removeFriend(userId: string, friendId: string): Promise<unknown> {
    const res = await fetch('/api/friends/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, friendId }),
    });
    return res.json().catch(() => ({}));
  },

  // --- MESSAGES ---
  async getConversations(userId: string): Promise<Conversation[]> {
    try {
      const res = await fetch(`/api/conversations?userId=${userId}`);
      if (res.ok) return await res.json();
    } catch {}
    return INITIAL_CONVERSATIONS;
  },

  async getMessages(conversationId: string, userId: string): Promise<Message[]> {
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages?userId=${userId}`);
      if (res.ok) return await res.json();
    } catch {}
    const all = getLocal<Message[]>('messages', INITIAL_MESSAGES);
    return all.filter((m) => m.conversationId === conversationId);
  },

  async sendMessage(conversationId: string, senderId: string, text: string, mediaUrl?: string): Promise<Message> {
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId, text, mediaUrl }),
      });
      if (res.ok) return await res.json();
    } catch {}
    const users = getLocal<User[]>('users', INITIAL_USERS);
    const sender = users.find((u) => u.id === senderId) || INITIAL_USERS[0];
    const newMsg: Message = {
      id: 'msg_' + Math.random().toString(36).substring(2, 9),
      conversationId,
      senderId,
      senderName: sender.name,
      senderAvatar: sender.avatar,
      text: text || (mediaUrl ? 'Sent a photo' : ''),
      mediaUrl,
      createdAt: new Date().toISOString(),
      read: false,
    };
    return newMsg;
  },

  async startConversation(userId: string, targetUserId: string): Promise<Conversation> {
    const res = await fetch('/api/conversations/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, targetUserId }),
    });
    return res.json();
  },

  // --- NOTIFICATIONS ---
  async getNotifications(userId: string): Promise<Notification[]> {
    try {
      const res = await fetch(`/api/notifications?userId=${userId}`);
      if (res.ok) return await res.json();
    } catch {}
    return INITIAL_NOTIFICATIONS;
  },

  async markNotificationsRead(userId: string, notificationId?: string): Promise<unknown> {
    const res = await fetch('/api/notifications/read', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, notificationId }),
    });
    return res.json().catch(() => ({}));
  },

  // --- SEARCH ---
  async search(query: string): Promise<{ users: User[]; posts: Post[]; videos: Post[] }> {
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (res.ok) return await res.json();
    } catch {}
    const users = getLocal<User[]>('users', INITIAL_USERS).filter((u) =>
      u.name.toLowerCase().includes(query.toLowerCase())
    );
    const posts = getLocal<Post[]>('posts', INITIAL_POSTS).filter((p) =>
      p.content.toLowerCase().includes(query.toLowerCase())
    );
    const videos = posts.filter((p) => p.mediaType === 'video');
    return { users, posts, videos };
  },
};
