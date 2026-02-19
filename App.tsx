
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Messages from './components/Messages';
import AdminPanel from './components/AdminPanel';
import { User as UserType, UserRole, FamilyEvent, Album } from './types';
import { db } from './services/mockDb';
import { 
  ShieldCheck, Heart, Eye, EyeOff, ChevronRight, Search, 
  Camera, Users, Calendar, Sparkles, Image as ImageIcon,
  MapPin, Star, LogOut, X, Clock, Plus, ChevronDown, Bell
} from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isLoginView, setIsLoginView] = useState(true);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  
  // Auth States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Settings/Search States
  const [profileUpdates, setProfileUpdates] = useState({ name: '', bio: '', relationship: '', profileImage: '' });
  const [memberSearch, setMemberSearch] = useState('');

  // Creation Modals
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    type: 'GATHERING' as FamilyEvent['type']
  });

  const [albumForm, setAlbumForm] = useState({
    name: '',
    description: '',
    coverImage: ''
  });

  useEffect(() => {
    const appName = "FamilyConnect";
    if (!user) {
      document.title = `${appName} | Secure Entry`;
    } else {
      const tabName = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
      document.title = `${appName} | ${tabName}`;
    }
  }, [activeTab, user]);

  useEffect(() => {
    const savedUser = localStorage.getItem('fs_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setProfileUpdates({ 
        name: parsed.name, 
        bio: parsed.bio || '', 
        relationship: parsed.relationship || '', 
        profileImage: parsed.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(parsed.name)}&background=6366f1&color=fff&size=512`
      });
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const users = db.getUsers();
    const found = users.find(u => u.email.trim().toLowerCase() === email.trim().toLowerCase());
    const isValidPassword = found && (found.password ? password === found.password : password === 'password');
    
    if (found && isValidPassword) {
      setUser(found);
      localStorage.setItem('fs_user', JSON.stringify(found));
      setProfileUpdates({ 
        name: found.name, 
        bio: found.bio || '', 
        relationship: found.relationship || '', 
        profileImage: found.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(found.name)}&background=6366f1&color=fff&size=512` 
      });
      setError('');
    } else {
      setError('Member credentials not verified.');
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    const existing = db.getUsers().find(u => u.email.trim().toLowerCase() === email.trim().toLowerCase());
    if (existing) { setError('Email already registered!'); return; }

    const newUser: UserType = {
      id: Math.random().toString(36).substr(2, 9),
      name, email, password, 
      role: db.getUsers().length <= 1 ? UserRole.ADMIN : UserRole.MEMBER,
      relationship: relationship || 'Family Member',
      bio: `I'm new to our private sphere!`,
      createdAt: new Date().toISOString(),
      profileImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=512`
    };
    db.addUser(newUser);
    setUser(newUser);
    localStorage.setItem('fs_user', JSON.stringify(newUser));
    setProfileUpdates({ 
      name: newUser.name, 
      bio: newUser.bio || '', 
      relationship: newUser.relationship || '', 
      profileImage: newUser.profileImage 
    });
    setError('');
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const updated = db.updateUser(user.id, profileUpdates);
    if (updated) {
      setUser(updated);
      localStorage.setItem('fs_user', JSON.stringify(updated));
      alert('Vault identity updated.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('fs_user');
    setActiveTab('home');
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const newEvent: FamilyEvent = {
      id: Math.random().toString(36).substr(2, 9),
      title: eventForm.title,
      description: eventForm.description,
      date: eventForm.date,
      type: eventForm.type,
      createdBy: user.id,
      rsvps: [user.id]
    };
    db.addEvent(newEvent);
    setShowEventModal(false);
    setEventForm({ title: '', description: '', date: '', type: 'GATHERING' });
  };

  const handleCreateAlbum = (e: React.FormEvent) => {
    e.preventDefault();
    const newAlbum: Album = {
      id: Math.random().toString(36).substr(2, 9),
      name: albumForm.name,
      description: albumForm.description,
      coverImage: albumForm.coverImage || 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800'
    };
    db.addAlbum(newAlbum);
    setShowAlbumModal(false);
    setAlbumForm({ name: '', description: '', coverImage: '' });
  };

  const navigateToChat = (contactId: string) => {
    setSelectedContactId(contactId);
    setActiveTab('chat');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col lg:flex-row overflow-hidden">
        <div className="hidden lg:flex lg:w-1/2 bg-indigo-700 p-24 flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600 rounded-full blur-[140px] -mr-64 -mt-64 opacity-50"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-24">
               <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-700 shadow-2xl transform rotate-6">
                 <Heart size={32} fill="currentColor" />
               </div>
               <h1 className="text-4xl font-black text-white tracking-tighter uppercase">FamilyConnect</h1>
            </div>
            <h2 className="text-8xl font-black text-white leading-[0.95] tracking-tighter mb-12">
              Our Legacy.<br />
              Our Private<br />
              <span className="text-indigo-200">Sphere.</span>
            </h2>
          </div>
          <div className="relative z-10 flex items-center gap-6">
             <div className="flex -space-x-4">
               {[1,2,3,4].map(i => <img key={i} className="w-14 h-14 rounded-full border-4 border-indigo-700 shadow-xl" src={`https://i.pravatar.cc/100?img=${i+30}`} alt="avatar" />)}
             </div>
             <p className="uppercase tracking-[0.4em] text-[10px] font-black text-indigo-200">Encrypted Family Network</p>
          </div>
        </div>
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-24 bg-slate-50">
          <div className="w-full max-w-md space-y-12">
            <div className="space-y-4">
              <h3 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">{isLoginView ? 'Welcome Back' : 'Join Sphere'}</h3>
              <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[11px]">{isLoginView ? 'Access your private family home' : 'Start your family journey today'}</p>
            </div>
            <div className="flex bg-slate-200/50 p-1.5 rounded-[2rem]">
              <button onClick={() => setIsLoginView(true)} className={`flex-1 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all ${isLoginView ? 'bg-white shadow-xl text-indigo-700' : 'text-slate-400'}`}>Sign In</button>
              <button onClick={() => setIsLoginView(false)} className={`flex-1 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all ${!isLoginView ? 'bg-white shadow-xl text-indigo-700' : 'text-slate-400'}`}>Sign Up</button>
            </div>
            <form onSubmit={isLoginView ? handleLogin : handleSignup} className="space-y-8">
              {!isLoginView && (
                <div className="space-y-8 animate-in fade-in slide-in-from-top-4">
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white border-2 border-slate-100 rounded-[1.8rem] py-5 px-8 text-slate-800 font-bold outline-none focus:border-indigo-500 shadow-sm transition-all" placeholder="Full Name" required />
                  <input type="text" value={relationship} onChange={(e) => setRelationship(e.target.value)} className="w-full bg-white border-2 border-slate-100 rounded-[1.8rem] py-5 px-8 text-slate-800 font-bold outline-none focus:border-indigo-500 shadow-sm transition-all" placeholder="Role (e.g. Eldest Son)" required />
                </div>
              )}
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white border-2 border-slate-100 rounded-[1.8rem] py-5 px-8 text-slate-800 font-bold outline-none focus:border-indigo-500 shadow-sm transition-all" placeholder="Family Email" required />
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white border-2 border-slate-100 rounded-[1.8rem] py-5 px-8 text-slate-800 font-bold outline-none focus:border-indigo-500 shadow-sm transition-all" placeholder="Vault Key" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-700 transition-colors">
                  {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>
              {error && <div className="bg-rose-50 text-rose-600 p-5 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest text-center border-2 border-rose-100 animate-pulse">{error}</div>}
              <button type="submit" className="w-full bg-indigo-700 text-white py-7 rounded-[2.5rem] font-black text-lg uppercase tracking-[0.2em] hover:bg-indigo-800 shadow-2xl active:scale-95 transition-all">
                {isLoginView ? 'Open Vault' : 'Initialize Circle'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout user={user} onLogout={handleLogout} activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
        {activeTab === 'home' && <Dashboard user={user} onNavigateToGallery={() => setActiveTab('gallery')} onNavigateToChat={navigateToChat} />}
        {activeTab === 'chat' && <Messages currentUser={user} initialContactId={selectedContactId} />}
        
        {activeTab === 'gallery' && (
          <div className="space-y-12 pb-20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Archives</h2>
                <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[11px] mt-3">Visual soul of our family heritage</p>
              </div>
              <button onClick={() => setShowAlbumModal(true)} className="bg-indigo-600 text-white px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2">
                <Plus size={20} /> New Vault
              </button>
            </div>
            {showAlbumModal && (
              <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 sm:p-12 backdrop-blur-md">
                <div className="absolute inset-0 bg-slate-900/40" onClick={() => setShowAlbumModal(false)} />
                <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl p-12 overflow-hidden animate-in zoom-in-95">
                  <h3 className="text-3xl font-black dark:text-white mb-8 tracking-tighter uppercase">Curate Heritage</h3>
                  <form onSubmit={handleCreateAlbum} className="space-y-6">
                    <input required value={albumForm.name} onChange={e => setAlbumForm({...albumForm, name: e.target.value})} placeholder="Archive Name" className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-5 font-bold outline-none border-2 border-transparent focus:border-indigo-600 dark:text-white" />
                    <textarea value={albumForm.description} onChange={e => setAlbumForm({...albumForm, description: e.target.value})} placeholder="The Story behind this collection..." className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-5 font-bold outline-none border-2 border-transparent focus:border-indigo-600 dark:text-white min-h-[120px]" />
                    <input value={albumForm.coverImage} onChange={e => setAlbumForm({...albumForm, coverImage: e.target.value})} placeholder="Cover Image URL" className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-5 font-bold outline-none border-2 border-transparent focus:border-indigo-600 dark:text-white" />
                    <button type="submit" className="w-full bg-indigo-600 text-white py-6 rounded-[2.5rem] font-black text-lg uppercase tracking-widest shadow-xl">Secure Archive</button>
                  </form>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12">
              {db.getAlbums().map(album => (
                <div key={album.id} className="bg-white dark:bg-slate-900 rounded-[4rem] overflow-hidden shadow-2xl group cursor-pointer relative border border-slate-50 dark:border-slate-800 hover:-translate-y-2 transition-all duration-500">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img src={album.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="album" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent p-10 flex flex-col justify-end">
                      <h3 className="text-4xl font-black text-white tracking-tight leading-none mb-4">{album.name}</h3>
                      <p className="text-slate-200 text-sm font-medium line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">{album.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'events' && (
           <div className="space-y-16 pb-40">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-full border border-indigo-100 dark:border-indigo-800">
                    <Sparkles size={14} className="text-indigo-600" />
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Family Milestones</span>
                  </div>
                  <h2 className="text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Gatherings</h2>
                  <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[11px] max-w-lg leading-relaxed">Birthdays, reunions, and celebrations curated for our history.</p>
                </div>
                <button onClick={() => setShowEventModal(true)} className="bg-indigo-600 text-white px-12 py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-widest shadow-3xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-3">
                   <Plus size={20} /> Host Gathering
                </button>
              </div>

              {showEventModal && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 backdrop-blur-2xl">
                  <div className="absolute inset-0 bg-slate-900/60" onClick={() => setShowEventModal(false)} />
                  <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[4rem] shadow-3xl p-14 overflow-hidden animate-in zoom-in-95">
                       <h3 className="text-4xl font-black dark:text-white mb-10 tracking-tighter uppercase">Plan Milestone</h3>
                       <form onSubmit={handleCreateEvent} className="space-y-8">
                         <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Gathering Name</label>
                           <input required type="text" value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} placeholder="e.g. Grandma's 80th" className="w-full bg-slate-50 dark:bg-slate-800 rounded-3xl p-6 font-bold outline-none border-2 border-transparent focus:border-indigo-700 dark:text-white transition-all" />
                         </div>
                         <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Date</label>
                              <input required type="date" value={eventForm.date} onChange={e => setEventForm({...eventForm, date: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-3xl p-6 font-bold outline-none border-2 border-transparent focus:border-indigo-700 dark:text-white transition-all" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Category</label>
                              <select value={eventForm.type} onChange={e => setEventForm({...eventForm, type: e.target.value as any})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-3xl p-6 font-bold outline-none border-2 border-transparent focus:border-indigo-700 dark:text-white transition-all">
                                 <option value="GATHERING">Family Gathering</option>
                                 <option value="BIRTHDAY">Birthday Celebration</option>
                                 <option value="ANNIVERSARY">Legacy Anniversary</option>
                                 <option value="TRIP">Family Expedition</option>
                              </select>
                            </div>
                         </div>
                         <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Details & Notes</label>
                           <textarea value={eventForm.description} onChange={e => setEventForm({...eventForm, description: e.target.value})} placeholder="Location, menu, or dress code..." className="w-full bg-slate-50 dark:bg-slate-800 rounded-3xl p-8 font-bold outline-none border-2 border-transparent focus:border-indigo-700 dark:text-white min-h-[160px] transition-all" />
                         </div>
                         <button type="submit" className="w-full bg-indigo-700 text-white py-8 rounded-[3rem] font-black text-xl uppercase tracking-widest shadow-2xl hover:bg-indigo-800 active:scale-95 transition-all">Finalize Gathering</button>
                       </form>
                  </div>
                </div>
              )}

              <div className="relative pl-14 space-y-32 border-l-8 border-slate-100 dark:border-slate-800/50">
                {db.getEvents().length > 0 ? db.getEvents().map((ev, i) => (
                  <div key={ev.id} className="relative group">
                    {/* Timeline Dot/Marker */}
                    <div className="absolute -left-[70px] top-12 w-14 h-14 rounded-3xl bg-white dark:bg-slate-900 border-8 border-indigo-600 shadow-2xl flex items-center justify-center text-indigo-600 z-10 transition-transform group-hover:scale-110">
                       <Calendar size={22} />
                    </div>
                    
                    <div className="flex flex-col xl:flex-row gap-14 bg-white dark:bg-slate-900 rounded-[4.5rem] p-14 border border-slate-50 dark:border-slate-800 shadow-3xl group-hover:shadow-indigo-500/10 dark:group-hover:shadow-indigo-500/5 transition-all duration-700 overflow-hidden relative">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <div className="xl:w-72 flex flex-col justify-center text-center xl:text-left border-b xl:border-b-0 xl:border-r border-slate-100 dark:border-slate-800 pb-10 xl:pb-0 xl:pr-14">
                        <p className="text-sm font-black text-indigo-600 uppercase tracking-[0.4em] mb-4">{new Date(ev.date).toLocaleString('default', { month: 'long' })}</p>
                        <h4 className="text-[10rem] font-black dark:text-white leading-none tracking-tighter opacity-10 absolute -left-4 top-0 pointer-events-none select-none">
                          {new Date(ev.date).getDate()}
                        </h4>
                        <h4 className="text-9xl font-black dark:text-white leading-none tracking-tighter relative z-10">
                          {new Date(ev.date).getDate()}
                        </h4>
                        <p className="text-xl font-bold text-slate-400 mt-6 tracking-[0.3em] uppercase">{new Date(ev.date).getFullYear()}</p>
                      </div>

                      <div className="flex-1 space-y-8 py-6 relative z-10">
                        <div className="flex items-center gap-4">
                           <span className={`px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest shadow-sm ${ev.type === 'BIRTHDAY' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                             {ev.type.replace('_', ' ')}
                           </span>
                           <span className="text-slate-400 text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
                              <MapPin size={16} /> Heritage Estate
                           </span>
                        </div>
                        <h3 className="text-6xl font-black dark:text-white tracking-tighter leading-tight group-hover:text-indigo-600 transition-colors duration-500">{ev.title}</h3>
                        <p className="text-2xl font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-3xl">{ev.description}</p>
                        
                        <div className="pt-8 flex flex-wrap items-center gap-8">
                          <div className="flex items-center gap-4">
                            <div className="flex -space-x-4">
                               {ev.rsvps.slice(0, 4).map((r, i) => <img key={i} className="w-14 h-14 rounded-[1.2rem] border-4 border-white dark:border-slate-900 shadow-lg object-cover" src={`https://ui-avatars.com/api/?name=${i}&background=6366f1&color=fff`} />)}
                               {ev.rsvps.length > 4 && (
                                 <div className="w-14 h-14 rounded-[1.2rem] border-4 border-white dark:border-slate-900 bg-slate-900 text-white flex items-center justify-center text-xs font-black">+{ev.rsvps.length - 4}</div>
                               )}
                            </div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Attending</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-center xl:justify-end border-t xl:border-t-0 xl:border-l border-slate-100 dark:border-slate-800 pt-10 xl:pt-0 xl:pl-14">
                         <button className="px-12 py-6 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-[2.5rem] font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-indigo-200/20">
                           RSVP Verified
                         </button>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="py-64 text-center">
                     <div className="w-32 h-32 bg-slate-50 dark:bg-slate-900 rounded-[3rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
                        <Calendar size={64} className="text-slate-200 dark:text-slate-700" />
                     </div>
                     <p className="text-4xl font-black text-slate-300 dark:text-slate-700 tracking-tight">The Family Timeline is quiet.</p>
                     <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px] mt-4">Plant a seed for our next legacy milestone.</p>
                  </div>
                )}
              </div>
           </div>
        )}

        {activeTab === 'directory' && (
          <div className="space-y-12 pb-32">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <h2 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Heritage</h2>
                <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[11px] mt-4">Every branch of our family tree is essential.</p>
              </div>
              <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
                <input 
                  type="text" 
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Locate a family member..."
                  className="bg-white dark:bg-slate-900 border-none rounded-[2.5rem] py-6 pl-16 pr-10 shadow-2xl text-lg font-bold w-full md:w-[450px] outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-12">
               {db.getUsers().filter(u => u.name.toLowerCase().includes(memberSearch.toLowerCase())).map(u => (
                  <div key={u.id} className="bg-white dark:bg-slate-900 rounded-[4.5rem] p-12 shadow-2xl text-center group transition-all hover:-translate-y-3 relative overflow-hidden border border-slate-50 dark:border-slate-800">
                     <img src={u.profileImage} className="w-52 h-52 rounded-[4rem] object-cover mx-auto shadow-2xl mb-10 group-hover:scale-105 transition-transform" alt="profile" />
                     <h4 className="font-black text-4xl dark:text-white tracking-tight leading-tight">{u.name}</h4>
                     <p className="text-indigo-600 font-black text-xs uppercase tracking-[0.4em] mt-4">{u.relationship}</p>
                     <p className="text-slate-400 dark:text-slate-500 mt-8 text-lg font-medium leading-relaxed italic line-clamp-2">"{u.bio}"</p>
                  </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-4xl mx-auto space-y-16 pb-40">
            <h2 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Vault Identity</h2>
            <div className="space-y-12">
              <form onSubmit={handleUpdateProfile} className="bg-white dark:bg-slate-900 rounded-[4rem] p-16 shadow-2xl space-y-12 border border-slate-50 dark:border-slate-800">
                 <div className="flex items-center gap-12 pb-12 border-b border-slate-50 dark:border-slate-800">
                    <img src={profileUpdates.profileImage} className="w-44 h-44 rounded-[4rem] object-cover shadow-2xl border-8 border-indigo-50 dark:border-slate-800" alt="profile" />
                    <div>
                      <h3 className="text-5xl font-black dark:text-white tracking-tighter leading-none">{user.name}</h3>
                      <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs mt-4">Guard your family legacy profile.</p>
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-4">
                     <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block px-1">Heritage Name</label>
                     <input type="text" value={profileUpdates.name} onChange={(e) => setProfileUpdates({...profileUpdates, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-3xl p-6 font-bold outline-none border-2 border-transparent focus:border-indigo-700 dark:text-white" />
                   </div>
                   <div className="space-y-4">
                     <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block px-1">Family Status</label>
                     <input type="text" value={profileUpdates.relationship} onChange={(e) => setProfileUpdates({...profileUpdates, relationship: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-3xl p-6 font-bold outline-none border-2 border-transparent focus:border-indigo-700 dark:text-white" />
                   </div>
                 </div>
                 <div className="space-y-4">
                   <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block px-1">Family Bio</label>
                   <textarea value={profileUpdates.bio} onChange={(e) => setProfileUpdates({...profileUpdates, bio: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-3xl p-8 font-bold outline-none border-2 border-transparent focus:border-indigo-700 min-h-[180px] dark:text-white" placeholder="Tell our story..." />
                 </div>
                 <button type="submit" className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white py-8 rounded-[3rem] font-black text-xl uppercase tracking-widest shadow-2xl active:scale-95 transition-all">Update Identity</button>
              </form>
            </div>
          </div>
        )}
        {activeTab === 'admin' && user.role === UserRole.ADMIN && <AdminPanel />}
      </div>
    </Layout>
  );
};

export default App;
