
import React, { useState, useEffect, useRef } from 'react';
import { LogOut, Sun, Moon, Bell, Search, Heart, ShieldCheck, ChevronDown, User as UserIcon, Calendar, Check, MessageSquare, Sparkles, Clock } from 'lucide-react';
import { MAIN_NAV, QUICK_LINKS } from '../constants';
import { User, UserRole, Notification } from '../types';
import { db } from '../services/mockDb';

interface LayoutProps {
  user: User | null;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, activeTab, setActiveTab, children }) => {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const groups = db.getGroups();
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    if (user) {
      setNotifications(db.getNotifications(user.id));
    }
    
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [user]);

  const toggleNotifications = () => {
    if (!showNotifications && user) {
      // Mark as read when opening
      db.markNotificationsRead(user.id);
      setNotifications(db.getNotifications(user.id));
    }
    setShowNotifications(!showNotifications);
  };

  const handleClearNotifications = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (user) {
      db.clearNotifications(user.id);
      setNotifications([]);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-500">
      {/* Top Navbar */}
      <header className="h-20 sticky top-0 z-[60] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <div 
            onClick={() => setActiveTab('home')}
            className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200 dark:shadow-none cursor-pointer transform hover:rotate-6 active:scale-95 transition-all"
          >
            <Heart size={26} fill="currentColor" />
          </div>
          <div className="relative hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search history..." 
              className="bg-slate-100 dark:bg-slate-800 border-none rounded-2xl py-3 pl-12 pr-6 text-sm w-72 focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none font-medium"
            />
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl shadow-inner">
          {MAIN_NAV.map(item => (
            <button
              key={item.path}
              onClick={() => setActiveTab(item.path)}
              className={`px-6 py-2.5 rounded-xl flex items-center gap-2 font-bold text-sm transition-all ${activeTab === item.path ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              {item.icon}
              <span className="hidden xl:inline">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button 
            onClick={() => setIsDark(!isDark)} 
            className={`w-11 h-11 flex items-center justify-center rounded-2xl transition-all relative overflow-hidden group ${isDark ? 'bg-slate-800 text-amber-400' : 'bg-indigo-50 text-indigo-600'}`}
          >
            <div className={`transition-transform duration-500 ${isDark ? 'rotate-0' : 'rotate-90'}`}>
              {isDark ? <Moon size={22} fill="currentColor" /> : <Sun size={22} fill="currentColor" />}
            </div>
            <div className="absolute inset-0 bg-current opacity-0 group-hover:opacity-10 transition-opacity" />
          </button>
          
          {/* Notifications Toggle */}
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={toggleNotifications}
              className={`w-11 h-11 flex items-center justify-center rounded-2xl transition-all relative ${showNotifications ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              <Bell size={22} className={unreadCount > 0 ? "animate-[wiggle_1s_ease-in-out_infinite]" : ""} />
              {unreadCount > 0 && (
                <>
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center z-10">
                    {unreadCount}
                  </span>
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full animate-ping opacity-75" />
                </>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-4 w-85 bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200 ring-4 ring-slate-100/50 dark:ring-slate-800/50">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-indigo-600" />
                    <h4 className="font-black text-xs uppercase tracking-[0.2em] dark:text-white">Family Updates</h4>
                  </div>
                  <button 
                    onClick={handleClearNotifications}
                    className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors"
                  >
                    Dismiss All
                  </button>
                </div>
                <div className="max-h-[420px] overflow-y-auto no-scrollbar">
                  {notifications.length > 0 ? notifications.map(notif => (
                    <div key={notif.id} className={`p-5 border-b border-slate-50 dark:border-slate-800 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors cursor-pointer relative group ${!notif.read ? 'bg-indigo-50/10' : ''}`}>
                      <div className="flex gap-4">
                        <div className={`w-12 h-12 rounded-[1.2rem] flex-shrink-0 flex items-center justify-center shadow-sm ${notif.type === 'LIKE' ? 'bg-rose-100 text-rose-600' : notif.type === 'EVENT' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}>
                           {notif.type === 'LIKE' ? <Heart size={20} fill="currentColor" /> : notif.type === 'EVENT' ? <Calendar size={20} /> : <MessageSquare size={20} />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium dark:text-slate-200 leading-snug">
                            <span className="font-black text-slate-900 dark:text-white">{notif.fromName}</span> {notif.content}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            {/* Fixed: Clock component used on line 155 is now properly imported */}
                            <Clock size={12} className="text-slate-400" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        {!notif.read && (
                          <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2" />
                        )}
                      </div>
                    </div>
                  )) : (
                    <div className="p-16 text-center">
                      <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bell size={24} className="text-slate-300" />
                      </div>
                      <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">All Caught Up</p>
                      <p className="text-[10px] text-slate-300 uppercase mt-2 font-bold">No new family activity</p>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => { setActiveTab('home'); setShowNotifications(false); }}
                  className="w-full p-5 bg-slate-50 dark:bg-slate-800/50 text-center text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] hover:bg-indigo-600 hover:text-white transition-all"
                >
                  Return to Sphere
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pl-2 cursor-pointer group border-l border-slate-200 dark:border-slate-800" onClick={() => setActiveTab('settings')}>
            <div className="relative">
              <img src={user?.profileImage} className="w-10 h-10 rounded-[0.9rem] object-cover ring-2 ring-transparent group-hover:ring-indigo-500 transition-all shadow-sm" alt="user" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
            </div>
            <div className="hidden lg:block text-left leading-none">
              <p className="font-black text-sm dark:text-white group-hover:text-indigo-600 transition-colors">{user?.name?.split(' ')[0]}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">{user?.relationship}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[280px_1fr_320px] gap-8 px-6 py-8">
        {/* Left Sidebar */}
        <aside className="hidden lg:block space-y-8">
          <div className="space-y-1">
            {QUICK_LINKS.map(item => (
              <button 
                key={item.label}
                onClick={() => setActiveTab(item.path)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-bold ${activeTab === item.path ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 dark:shadow-none' : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900'}`}
              >
                <div className={`w-10 h-10 flex items-center justify-center rounded-xl shadow-sm ${activeTab === item.path ? 'bg-white/20' : 'bg-white dark:bg-slate-800'}`}>
                  {item.icon}
                </div>
                {item.label}
              </button>
            ))}
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 px-4">Heritage Circles</h5>
            <div className="space-y-1">
              {groups.map(group => (
                <button key={group.id} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white dark:hover:bg-slate-900 transition-all text-left group">
                  <div className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-2xl group-hover:scale-110 transition-transform">{group.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-800 dark:text-white truncate">{group.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{group.memberCount} active</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={onLogout} 
            className="w-full mt-10 p-5 border-2 border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-[0.3em] text-slate-400 hover:text-rose-600 hover:border-rose-100 transition-all"
          >
            <LogOut size={16} /> Exit Sphere
          </button>
        </aside>

        {/* Content */}
        <main className="min-w-0">
          {children}
        </main>

        {/* Right Sidebar */}
        <aside className="hidden xl:block space-y-8">
          <div className="bg-indigo-600 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
             <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <Heart size={20} fill="currentColor" className="animate-pulse" />
                  <h4 className="font-black text-[10px] uppercase tracking-[0.3em] opacity-80">Next Milestone</h4>
                </div>
                <h3 className="text-3xl font-black mb-3 leading-tight tracking-tighter">Legacy Brunch</h3>
                <p className="text-sm font-medium opacity-80 mb-8 leading-relaxed">Let's coordinate the menu! Sarah is bringing her famous quiche.</p>
                <button className="w-full py-5 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all">
                  Join Chat
                </button>
             </div>
             <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-8">
              <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-[0.3em]">Heritage Vault</h4>
              <button onClick={() => setActiveTab('directory')} className="text-[9px] font-black text-indigo-600 uppercase hover:underline">View All</button>
            </div>
            <div className="space-y-6">
              {db.getUsers().slice(0, 4).map(u => (
                <div key={u.id} className="flex items-center gap-4 group cursor-pointer">
                  <div className="relative">
                    <img src={u.profileImage} className="w-12 h-12 rounded-[1.1rem] object-cover ring-2 ring-slate-100 dark:ring-slate-800 group-hover:ring-indigo-500 transition-all shadow-sm" alt="member" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                  </div>
                  <div>
                    <p className="text-sm font-black dark:text-white leading-tight group-hover:text-indigo-600 transition-colors">{u.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{u.relationship}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-center p-10 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800">
            <ShieldCheck size={36} className="mx-auto text-indigo-400 mb-5" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] leading-relaxed">
              Sphere is 100% Private.<br />Legacy Encrypted.
            </p>
          </div>
        </aside>
      </div>

      <style>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-10deg); }
          75% { transform: rotate(10deg); }
        }
      `}</style>

      {/* Mobile Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-8 flex justify-between items-center z-[100]">
         {MAIN_NAV.map(item => (
           <button
             key={item.path}
             onClick={() => setActiveTab(item.path)}
             className={`flex flex-col items-center gap-1 transition-all ${activeTab === item.path ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}
           >
             {item.icon}
           </button>
         ))}
      </nav>
    </div>
  );
};

export default Layout;
