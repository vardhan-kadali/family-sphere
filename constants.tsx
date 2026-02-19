
import React from 'react';
import { 
  Home, 
  Users, 
  Image, 
  Calendar, 
  Settings, 
  ShieldCheck, 
  MessageCircle,
  LayoutGrid,
  Heart,
  Bell,
  Search,
  User
} from 'lucide-react';

export const APP_NAME = "FamilySphere";

export const MAIN_NAV = [
  { label: 'Feed', icon: <LayoutGrid size={22} />, path: 'home' },
  { label: 'Messages', icon: <MessageCircle size={22} />, path: 'chat' },
  { label: 'Albums', icon: <Image size={22} />, path: 'gallery' },
  { label: 'Calendar', icon: <Calendar size={22} />, path: 'events' },
  { label: 'Directory', icon: <Users size={22} />, path: 'directory' },
];

export const QUICK_LINKS = [
  { label: 'Birthdays', icon: <Heart size={18} className="text-rose-500" />, path: 'events' },
  { label: 'Notifications', icon: <Bell size={18} className="text-amber-500" />, path: 'home' },
  { label: 'My Profile', icon: <User size={18} className="text-indigo-500" />, path: 'settings' },
];
