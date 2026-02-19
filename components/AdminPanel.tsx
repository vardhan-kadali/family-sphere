
import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, Shield, User, Activity, BarChart, Database, Zap, TrendingUp, Users } from 'lucide-react';
import { db } from '../services/mockDb';
import { User as UserType, UserRole } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: UserRole.MEMBER });

  useEffect(() => {
    setUsers(db.getUsers());
  }, []);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const user: UserType = {
      id: Math.random().toString(36).substr(2, 9),
      ...newUser,
      createdAt: new Date().toISOString(),
      profileImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(newUser.name)}&background=random&size=512`,
      relationship: 'Family Member'
    };
    db.addUser(user);
    setUsers(db.getUsers());
    setNewUser({ name: '', email: '', role: UserRole.MEMBER });
  };

  const activityData = [
    { name: 'Mon', posts: 12 },
    { name: 'Tue', posts: 18 },
    { name: 'Wed', posts: 15 },
    { name: 'Thu', posts: 25 },
    { name: 'Fri', posts: 30 },
    { name: 'Sat', posts: 22 },
    { name: 'Sun', posts: 28 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex items-center justify-between bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Platform Control</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Global management for FamilySphere</p>
        </div>
        <div className="flex gap-4">
           <div className="text-right">
              <p className="text-slate-400 font-bold text-[10px] uppercase">Service Health</p>
              <p className="text-emerald-500 font-black flex items-center gap-1 justify-end"><Zap size={14} /> Optimal</p>
           </div>
        </div>
      </header>

      {/* Advanced Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Network Size', value: users.length, sub: '+2 this month', icon: <Users className="text-indigo-600" /> },
          { label: 'Daily Interactions', value: db.getPosts().length + db.getMessages('', '').length, sub: '85% positive', icon: <TrendingUp className="text-emerald-500" /> },
          { label: 'Event Success', value: db.getEvents().length, sub: '3 pending RSVP', icon: <Activity className="text-amber-500" /> },
          { label: 'Vault Storage', value: '1.2 GB', sub: 'Infinite capacity', icon: <Database className="text-rose-500" /> },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-50 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">{stat.icon}</div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </div>
            <p className="text-3xl font-black dark:text-white">{stat.value}</p>
            <p className="text-[10px] font-bold text-emerald-500 mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Creation */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm lg:col-span-1">
          <h3 className="font-black text-xl mb-6 dark:text-white flex items-center gap-2">
            <UserPlus size={22} className="text-indigo-600" /> Invite Member
          </h3>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Full Name</label>
              <input 
                required 
                type="text" 
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none" 
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Email Address</label>
              <input 
                required 
                type="email" 
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none" 
              />
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all">
              Grant Private Access
            </button>
          </form>
        </div>

        {/* Activity Chart */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm lg:col-span-2">
           <h3 className="font-black text-xl mb-6 dark:text-white">Engagement Analytics</h3>
           <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                  <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="posts" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorPosts)" />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
