import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'llite_database.json');
const SEED_FILE = path.resolve(DATA_DIR, 'initial_seed.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  coverPhoto?: string;
  bio?: string;
  location?: string;
  workplace?: string;
  joinedAt?: string;
  isOnline?: boolean;
  friendsCount?: number;
}

interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  likes: string[];
}

interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  content: string;
  mediaType: 'none' | 'photo' | 'video';
  mediaUrl?: string;
  videoThumbnail?: string;
  videoDuration?: string;
  likes: string[];
  commentsCount: number;
  sharesCount: number;
  privacy: 'public' | 'friends' | 'only_me';
  createdAt: string;
}

interface Story {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  mediaUrl: string;
  createdAt: string;
  seen: boolean;
}

interface Friendship {
  id: string;
  requesterId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  updatedAt: string;
}

interface Conversation {
  id: string;
  participantIds: string[];
  lastMessage: string;
  lastMessageTime: string;
  lastSenderId: string;
  unreadCount: Record<string, number>;
  updatedAt: string;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  createdAt: string;
  read: boolean;
}

interface Notification {
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

interface DatabaseSchema {
  users: User[];
  posts: Post[];
  comments: PostComment[];
  stories: Story[];
  friendships: Friendship[];
  conversations: Conversation[];
  messages: Message[];
  notifications: Notification[];
  passwords: Record<string, string>; // userId -> passwordHash
}

function loadDatabase(): DatabaseSchema {
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    } catch (e) {
      console.error('Error reading database file, reinitializing', e);
    }
  }

  if (fs.existsSync(SEED_FILE)) {
    try {
      const seedRaw = fs.readFileSync(SEED_FILE, 'utf-8');
      const seedDb: DatabaseSchema = JSON.parse(seedRaw);
      saveDatabase(seedDb);
      return seedDb;
    } catch (e) {
      console.error('Error reading initial seed file, creating empty fallback', e);
    }
  }

  const fallbackDb: DatabaseSchema = {
    users: [],
    posts: [],
    comments: [],
    stories: [],
    friendships: [],
    conversations: [],
    messages: [],
    notifications: [],
    passwords: {},
  };

  saveDatabase(fallbackDb);
  return fallbackDb;
}

let db = loadDatabase();

