
import React, { useState, useEffect, useRef } from 'react';
import { Send, Search, MessageSquare, Bot, Sparkles, Loader2 } from 'lucide-react';
import { db, AI_HISTORIAN_ID } from '../services/mockDb';
import { User as UserType, DirectMessage } from '../types';
import { getHistorianChatResponse } from '../services/geminiService';

interface MessagesProps {
  currentUser: UserType | null;
  initialContactId?: string | null;
}

const Messages: React.FC<MessagesProps> = ({ currentUser, initialContactId }) => {
  const [contacts, setContacts] = useState<UserType[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentUser) {
      const allContacts = db.getUsers().filter(u => u.id !== currentUser.id);
      setContacts(allContacts);
      
      if (initialContactId) {
        const found = allContacts.find(c => c.id === initialContactId);
        if (found) setSelectedUser(found);
      } else if (!selectedUser && allContacts.length > 0) {
        setSelectedUser(allContacts[0]);
      }
    }
  }, [currentUser, initialContactId]);

  useEffect(() => {
    if (selectedUser && currentUser) {
      setMessages(db.getMessages(currentUser.id, selectedUser.id));
    }
  }, [selectedUser, currentUser]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiThinking]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedUser || !currentUser) return;

    const messageContent = inputText;
    const userMessage: DirectMessage = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: currentUser.id,
      receiverId: selectedUser.id,
      text: messageContent,
      timestamp: new Date().toISOString(),
      read: false
    };

    db.sendMessage(userMessage);
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');

    if (selectedUser.id === AI_HISTORIAN_ID) {
      setIsAiThinking(true);
      
      // Build deeper context for the AI
      const posts = db.getPosts().slice(0, 15).map(p => `Post by ${p.authorName} on ${new Date(p.createdAt).toLocaleDateString()}: "${p.content}"`).join('\n');
      const events = db.getEvents().slice(0, 10).map(e => `${e.title} (${e.type}) on ${e.date}`).join('\n');
      const directory = db.getUsers().map(u => `${u.name} (${u.relationship})`).join(', ');
      
      const context = `
FAMILY MEMBERS: ${directory}
RECENT POSTS:
${posts}
UPCOMING EVENTS:
${events}
      `.trim();

      // Convert local message history to Gemini format
      const history = updatedMessages.map(m => ({
        role: (m.senderId === currentUser.id ? 'user' : 'model') as 'user' | 'model',
        parts: [{ text: m.text }]
      }));

      try {
        const aiResponseText = await getHistorianChatResponse(history, context);
        const aiResponse: DirectMessage = {
          id: Math.random().toString(36).substr(2, 9),
          senderId: AI_HISTORIAN_ID,
          receiverId: currentUser.id,
          text: aiResponseText || "I'm reflecting on our family's journey. Tell me more about what's on your mind, dear.",
          timestamp: new Date().toISOString(),
          read: true
        };
        db.sendMessage(aiResponse);
        setMessages(prev => [...prev, aiResponse]);
      } catch (err) {
        console.error("Failed to get AI response", err);
      } finally {
        setIsAiThinking(false);
      }
    }
  };

  return (
    <div className="flex h-[calc(100vh-180px)] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
      <div className="w-1/3 border-r border-slate-100 dark:border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-black mb-4 dark:text-white uppercase tracking-tight">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Find family..." 
              className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {contacts.map(c => (
            <div 
              key={c.id} 
              onClick={() => setSelectedUser(c)}
              className={`p-4 flex items-center gap-4 cursor-pointer transition-all border-b border-slate-50 dark:border-slate-800/50 ${selectedUser?.id === c.id ? 'bg-indigo-50 dark:bg-indigo-900/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              <div className="relative">
                <img src={c.profileImage} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" alt="contact" />
                {c.id === AI_HISTORIAN_ID && (
                  <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white rounded-full p-1 border-2 border-white">
                    <Sparkles size={10} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm dark:text-white truncate">{c.name}</p>
                  {c.id === AI_HISTORIAN_ID && <Bot size={14} className="text-indigo-600" />}
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">{c.relationship}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-slate-50/30 dark:bg-slate-950/30">
        {selectedUser ? (
          <>
            <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src={selectedUser.profileImage} className="w-10 h-10 rounded-full object-cover" alt="selected" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold dark:text-white leading-tight">{selectedUser.name}</p>
                    {selectedUser.id === AI_HISTORIAN_ID && <Bot size={16} className="text-indigo-600" />}
                  </div>
                  <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">
                    {selectedUser.id === AI_HISTORIAN_ID ? 'AI Active' : 'Online'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
              {messages.map(m => (
                <div key={m.id} className={`flex ${m.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] p-4 rounded-2xl text-sm font-medium shadow-sm ${
                    m.senderId === currentUser?.id 
                      ? 'bg-indigo-600 text-white rounded-br-none' 
                      : m.senderId === AI_HISTORIAN_ID 
                        ? 'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/40 border border-indigo-100 dark:border-indigo-800 dark:text-white rounded-bl-none'
                        : 'bg-white dark:bg-slate-800 dark:text-white rounded-bl-none'
                  }`}>
                    {m.text}
                    <p className={`text-[10px] mt-1 opacity-60 ${m.senderId === currentUser?.id ? 'text-right' : 'text-left'}`}>
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {isAiThinking && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl rounded-bl-none flex items-center gap-3">
                    <Loader2 size={16} className="animate-spin text-indigo-600" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Historian is recalling...</span>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
            <form onSubmit={handleSend} className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
              <div className="flex gap-4">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={selectedUser.id === AI_HISTORIAN_ID ? "Ask about your legacy..." : "Type a message..."}
                  className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-medium"
                />
                <button 
                  type="submit"
                  disabled={!inputText.trim() || isAiThinking}
                  className="bg-indigo-600 text-white p-4 rounded-2xl shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center"
                >
                  <Send size={24} />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-10 text-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6">
              <MessageSquare size={40} className="opacity-20" />
            </div>
            <p className="font-black text-xl text-slate-600 dark:text-slate-400 tracking-tight">Your Family Inbox</p>
            <p className="text-sm font-bold mt-2 uppercase tracking-widest opacity-50">Select a family member or the AI Historian to chat</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
