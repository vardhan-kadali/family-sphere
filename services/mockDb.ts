
import { User, UserRole, Post, Comment, FamilyEvent, DirectMessage, FamilyStory, FamilyGroup, Notification, Reaction, Album } from '../types';

const STORAGE_KEY = 'familysphere_db';

interface DbSchema {
  users: User[];
  posts: Post[];
  comments: Comment[];
  events: FamilyEvent[];
  messages: DirectMessage[];
  stories: FamilyStory[];
  notifications: Notification[];
  groups: FamilyGroup[];
  albums: Album[];
}

export const AI_HISTORIAN_ID = 'ai-historian-system';

const DEFAULT_USERS: User[] = [
  {
    id: AI_HISTORIAN_ID,
    name: 'AI Historian',
    email: 'historian@familysphere.system',
    role: UserRole.ADMIN,
    relationship: 'Family Guardian',
    bio: 'I am the keeper of your family legacy. Ask me about your shared history, milestones, or for a trip down memory lane.',
    profileImage: 'https://cdn-icons-png.flaticon.com/512/2103/2103633.png',
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_DB: DbSchema = {
  users: DEFAULT_USERS,
  posts: [],
  comments: [],
  events: [],
  messages: [],
  stories: [],
  notifications: [
    { id: 'n1', userId: '', fromName: 'Aunt Sarah', type: 'LIKE', content: 'loved your latest memory!', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
    { id: 'n2', userId: '', fromName: 'Cousin Mike', type: 'MESSAGE', content: 'sent you a private legacy chat.', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
    { id: 'n3', userId: '', fromName: 'Grandma', type: 'EVENT', content: 'added a new gathering: Sunday Brunch.', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() }
  ],
  groups: [
    { id: '1', name: 'Parents Circle', description: 'Logistics and planning for the heads of house.', icon: '🏠', memberCount: 2 },
    { id: '2', name: 'Grandkids Corner', description: 'Memories and updates from the younger ones.', icon: '🎨', memberCount: 5 },
    { id: '3', name: 'Travel Buffs', description: 'Coordinating the next big family trip.', icon: '✈️', memberCount: 8 }
  ],
  albums: [
    { id: '1', name: 'Summer 2024', description: 'Memories from our trip to Italy.', coverImage: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800' },
    { id: '2', name: 'Holiday Season', description: 'Winter holidays with the whole family.', coverImage: 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=800' }
  ]
};

class MockDb {
  private getDb(): DbSchema {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      this.saveDb(DEFAULT_DB);
      return DEFAULT_DB;
    }
    const parsed = JSON.parse(data);
    if (!parsed.users.find((u: User) => u.id === AI_HISTORIAN_ID)) {
      parsed.users.unshift(DEFAULT_USERS[0]);
    }
    return parsed;
  }

  private saveDb(db: DbSchema) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }

  getUsers() { return this.getDb().users; }
  addUser(user: User) {
    const db = this.getDb();
    if (db.users.length === 1 && db.users[0].id === AI_HISTORIAN_ID) user.role = UserRole.ADMIN;
    db.users.push(user);
    this.saveDb(db);
    return user;
  }
  updateUser(id: string, updates: Partial<User>) {
    const db = this.getDb();
    db.users = db.users.map(u => u.id === id ? { ...u, ...updates } : u);
    this.saveDb(db);
    return db.users.find(u => u.id === id);
  }

  getPosts() { return this.getDb().posts.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); }
  addPost(post: Post) {
    const db = this.getDb();
    db.posts.unshift(post);
    this.saveDb(db);
    return post;
  }
  updatePostReaction(postId: string, userId: string, reactionType: any) {
    const db = this.getDb();
    db.posts = db.posts.map(p => {
      if (p.id !== postId) return p;
      const filtered = p.reactions.filter(r => r.userId !== userId);
      return { ...p, reactions: [...filtered, { userId, type: reactionType }] };
    });
    this.saveDb(db);
  }

  addComment(comment: Comment) {
    const db = this.getDb();
    db.comments.push(comment);
    const post = db.posts.find(p => p.id === comment.postId);
    if (post) post.commentCount++;
    this.saveDb(db);
    return comment;
  }
  getComments(postId: string) { return this.getDb().comments.filter(c => c.postId === postId); }

  getGroups() { return this.getDb().groups; }
  getAlbums() { return this.getDb().albums; }
  addAlbum(album: Album) {
    const db = this.getDb();
    db.albums.unshift(album);
    this.saveDb(db);
    return album;
  }

  getMessages(u1: string, u2: string) {
    return this.getDb().messages.filter(m => (m.senderId === u1 && m.receiverId === u2) || (m.senderId === u2 && m.receiverId === u1));
  }
  sendMessage(msg: DirectMessage) {
    const db = this.getDb();
    db.messages.push(msg);
    this.saveDb(db);
    return msg;
  }

  getStories() { return this.getDb().stories; }
  addStory(story: FamilyStory) {
    const db = this.getDb();
    db.stories.unshift(story);
    this.saveDb(db);
    return story;
  }

  getEvents() { return this.getDb().events; }
  addEvent(event: FamilyEvent) {
    const db = this.getDb();
    db.events.push(event);
    this.saveDb(db);
    return event;
  }

  getNotifications(userId: string) { 
    const db = this.getDb();
    return db.notifications.filter(n => !n.userId || n.userId === userId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  markNotificationsRead(userId: string) {
    const db = this.getDb();
    db.notifications = db.notifications.map(n => (!n.userId || n.userId === userId) ? { ...n, read: true } : n);
    this.saveDb(db);
  }

  clearNotifications(userId: string) {
    const db = this.getDb();
    db.notifications = db.notifications.filter(n => n.userId && n.userId !== userId);
    this.saveDb(db);
  }

  addNotification(notif: Notification) {
    const db = this.getDb();
    db.notifications.unshift(notif);
    this.saveDb(db);
  }
}

export const db = new MockDb();