function saveDatabase(dataToSave = db) {
  try {
    const tempFile = DB_FILE + '.tmp';
    fs.writeFileSync(tempFile, JSON.stringify(dataToSave, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Failed to atomically persist database, fallback to direct write:', err);
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (e) {
      console.error('Direct write also failed:', e);
    }
  }
}

// Active SSE connections: userId -> Response[]
const sseClients = new Map<string, Response[]>();

function broadcastToUser(userId: string, event: string, data: unknown) {
  const clients = sseClients.get(userId);
  if (clients && clients.length > 0) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    clients.forEach((res) => {
      try {
        res.write(payload);
      } catch {
        // connection closed
      }
    });
  }
}

function broadcastToAll(event: string, data: unknown) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach((clients) => {
    clients.forEach((res) => {
      try {
        res.write(payload);
      } catch {}
    });
  });
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Presence Endpoint
  app.get('/api/presence', (_req: Request, res: Response) => {
    const onlineIds = Array.from(sseClients.entries())
      .filter(([_, clients]) => clients.length > 0)
      .map(([id]) => id);
    // Include initial active seeded users as online baseline
    const combined = Array.from(new Set([...onlineIds, 'user_lucas', 'user_elena', 'user_sarah']));
    return res.json({ onlineUserIds: combined });
  });

  // SSE Realtime Endpoint
  app.get('/api/realtime', (req: Request, res: Response) => {
    const userId = (req.query.userId as string) || 'guest';
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    if (!sseClients.has(userId)) {
      sseClients.set(userId, []);
    }
    sseClients.get(userId)!.push(res);

    if (userId !== 'guest') {
      broadcastToAll('presence_update', { userId, isOnline: true });
    }

    res.write(`event: connected\ndata: ${JSON.stringify({ status: 'connected', userId })}\n\n`);

    req.on('close', () => {
      const list = sseClients.get(userId) || [];
      const updated = list.filter((c) => c !== res);
      sseClients.set(userId, updated);
      if (updated.length === 0 && userId !== 'guest') {
        broadcastToAll('presence_update', { userId, isOnline: false });
      }
    });
  });

  // --- AUTH ENDPOINTS ---
  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { name, username, email, password, bio, avatar } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const userId = 'user_' + crypto.randomUUID().slice(0, 8);
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    const newUser = {
      id: userId,
      name: name.trim(),
      username: (username || name.toLowerCase().replace(/[^a-z0-9]/g, '')).trim(),
      email: cleanEmail,
      avatar: avatar ? avatar.trim() : '',
      coverPhoto:
        'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80',
      bio: bio || 'Hello, I just joined LLite!',
      location: 'Earth',
      workplace: 'Member @ LLite',
      joinedAt: 'Just now',
      isOnline: true,
      friendsCount: 0,
    };

    db.users.push(newUser);
    db.passwords[userId] = hash;
    saveDatabase();

    return res.status(201).json({ user: newUser, token: `token_${userId}` });
  });

  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return res.status(401).json({ error: 'No account found with this email' });
    }

    const hash = crypto.createHash('sha256').update(password).digest('hex');
    if (db.passwords[user.id] && db.passwords[user.id] !== hash) {
      return res.status(401).json({ error: 'Incorrect password. Try "password123" for demo accounts.' });
    }

    user.isOnline = true;
    saveDatabase();

    return res.json({ user, token: `token_${user.id}` });
  });

  app.post('/api/auth/reset-password', (req: Request, res: Response) => {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and new password are required' });
    }
    const cleanEmail = email.toLowerCase().trim();
    const user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return res.status(404).json({ error: 'No user registered with this email' });
    }
    const hash = crypto.createHash('sha256').update(newPassword).digest('hex');
    db.passwords[user.id] = hash;
    saveDatabase();
    return res.json({ success: true, message: 'Password has been reset successfully. You can now log in.' });
  });

  // --- USERS ENDPOINTS ---
  app.get('/api/users', (_req: Request, res: Response) => {
    return res.json(db.users);
  });

  app.get('/api/users/:id', (req: Request, res: Response) => {
    const user = db.users.find((u) => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json(user);
  });

  app.put('/api/users/profile', (req: Request, res: Response) => {
    const { userId, name, bio, location, workplace, avatar, coverPhoto } = req.body;
    const user = db.users.find((u) => u.id === userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (name) user.name = name.trim();
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (workplace !== undefined) user.workplace = workplace;
    if (avatar !== undefined) user.avatar = avatar;
    if (coverPhoto !== undefined) user.coverPhoto = coverPhoto;

    // Update avatar and name on existing posts authored by this user
    db.posts.forEach((p) => {
      if (p.authorId === userId) {
        if (name) p.authorName = name.trim();
        if (avatar !== undefined) p.authorAvatar = avatar;
      }
    });

    // Update avatar and name on existing comments authored by this user
    db.comments.forEach((c) => {
      if (c.authorId === userId) {
        if (name) c.authorName = name.trim();
        if (avatar !== undefined) c.authorAvatar = avatar;
      }
    });

    // Update avatar and name on existing messages authored by this user
    db.messages.forEach((m) => {
      if (m.senderId === userId) {
        if (name) m.senderName = name.trim();
        if (avatar !== undefined) m.senderAvatar = avatar;
      }
    });

    // Update avatar and name on existing stories authored by this user
    db.stories.forEach((s) => {
      if (s.authorId === userId) {
        if (name) s.authorName = name.trim();
        if (avatar !== undefined) s.authorAvatar = avatar;
      }
    });

    saveDatabase();
    broadcastToAll('user_updated', user);
    return res.json(user);
  });

  // --- POSTS ENDPOINTS ---
  app.get('/api/posts', (req: Request, res: Response) => {
    const { type, authorId } = req.query;
    let list = [...db.posts];

    if (type === 'video') {
      list = list.filter((p) => p.mediaType === 'video');
    } else if (type === 'photo') {
      list = list.filter((p) => p.mediaType === 'photo');
    }

    if (authorId) {
      list = list.filter((p) => p.authorId === authorId);
    }

    // Sort newest first
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return res.json(list);
  });

  app.post('/api/posts', (req: Request, res: Response) => {
    const { authorId, content, mediaType, mediaUrl, videoThumbnail, videoDuration, privacy } = req.body;
    const author = db.users.find((u) => u.id === authorId);
    if (!author) return res.status(400).json({ error: 'Author user not found' });

    if (!content && !mediaUrl) {
      return res.status(400).json({ error: 'Post must have text content or media' });
    }

    const newPost = {
      id: 'post_' + crypto.randomUUID().slice(0, 8),
      authorId: author.id,
      authorName: author.name,
      authorUsername: author.username,
      authorAvatar: author.avatar,
      content: content ? content.trim() : '',
      mediaType: mediaType || (mediaUrl ? 'photo' : 'none'),
      mediaUrl: mediaUrl || undefined,
      videoThumbnail: videoThumbnail || undefined,
      videoDuration: videoDuration || undefined,
      likes: [],
      commentsCount: 0,
      sharesCount: 0,
      privacy: privacy || 'public',
      createdAt: new Date().toISOString(),
    };

    db.posts.unshift(newPost);
    saveDatabase();

    broadcastToAll('post_created', newPost);
    return res.status(201).json(newPost);
  });

  app.delete('/api/posts/:id', (req: Request, res: Response) => {
    const { userId } = req.body;
    const postIndex = db.posts.findIndex((p) => p.id === req.params.id);
    if (postIndex === -1) return res.status(404).json({ error: 'Post not found' });

    const post = db.posts[postIndex];
    if (post.authorId !== userId) {
      return res.status(403).json({ error: 'You are only authorized to delete your own posts' });
    }

    db.posts.splice(postIndex, 1);
    // Delete corresponding comments
    db.comments = db.comments.filter((c) => c.postId !== req.params.id);
    saveDatabase();

    broadcastToAll('post_deleted', { postId: req.params.id });
    return res.json({ success: true });
  });

  app.post('/api/posts/:id/like', (req: Request, res: Response) => {
    const { userId } = req.body;
    const post = db.posts.find((p) => p.id === req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const user = db.users.find((u) => u.id === userId);
    if (!user) return res.status(400).json({ error: 'User not found' });

    const alreadyLiked = post.likes.includes(userId);
    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id !== userId);
    } else {
      post.likes.push(userId);
      // Create notification for author if not liking own post
      if (post.authorId !== userId) {
        const notif = {
          id: 'notif_' + crypto.randomUUID().slice(0, 8),
          recipientId: post.authorId,
          senderId: userId,
          senderName: user.name,
          senderAvatar: user.avatar,
          type: 'like' as const,
          targetId: post.id,
          text: `liked your post: "${post.content.slice(0, 30)}..."`,
          read: false,
          createdAt: new Date().toISOString(),
        };
        db.notifications.unshift(notif);
        broadcastToUser(post.authorId, 'notification_created', notif);
      }
    }

    saveDatabase();
    broadcastToAll('post_liked', { postId: post.id, likes: post.likes });
    return res.json({ likes: post.likes, liked: !alreadyLiked });
  });

  // --- COMMENTS ENDPOINTS ---
  app.get('/api/posts/:id/comments', (req: Request, res: Response) => {
    const comments = db.comments.filter((c) => c.postId === req.params.id);
    comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return res.json(comments);
  });

  app.post('/api/posts/:id/comment', (req: Request, res: Response) => {
    const { authorId, content } = req.body;
    const post = db.posts.find((p) => p.id === req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const author = db.users.find((u) => u.id === authorId);
    if (!author) return res.status(400).json({ error: 'Author not found' });

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content cannot be empty' });
    }

    const newComment = {
      id: 'comm_' + crypto.randomUUID().slice(0, 8),
      postId: post.id,
      authorId: author.id,
      authorName: author.name,
      authorAvatar: author.avatar,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      likes: [],
    };

    db.comments.push(newComment);
    post.commentsCount = (post.commentsCount || 0) + 1;

    // Send notification if not commenting on own post
    if (post.authorId !== authorId) {
      const notif = {
        id: 'notif_' + crypto.randomUUID().slice(0, 8),
        recipientId: post.authorId,
        senderId: author.id,
        senderName: author.name,
        senderAvatar: author.avatar,
        type: 'comment' as const,
        targetId: post.id,
        text: `commented on your post: "${content.slice(0, 30)}..."`,
        read: false,
        createdAt: new Date().toISOString(),
      };
      db.notifications.unshift(notif);
      broadcastToUser(post.authorId, 'notification_created', notif);
    }

    saveDatabase();
    broadcastToAll('comment_created', newComment);
    return res.status(201).json(newComment);
  });

  app.post('/api/posts/:id/share', (req: Request, res: Response) => {
    const post = db.posts.find((p) => p.id === req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    post.sharesCount = (post.sharesCount || 0) + 1;
    saveDatabase();
    broadcastToAll('post_shared', { postId: post.id, sharesCount: post.sharesCount });
    return res.json({ sharesCount: post.sharesCount });
  });

  // --- STORIES ---
  app.get('/api/stories', (_req: Request, res: Response) => {
    return res.json(db.stories);
  });

  // --- FRIENDS ENDPOINTS ---
  app.get('/api/friends/status/:targetId', (req: Request, res: Response) => {
    const currentUserId = req.query.currentUserId as string;
    const targetId = req.params.targetId;

    if (!currentUserId || currentUserId === targetId) {
      return res.json({ status: 'self' });
    }

    const friendship = db.friendships.find(
      (f) =>
        (f.requesterId === currentUserId && f.receiverId === targetId) ||
        (f.requesterId === targetId && f.receiverId === currentUserId)
    );

    if (!friendship) return res.json({ status: 'none' });
    if (friendship.status === 'accepted') return res.json({ status: 'friends' });
    if (friendship.status === 'pending') {
      return res.json({
        status: friendship.requesterId === currentUserId ? 'pending_sent' : 'pending_received',
        friendshipId: friendship.id,
      });
    }
    return res.json({ status: 'none' });
  });

  app.get('/api/friends/list/:userId', (req: Request, res: Response) => {
    const userId = req.params.userId;
    const accepted = db.friendships.filter(
      (f) => (f.requesterId === userId || f.receiverId === userId) && f.status === 'accepted'
    );
    const friendIds = accepted.map((f) => (f.requesterId === userId ? f.receiverId : f.requesterId));
    const friends = db.users.filter((u) => friendIds.includes(u.id));

    const pendingRequests = db.friendships
      .filter((f) => f.receiverId === userId && f.status === 'pending')
      .map((f) => {
        const requester = db.users.find((u) => u.id === f.requesterId);
        return {
          friendshipId: f.id,
          createdAt: f.createdAt,
          user: requester,
        };
      })
      .filter((item) => item.user !== undefined);

    const sentRequests = db.friendships
      .filter((f) => f.requesterId === userId && f.status === 'pending')
      .map((f) => {
        const receiver = db.users.find((u) => u.id === f.receiverId);
        return {
          friendshipId: f.id,
          createdAt: f.createdAt,
          user: receiver,
        };
      })
      .filter((item) => item.user !== undefined);

    // Suggestions: users who are not self and not friends
    const suggestions = db.users.filter(
      (u) =>
        u.id !== userId &&
        !friendIds.includes(u.id) &&
        !db.friendships.some(
          (f) =>
            ((f.requesterId === userId && f.receiverId === u.id) ||
              (f.requesterId === u.id && f.receiverId === userId)) &&
            f.status === 'pending'
        )
    );

    return res.json({
      friends,
      pendingRequests,
      sentRequests,
      suggestions,
    });
  });

  app.post('/api/friends/request', (req: Request, res: Response) => {
    const { requesterId, receiverId } = req.body;
    if (!requesterId || !receiverId || requesterId === receiverId) {
      return res.status(400).json({ error: 'Invalid friend request' });
    }

    const requester = db.users.find((u) => u.id === requesterId);
    if (!requester) return res.status(400).json({ error: 'Requester not found' });

    let existing = db.friendships.find(
      (f) =>
        (f.requesterId === requesterId && f.receiverId === receiverId) ||
        (f.requesterId === receiverId && f.receiverId === requesterId)
    );

    if (existing) {
      if (existing.status === 'accepted') {
        return res.json({ message: 'Already friends', friendship: existing });
      }
      existing.status = 'pending';
      existing.requesterId = requesterId;
      existing.receiverId = receiverId;
      existing.updatedAt = new Date().toISOString();
    } else {
      existing = {
        id: 'fr_' + crypto.randomUUID().slice(0, 8),
        requesterId,
        receiverId,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.friendships.push(existing);
    }

    // Add notification
    const notif = {
      id: 'notif_' + crypto.randomUUID().slice(0, 8),
      recipientId: receiverId,
      senderId: requesterId,
      senderName: requester.name,
      senderAvatar: requester.avatar,
      type: 'friend_request' as const,
      targetId: requesterId,
      text: 'sent you a friend request.',
      read: false,
      createdAt: new Date().toISOString(),
    };
    db.notifications.unshift(notif);
    saveDatabase();

    broadcastToUser(receiverId, 'notification_created', notif);
    broadcastToUser(receiverId, 'friend_request_received', existing);
    return res.status(201).json(existing);
  });

  app.post('/api/friends/accept', (req: Request, res: Response) => {
    const { userId, requesterId } = req.body;
    const friendship = db.friendships.find(
      (f) => f.receiverId === userId && f.requesterId === requesterId && f.status === 'pending'
    );
    if (!friendship) return res.status(404).json({ error: 'Friend request not found' });

    friendship.status = 'accepted';
    friendship.updatedAt = new Date().toISOString();

    // Increment friend counters
    const userA = db.users.find((u) => u.id === userId);
    const userB = db.users.find((u) => u.id === requesterId);
    if (userA) userA.friendsCount = (userA.friendsCount || 0) + 1;
    if (userB) userB.friendsCount = (userB.friendsCount || 0) + 1;

    // Send notification to requester
    if (userA && userB) {
      const notif = {
        id: 'notif_' + crypto.randomUUID().slice(0, 8),
        recipientId: requesterId,
        senderId: userId,
        senderName: userA.name,
        senderAvatar: userA.avatar,
        type: 'friend_accepted' as const,
        targetId: userId,
        text: 'accepted your friend request.',
        read: false,
        createdAt: new Date().toISOString(),
      };
      db.notifications.unshift(notif);
      broadcastToUser(requesterId, 'notification_created', notif);
    }

    saveDatabase();
    broadcastToUser(requesterId, 'friendship_updated', friendship);
    broadcastToUser(userId, 'friendship_updated', friendship);
    return res.json({ success: true, friendship });
  });

  app.post('/api/friends/reject', (req: Request, res: Response) => {
    const { userId, requesterId } = req.body;
    const idx = db.friendships.findIndex(
      (f) => f.receiverId === userId && f.requesterId === requesterId && f.status === 'pending'
    );
    if (idx !== -1) {
      db.friendships.splice(idx, 1);
      saveDatabase();
    }
    return res.json({ success: true });
  });

  app.post('/api/friends/remove', (req: Request, res: Response) => {
    const { userId, friendId } = req.body;
    const idx = db.friendships.findIndex(
      (f) =>
        (f.requesterId === userId && f.receiverId === friendId) ||
        (f.requesterId === friendId && f.receiverId === userId)
    );
    if (idx !== -1) {
      db.friendships.splice(idx, 1);
      const userA = db.users.find((u) => u.id === userId);
      const userB = db.users.find((u) => u.id === friendId);
      if (userA && typeof userA.friendsCount === 'number' && userA.friendsCount > 0) userA.friendsCount--;
      if (userB && typeof userB.friendsCount === 'number' && userB.friendsCount > 0) userB.friendsCount--;
      saveDatabase();
    }
    return res.json({ success: true });
  });

  // --- MESSAGES & CONVERSATIONS ENDPOINTS ---
  app.get('/api/conversations', (req: Request, res: Response) => {
    const userId = req.query.userId as string;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const userConvs = db.conversations.filter((c) => c.participantIds.includes(userId));
    const enriched = userConvs.map((c) => {
      const otherId = c.participantIds.find((id) => id !== userId) || userId;
      const otherUser = db.users.find((u) => u.id === otherId);
      return {
        ...c,
        otherUser,
      };
    });

    enriched.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return res.json(enriched);
  });

  app.get('/api/conversations/:id/messages', (req: Request, res: Response) => {
    const userId = req.query.userId as string;
    const conv = db.conversations.find((c) => c.id === req.params.id);
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });

    if (userId && !conv.participantIds.includes(userId)) {
      return res.status(403).json({ error: 'Access denied: You are not a participant in this conversation' });
    }

    const messages = db.messages.filter((m) => m.conversationId === req.params.id);
    messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    // Mark as read for this user
    if (userId) {
      let markedAny = false;
      messages.forEach((m) => {
        if (m.senderId !== userId && !m.read) {
          m.read = true;
          markedAny = true;
        }
      });
      if (conv.unreadCount && conv.unreadCount[userId]) {
        conv.unreadCount[userId] = 0;
        markedAny = true;
      }
      if (markedAny) saveDatabase();
    }

    return res.json(messages);
  });

  app.post('/api/conversations/start', (req: Request, res: Response) => {
    const { userId, targetUserId } = req.body;
    if (!userId || !targetUserId) return res.status(400).json({ error: 'Participants required' });

    let conv = db.conversations.find(
      (c) =>
        c.participantIds.length === 2 &&
        c.participantIds.includes(userId) &&
        c.participantIds.includes(targetUserId)
    );

    if (!conv) {
      conv = {
        id: 'conv_' + crypto.randomUUID().slice(0, 8),
        participantIds: [userId, targetUserId],
        lastMessage: 'Conversation started',
        lastMessageTime: new Date().toISOString(),
        lastSenderId: userId,
        unreadCount: { [userId]: 0, [targetUserId]: 0 },
        updatedAt: new Date().toISOString(),
      };
      db.conversations.unshift(conv);
      saveDatabase();
    }

    return res.json(conv);
  });

  app.post('/api/conversations/:id/messages', (req: Request, res: Response) => {
    const { senderId, text, mediaUrl } = req.body;
    const conv = db.conversations.find((c) => c.id === req.params.id);
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });

    if (!conv.participantIds.includes(senderId)) {
      return res.status(403).json({ error: 'You are not a participant in this conversation' });
    }

    const sender = db.users.find((u) => u.id === senderId);
    if (!sender) return res.status(400).json({ error: 'Sender not found' });

    if (!text && !mediaUrl) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const newMessage = {
      id: 'msg_' + crypto.randomUUID().slice(0, 8),
      conversationId: conv.id,
      senderId,
      senderName: sender.name,
      senderAvatar: sender.avatar,
      text: text ? text.trim() : (mediaUrl ? 'Sent a photo' : ''),
      mediaUrl: mediaUrl || undefined,
      createdAt: new Date().toISOString(),
      read: false,
    };

    db.messages.push(newMessage);

    // Update conversation metadata
    conv.lastMessage = newMessage.text;
    conv.lastMessageTime = newMessage.createdAt;
    conv.lastSenderId = senderId;
    conv.updatedAt = newMessage.createdAt;

    // Increment unread count for recipients
    conv.participantIds.forEach((pid) => {
      if (pid !== senderId) {
        conv.unreadCount[pid] = (conv.unreadCount[pid] || 0) + 1;

        // Push real-time event to recipient
        broadcastToUser(pid, 'new_message', { conversationId: conv.id, message: newMessage });

        // Add a notification
        const notif = {
          id: 'notif_' + crypto.randomUUID().slice(0, 8),
          recipientId: pid,
          senderId,
          senderName: sender.name,
          senderAvatar: sender.avatar,
          type: 'message' as const,
          targetId: conv.id,
          text: `sent you a message: "${newMessage.text.slice(0, 30)}..."`,
          read: false,
          createdAt: newMessage.createdAt,
        };
        db.notifications.unshift(notif);
        broadcastToUser(pid, 'notification_created', notif);
      }
    });

    saveDatabase();
    return res.status(201).json(newMessage);
  });

  // --- NOTIFICATIONS ENDPOINTS ---
  app.get('/api/notifications', (req: Request, res: Response) => {
    const userId = req.query.userId as string;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const list = db.notifications.filter((n) => n.recipientId === userId);
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return res.json(list);
  });

  app.put('/api/notifications/read', (req: Request, res: Response) => {
    const { userId, notificationId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    if (notificationId) {
      const notif = db.notifications.find((n) => n.id === notificationId && n.recipientId === userId);
      if (notif) notif.read = true;
    } else {
      // Mark all read
      db.notifications.forEach((n) => {
        if (n.recipientId === userId) n.read = true;
      });
    }

    saveDatabase();
    return res.json({ success: true });
  });

  // --- SEARCH ENDPOINT ---
  app.get('/api/search', (req: Request, res: Response) => {
    const q = ((req.query.q as string) || '').toLowerCase().trim();
    if (!q) {
      return res.json({ users: [], posts: [], videos: [] });
    }

    const matchedUsers = db.users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        (u.bio && u.bio.toLowerCase().includes(q))
    );

    const matchedPosts = db.posts.filter((p) => p.content.toLowerCase().includes(q));
    const matchedVideos = db.posts.filter((p) => p.mediaType === 'video' && p.content.toLowerCase().includes(q));

    return res.json({
      users: matchedUsers,
      posts: matchedPosts,
      videos: matchedVideos,
    });
  });

  // Mount Vite development middlewares or static files for production
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LLite full-stack social network server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start LLite server:', err);
});
