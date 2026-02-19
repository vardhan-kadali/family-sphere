import React, { useEffect, useState } from 'react';
import { Sparkles, Camera, Bot, Heart, Plus, Share2, MessageCircle, Image as ImageIcon, Loader2 } from 'lucide-react';
import { db, AI_HISTORIAN_ID } from '../services/mockDb';
import { getFamilyDigest } from '../services/geminiService';
import { User, Post, FamilyStory } from '../types';
import CameraCapture from './CameraCapture';

interface DashboardProps {
  user: User | null;
  onNavigateToGallery: () => void;
  onNavigateToChat: (contactId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onNavigateToGallery, onNavigateToChat }) => {
  const [digest, setDigest] = useState<string>('');
  const [isDigestLoading, setIsDigestLoading] = useState<boolean>(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<FamilyStory[]>([]);
  const [quickPost, setQuickPost] = useState('');
  const [showCamera, setShowCamera] = useState(false);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    const allPosts = db.getPosts();
    setPosts(allPosts);
    setStories(db.getStories());

    if (allPosts.length > 0) {
      setIsDigestLoading(true);
      try {
        const summary = await getFamilyDigest(allPosts);
        setDigest(summary || "");
      } catch (err) {
        console.error("Failed to load AI digest", err);
      } finally {
        setIsDigestLoading(false);
      }
    } else {
      setDigest("The family sphere is waiting for its first memory. Share something special today!");
    }
  };

  const handlePost = (imgUrl?: string) => {
    if ((!quickPost.trim() && !imgUrl) || !user) return;
    const post: Post = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      authorName: user.name,
      authorImage: user.profileImage,
      content: quickPost || "Check out this family snapshot!",
      imageUrl: imgUrl,
      reactions: [],
      commentCount: 0,
      createdAt: new Date().toISOString()
    };
    db.addPost(post);
    setQuickPost('');
    refreshData();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {showCamera && (
        <CameraCapture 
          onCapture={(data) => { setShowCamera(false); handlePost(data); }} 
          onClose={() => setShowCamera(false)} 
        />
      )}

      {/* Stories */}
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
         <div 
           onClick={() => setShowCamera(true)}
           className="flex-shrink-0 w-32 h-52 bg-white dark:bg-slate-900 rounded-[1.5rem] relative overflow-hidden group cursor-pointer shadow-sm border border-slate-100 dark:border-slate-800"
         >
           <img src={user?.profileImage} className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-500" alt="profile" />
           <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col items-center justify-end p-4">
             <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white border-4 border-white dark:border-slate-900 mb-2 shadow-xl">
               <Plus size={20} />
             </div>
             <p className="text-[10px] font-black text-white uppercase tracking-widest">Your Story</p>
           </div>
         </div>
         {stories.map(story => (
           <div 
             key={story.id} 
             className="flex-shrink-0 w-32 h-52 rounded-[1.5rem] relative overflow-hidden cursor-pointer shadow-sm border-2 border-indigo-500 p-0.5"
           >
             <img src={story.imageUrl} className="w-full h-full object-cover rounded-[1.2rem]" alt="story" />
             <div className="absolute top-3 left-3 w-10 h-10 rounded-full border-2 border-indigo-500 overflow-hidden shadow-lg">
                <img src={story.userImage} className="w-full h-full object-cover" alt="author" />
             </div>
           </div>
         ))}
      </div>

      {/* Post Composer */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex gap-4 items-center mb-4">
          <img src={user?.profileImage} className="w-10 h-10 rounded-full object-cover" alt="user" />
          <input 
            value={quickPost}
            onChange={(e) => setQuickPost(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handlePost()}
            placeholder={`Share a memory...`}
            className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-full py-2.5 px-5 text-sm font-medium outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 px-2">
          <button onClick={() => setShowCamera(true)} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-2 rounded-xl text-sm font-bold transition-all">
            <Camera size={20} className="text-rose-500" />
            Snapshot
          </button>
          <button 
            onClick={onNavigateToGallery} 
            className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-2 rounded-xl text-sm font-bold transition-all"
          >
            <ImageIcon size={20} className="text-emerald-500" />
            Archives
          </button>
          <button 
            onClick={() => handlePost()}
            disabled={!quickPost.trim()}
            className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest disabled:opacity-30 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 dark:shadow-none"
          >
            Post
          </button>
        </div>
      </div>

      {/* AI Digest Card */}
      <div 
        className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group cursor-pointer active:scale-[0.99] transition-all"
        onClick={() => onNavigateToChat(AI_HISTORIAN_ID)}
      >
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot size={24} className={isDigestLoading ? "animate-bounce" : ""} />
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">AI Historian Weekly Digest</h4>
            </div>
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">
               Ask about your history <MessageCircle size={10} />
            </div>
          </div>
          
          <div className="min-h-[60px] flex items-center">
            {isDigestLoading ? (
              <p className="text-xl font-medium leading-relaxed italic opacity-50 animate-pulse">
                "Our family historian is reviewing the archives to summarize our latest moments..."
              </p>
            ) : (
              <p className="text-xl font-medium leading-relaxed italic animate-in fade-in duration-700">
                "{digest}"
              </p>
            )}
          </div>
        </div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-1000" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-400/20 rounded-full blur-3xl" />
      </div>

      {/* Feed Posts */}
      <div className="space-y-6">
        {posts.length > 0 ? posts.map(post => (
          <div key={post.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow">
             <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={post.authorImage} className="w-10 h-10 rounded-full object-cover" alt="author" />
                  <div>
                    <h5 className="font-bold text-sm dark:text-white leading-tight">{post.authorName}</h5>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button className="text-slate-400 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors">
                  <Share2 size={18} />
                </button>
             </div>
             <div className="px-4 pb-4">
               <p className="text-sm dark:text-slate-200 leading-relaxed">{post.content}</p>
             </div>
             {post.imageUrl && (
               <img src={post.imageUrl} className="w-full aspect-square md:aspect-video object-cover border-y border-slate-50 dark:border-slate-800" alt="post attachment" />
             )}
             <div className="px-4 py-3 flex items-center justify-between">
               <div className="flex items-center -space-x-1">
                 <div className="w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-white ring-2 ring-white dark:ring-slate-900">
                   <Heart size={10} fill="currentColor" />
                 </div>
                 <span className="pl-3 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                   {post.reactions.length || 0} family members loved this
                 </span>
               </div>
               <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                 {post.commentCount} comments
               </span>
             </div>
          </div>
        )) : (
          <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
             <ImageIcon size={40} className="mx-auto mb-4 text-slate-300" />
             <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No family posts yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;