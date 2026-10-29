export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  coverPhoto: string;
  bio: string;
  location?: string;
  workplace?: string;
  joinedAt: string;
  isOnline: boolean;
  friendsCount: number;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  content: string;
  mediaType: 'none' | 'photo' | 'video';
  mediaUrl?: string;
  mediaUrls?: string[];
  videoThumbnail?: string;
  videoDuration?: string;
  likes: string[];
  commentsCount: number;
  sharesCount: number;
  privacy: 'public' | 'friends';
  createdAt: string;
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  likes: string[];
}

export type Comment = PostComment;

export interface Story {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  mediaUrl: string;
  createdAt: string;
  seen: boolean;
}

export interface Friendship {
  id: string;
  requesterId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  mediaUrl?: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participants?: User[];
  lastMessage: string;
  lastMessageTime: string;
  lastSenderId: string;
  unreadCount: Record<string, number>;
  updatedAt: string;
}

export interface Notification {
  id: string;
  recipientId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  type: 'friend_request' | 'friend_accepted' | 'like' | 'comment' | 'message';
  targetId?: string;
  text: string;
  read: boolean;
  createdAt: string;
}

export type NavigationTab = 'feed' | 'friends' | 'videos' | 'messages' | 'notifications' | 'profile' | 'search';
