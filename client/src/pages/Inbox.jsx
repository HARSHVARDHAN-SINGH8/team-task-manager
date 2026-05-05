import React, { useEffect, useState, useContext, useRef } from 'react';
import api from '../api/axios';
import { AuthContext } from '../contexts/AuthContext';
import { Send, Search, Plus, MessageSquare, X, Check, CheckCheck } from 'lucide-react';

const getAvatarColor = (name = '') => {
  const colors = [
    'from-violet-500 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
    'from-cyan-500 to-blue-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const Avatar = ({ name = '', size = 'md' }) => {
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-11 h-11 text-sm';
  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br ${getAvatarColor(name)} flex items-center justify-center text-white font-black shrink-0`}>
      {name[0]?.toUpperCase()}
    </div>
  );
};

const Inbox = () => {
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const res = await api.get('/messages/conversations');
      setConversations(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchAllUsers = async () => {
    try {
      const res = await api.get('/messages/users/all');
      setAllUsers(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchConversations();
    fetchAllUsers();
  }, []);

  const fetchMessages = async (userId) => {
    try {
      const res = await api.get(`/messages/${userId}`);
      setMessages(res.data);
      setTimeout(scrollToBottom, 50);
      // Refresh convos to reset unread count
      fetchConversations();
    } catch (e) { console.error(e); }
  };

  const openChat = (targetUser) => {
    setActiveUser(targetUser);
    setShowNewChat(false);
    fetchMessages(targetUser.id);

    // Poll for new messages every 3 seconds
    clearInterval(pollRef.current);
    pollRef.current = setInterval(() => fetchMessages(targetUser.id), 3000);
  };

  useEffect(() => {
    return () => clearInterval(pollRef.current);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeUser) return;
    setSending(true);
    try {
      const res = await api.post(`/messages/${activeUser.id}`, { content: newMessage });
      setMessages(prev => [...prev, res.data]);
      setNewMessage('');
      fetchConversations();
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const startNewChat = (targetUser) => {
    openChat(targetUser);
  };

  const filteredConversations = conversations.filter(c =>
    c.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = allUsers.filter(u =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] -m-4 lg:-m-8 overflow-hidden rounded-none lg:rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1e1f21]">
      
      {/* LEFT SIDEBAR — Conversations */}
      <div className={`${activeUser ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-shrink-0 flex-col border-r border-gray-100 dark:border-gray-800`}>
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-black dark:text-white">Messages</h1>
            <button
              onClick={() => setShowNewChat(!showNewChat)}
              className="w-9 h-9 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all"
              title="New Message"
            >
              <Plus size={18} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-[#2b2d30] border-none rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* New Chat — User List */}
        {showNewChat && (
          <div className="border-b border-gray-100 dark:border-gray-800">
            <div className="p-3 flex items-center justify-between">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Start New Chat</span>
              <button onClick={() => setShowNewChat(false)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredUsers.map(u => (
                <button
                  key={u.id}
                  onClick={() => startNewChat(u)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#2b2d30] transition-colors text-left"
                >
                  <Avatar name={u.name} size="sm" />
                  <div>
                    <p className="text-sm font-bold dark:text-white">{u.name}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>
                </button>
              ))}
              {filteredUsers.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-4">No users found</p>
              )}
            </div>
          </div>
        )}

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map(convo => (
              <button
                key={convo.id}
                onClick={() => openChat(convo)}
                className={`w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 dark:hover:bg-[#2b2d30] transition-colors text-left border-b border-gray-50 dark:border-gray-800/50 ${activeUser?.id === convo.id ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
              >
                <div className="relative">
                  <Avatar name={convo.name} />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white dark:border-[#1e1f21] rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold dark:text-white truncate">{convo.name}</span>
                    <span className="text-[10px] text-gray-400 shrink-0">{formatTime(convo.last_message_at)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-gray-500 truncate max-w-[160px]">
                      {convo.sender_id === user?.id ? 'You: ' : ''}{convo.last_message}
                    </p>
                    {convo.unread_count > 0 && (
                      <span className="w-5 h-5 bg-blue-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shrink-0">
                        {convo.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-[#2b2d30] rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="text-gray-300" size={28} />
              </div>
              <p className="font-bold text-gray-400 text-sm">No messages yet</p>
              <p className="text-gray-400 text-xs mt-1">Click <strong>+</strong> to start a conversation</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL — Chat */}
      {activeUser ? (
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4">
            <button onClick={() => { setActiveUser(null); clearInterval(pollRef.current); }} className="md:hidden p-1 text-gray-400">
              ←
            </button>
            <div className="relative">
              <Avatar name={activeUser.name} />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white dark:border-[#1e1f21] rounded-full" />
            </div>
            <div>
              <p className="font-black dark:text-white">{activeUser.name}</p>
              <p className="text-xs text-green-500 font-semibold">Online</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-[#2b2d30] rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="text-gray-300" size={28} />
                </div>
                <p className="font-bold text-gray-400">Say hello to {activeUser.name}!</p>
                <p className="text-gray-400 text-sm mt-1">Start your conversation below.</p>
              </div>
            ) : (
              messages.map((msg, i) => {
                const isMe = msg.sender_id === user?.id;
                const showAvatar = !isMe && (i === 0 || messages[i - 1]?.sender_id !== msg.sender_id);

                return (
                  <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    {!isMe && (
                      <div className={`${showAvatar ? '' : 'invisible'} shrink-0`}>
                        <Avatar name={msg.sender_name} size="sm" />
                      </div>
                    )}
                    <div className={`max-w-[65%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isMe
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-gray-100 dark:bg-[#2b2d30] text-gray-900 dark:text-white rounded-bl-none'
                      }`}>
                        {msg.content}
                      </div>
                      <div className={`flex items-center gap-1 text-[10px] text-gray-400 ${isMe ? 'flex-row-reverse' : ''}`}>
                        <span>{formatTime(msg.created_at)}</span>
                        {isMe && (
                          msg.is_read
                            ? <CheckCheck size={12} className="text-blue-500" />
                            : <Check size={12} className="text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800">
            <form onSubmit={handleSend} className="flex items-center gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder={`Message ${activeUser.name}...`}
                className="flex-1 px-5 py-3 bg-gray-50 dark:bg-[#2b2d30] border-none rounded-2xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                autoFocus
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="w-12 h-12 flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-2xl transition-all active:scale-95 shrink-0"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 flex-col items-center justify-center text-center text-gray-400">
          <div className="w-20 h-20 bg-gray-100 dark:bg-[#2b2d30] rounded-full flex items-center justify-center mb-4">
            <MessageSquare size={36} className="text-gray-300" />
          </div>
          <p className="font-black text-gray-500 dark:text-gray-400 text-lg">Select a conversation</p>
          <p className="text-sm text-gray-400 mt-1">or click <strong>+</strong> to message someone</p>
        </div>
      )}
    </div>
  );
};

export default Inbox;
