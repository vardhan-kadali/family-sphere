
export enum UserRole {
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  MEMBER = 'MEMBER'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  profileImage?: string;
  coverImage?: string;
  relationship?: string;
  bio?: string;
  birthday?: string;
  createdAt: string;
}

export type ReactionType = 'LIKE' | 'HEART' | 'LAUGH' | 'WOW' | 'SAD';

export interface Reaction {
  userId: string;
  type: ReactionType;
}

export interface Post {
  id: string;
  userId: string;
  groupId?: string;
  authorName: string;
  authorImage?: string;
  content: string;
  imageUrl?: string;
  reactions: Reaction[];
  commentCount: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  authorName: string;
  authorImage?: string;
  content: string;
  replies?: Comment[];
  createdAt: string;
}

export interface FamilyGroup {
  id: string;
  name: string;
  description: string;
  icon: string;
  memberCount: number;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface FamilyEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'BIRTHDAY' | 'ANNIVERSARY' | 'TRIP' | 'GATHERING';
  createdBy: string;
  rsvps: string[]; // User IDs
}

export interface Notification {
  id: string;
  userId: string;
  fromName: string;
  type: 'LIKE' | 'COMMENT' | 'MESSAGE' | 'EVENT';
  content: string;
  read: boolean;
  createdAt: string;
}

export interface FamilyStory {
  id: string;
  userId: string;
  userName: string;
  userImage: string;
  imageUrl: string;
  createdAt: string;
}

// Fix: Add Album interface for gallery view
export interface Album {
  id: string;
  name: string;
  description: string;
  coverImage: string;
}
