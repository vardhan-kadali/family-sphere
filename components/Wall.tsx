
import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Send, Image, MoreHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { db } from '../services/mockDb';
import { Post, User, Comment, ReactionType } from '../types';

interface WallProps {
  user: User | null;
}

const Wall: React.FC<WallProps> = ({ user }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    setPosts(db.getPosts());
  }, []);

  const handlePost = () => {
    if (!newPostContent.trim() || !user) return;
    setIsPosting(true);
    
    // Fix: Updated post structure to match type definition
    const post: Post = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      authorName: user.name,
      authorImage: user.profileImage,
      content: newPostContent,
      reactions: [],
      commentCount: 0,
      createdAt: new Date().toISOString()
    };

    db.addPost(post);
    setPosts(db.getPosts());
    setNewPostContent('');
    setIsPosting(false);
  };

  const handleLike = (postId: string) => {
    if (!user) return;
    
    // Fix: Updated like handling to use reactions array
    const updatedPosts = posts.map(p => {
      if (p.id === postId) {
        const isLiked = p.reactions.some(r => r.userId === user.id);
        const newReactions = isLiked 
          ? p.reactions.filter(r => r.userId !== user.id)
          : [...p.reactions, { userId: user.id, type: 'LIKE' as ReactionType }];
        
        // Sync with mock database
        db.updatePostReaction(postId, user.id, 'LIKE');

        return {
          ...p,
          reactions: newReactions
        };
      }
      return p;
    });
    setPosts(updatedPosts);
  };

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleCommentSubmit = (postId: string) => {
    const content = commentInputs[postId];
    if (!content?.trim() || !user) return;

    const newComment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      postId,
      userId: user.id,
      authorName: user.name,
      content,
      createdAt: new Date().toISOString()
    };

    db.addComment(newComment);
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    // Refresh posts to show updated comment count
    setPosts(db.getPosts()); 
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Create Post */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-50 dark:border-slate-800 shadow-2xl transition-all">
        <div className="flex gap-6">
          <img src={user?.profileImage} className="w-14 h-14 rounded-2xl object-cover ring-4 ring-indigo-50 shadow-xl" />
          <div className="flex-1 space-y-6">
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder={`What's new with you, ${user?.name?.split(' ')[0]}?`}
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-[1.5rem] p-6 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 transition-all resize-none min-h-[140px] outline-none font-medium text-lg placeholder:text-slate-300"
            />
            <div className="flex items-center justify-between pt-2">
              <button className="flex items-center gap-3 text-slate-400 hover:text-indigo-600 transition-all font-black text-xs uppercase tracking-widest">
                <Image size={24} className="text-emerald-500" />
                <span>Attach Media</span>
              </button>
              <button
                disabled={isPosting || !newPostContent.trim()}
                onClick={handlePost}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl shadow-indigo-100 dark:shadow-none active:scale-95"
              >
                {isPosting ? 'Posting...' : 'Share Update'} <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-10">
        {posts.map((post) => (
          <article key={post.id} className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-50 dark:border-slate-800 shadow-2xl overflow-hidden transition-all hover:scale-[1.01]">
            <div className="p-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src={post.authorImage} className="w-14 h-14 rounded-2xl border-2 border-indigo-50 shadow-lg object-cover" />
                <div>
                  <h4 className="font-black text-xl text-slate-900 dark:text-white leading-tight">{post.authorName}</h4>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{new Date(post.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <button className="p-3 text-slate-300 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all">
                <MoreHorizontal size={24} />
              </button>
            </div>
            
            <div className="px-8 pb-8">
              <p className="text-slate-700 dark:text-slate-200 text-lg leading-relaxed whitespace-pre-wrap font-medium">{post.content}</p>
            </div>

            {post.imageUrl && (
              <div className="relative aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden group">
                <img src={post.imageUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            )}

            <div className="p-6 border-t border-slate-50 dark:border-slate-800 flex items-center gap-10">
              <button 
                onClick={() => handleLike(post.id)}
                className={`flex items-center gap-3 transition-all active:scale-125 ${post.reactions.some(r => r.userId === user?.id) ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`}
              >
                <Heart size={26} fill={post.reactions.some(r => r.userId === user?.id) ? 'currentColor' : 'none'} />
                <span className="text-xs font-black uppercase tracking-widest">{post.reactions.length || 'Like'}</span>
              </button>
              <button 
                onClick={() => toggleComments(post.id)}
                className="flex items-center gap-3 text-slate-400 hover:text-indigo-600 transition-colors"
              >
                <MessageCircle size={26} />
                <span className="text-xs font-black uppercase tracking-widest">Discuss</span>
                {expandedComments[post.id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>

            {/* Comments Section */}
            {expandedComments[post.id] && (
              <div className="bg-slate-50/50 dark:bg-slate-800/30 p-8 border-t border-slate-50 dark:border-slate-800 animate-in slide-in-from-top-4 duration-300">
                <div className="space-y-6 mb-8">
                  {db.getComments(post.id).map(comment => (
                    <div key={comment.id} className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 flex-shrink-0 flex items-center justify-center text-indigo-600 font-black text-xs uppercase shadow-sm">
                        {comment.authorName.charAt(0)}
                      </div>
                      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm flex-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{comment.authorName}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                  {db.getComments(post.id).length === 0 && (
                    <p className="text-center text-[10px] font-black text-slate-400 py-4 uppercase tracking-widest">No conversation here yet.</p>
                  )}
                </div>

                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 overflow-hidden flex-shrink-0 shadow-inner">
                    <img src={user?.profileImage} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 relative">
                    <input 
                      type="text"
                      value={commentInputs[post.id] || ''}
                      onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit(post.id)}
                      placeholder="Add to the conversation..."
                      className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white transition-all shadow-sm"
                    />
                    <button 
                      onClick={() => handleCommentSubmit(post.id)}
                      disabled={!commentInputs[post.id]?.trim()}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-600 disabled:opacity-30 p-2 hover:bg-indigo-50 rounded-xl transition-all"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
};

export default Wall;
