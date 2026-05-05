import React, { useState, useContext, useEffect, useRef } from 'react';
import { UserPlus, UserMinus, Shield, Search, ChevronDown, Check, X, User, Globe, Lock } from 'lucide-react';
import api from '../api/axios';
import { AuthContext } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const roles = [
  { id: 'admin', label: 'Project Admin', description: 'Full access to change settings, modify, or delete the project.' },
  { id: 'editor', label: 'Editor', description: 'Can add, edit, and delete anything in the project.' },
  { id: 'commenter', label: 'Commenter', description: "Can comment, but can't edit anything in the project." },
  { id: 'viewer', label: 'Viewer', description: "Can view, but can't add comments or edit the project." }
];

// Helper to generate a consistent color based on string (name)
const getAvatarColor = (name) => {
  const colors = [
    'from-indigo-500 to-indigo-600',
    'from-emerald-500 to-emerald-600',
    'from-amber-500 to-amber-600',
    'from-rose-500 to-rose-600',
    'from-cyan-500 to-cyan-600',
    'from-violet-500 to-violet-600',
    'from-pink-500 to-pink-600'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const MemberList = ({ projectId, members, isAdmin, onMemberUpdated, isOpen, onClose }) => {
  const { showToast, confirmAction } = useNotification();
  const { user: currentUser } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('viewer');
  const [loading, setLoading] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(null);
  const [isPublic, setIsPublic] = useState(false); // Placeholder for visibility toggle

  const dropdownRef = useRef(null);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowRoleSelector(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await api.post(`/projects/${projectId}/members`, { email, role: selectedRole });
      setEmail('');
      onMemberUpdated();
    } catch (error) {
      showToast(error.response?.data?.message || 'Error adding member', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await api.put(`/projects/${projectId}/members/${userId}`, { role: newRole });
      setShowRoleSelector(null);
      onMemberUpdated();
    } catch (error) {
      showToast(error.response?.data?.message || 'Error updating role', 'error');
    }
  };

  const handleRemove = (userId, userName) => {
    confirmAction({
      title: 'Remove Member',
      message: `Are you sure you want to remove ${userName} from this project?`,
      type: 'danger',
      confirmText: 'Remove Member',
      onConfirm: async () => {
        try {
          await api.delete(`/projects/${projectId}/members/${userId}`);
          onMemberUpdated();
          showToast('Member removed', 'success');
        } catch (error) {
          showToast(error.response?.data?.message || 'Error removing member', 'error');
        }
      }
    });
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className={`fixed top-[60px] bottom-0 left-0 right-0 z-[85] transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }}
        onClick={onClose}
      />

      {/* Sidebar Drawer (Share Panel) */}
      <div className={`
        fixed top-[60px] right-0 h-[calc(100vh-60px)] w-[360px] z-[95] 
        dark:bg-[#0f0f0f] bg-white
        border-l dark:border-[#2a2a3e] border-gray-200
        shadow-2xl transition-transform duration-300 ease-out
        flex flex-col overflow-y-auto overscroll-contain
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        
        {/* Fixed Header */}
        <div className="flex-none p-6 border-b dark:border-[#2a2a3e] border-gray-100 flex justify-between items-center dark:bg-[#1a1a2e] bg-gray-50">
          <h2 className="text-xl font-bold dark:text-[#ffffff] text-gray-800 tracking-tight">Share Project</h2>
          <button 
            onClick={onClose}
            className="p-2 dark:hover:bg-[#2a2a3e] hover:bg-gray-200 rounded-lg dark:text-[#9ca3af] text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-6 space-y-8 custom-scrollbar dark:bg-[#0f0f0f] bg-white">
          
          {/* Section 1: Invite with email */}
          {isAdmin && (
            <div className="space-y-5 bg-gray-50/50 dark:bg-[#1a1a2e]/30 p-5 rounded-2xl border border-gray-100 dark:border-[#2a2a3e]/50">
              <div className="flex items-center gap-2 mb-1">
                <UserPlus size={16} className="text-indigo-500" />
                <h3 className="text-xs font-black dark:text-[#9ca3af] text-gray-500 uppercase tracking-[0.15em]">Invite with email</h3>
              </div>
              
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center">
                    <Search className="dark:text-[#6b7280] text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-11 pr-4 py-3 dark:bg-[#0f0f0f] bg-white border border-gray-200 dark:border-[#2a2a3e] dark:focus:border-indigo-500 focus:border-indigo-500 rounded-xl outline-none transition-all dark:text-white text-sm shadow-sm"
                  />
                </div>
                
                <div className="flex gap-2.5">
                  <div className="relative flex-1">
                    <select
                      value={selectedRole}
                      onChange={e => setSelectedRole(e.target.value)}
                      className="w-full appearance-none dark:bg-[#0f0f0f] bg-white border border-gray-200 dark:border-[#2a2a3e] dark:focus:border-indigo-500 focus:border-indigo-500 rounded-xl pl-4 pr-10 py-3 text-sm outline-none dark:text-white cursor-pointer shadow-sm transition-all"
                    >
                      {roles.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading || !email}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 whitespace-nowrap"
                  >
                    {loading ? '...' : 'Invite'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Section 2: Who has access */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold dark:text-[#9ca3af] text-gray-500 uppercase tracking-widest">Who has access</h3>
            <div className="space-y-1">
              {members.map(member => (
                <div key={member.id} className="flex items-center justify-between py-3 dark:hover:bg-[#1e1e2e] hover:bg-gray-50 px-2 -mx-2 rounded-xl transition-colors">
                  <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                    <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getAvatarColor(member.name)} flex items-center justify-center text-white font-bold text-xs shadow-sm flex-shrink-0`}>
                      {member.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                    </div>
                    <div className="min-w-0 flex flex-col flex-1">
                      <div className="font-semibold dark:text-[#ffffff] text-gray-800 text-sm flex items-center gap-2">
                        <span className="truncate">{member.name}</span>
                        {member.id === currentUser.id && (
                          <span className="flex-shrink-0 text-[9px] dark:bg-[#4f46e5]/20 dark:text-[#4f46e5] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-md uppercase font-bold tracking-wider">You</span>
                        )}
                      </div>
                      <div className="text-xs dark:text-[#9ca3af] text-gray-500 truncate">{member.email}</div>
                    </div>
                  </div>

                  <div className="relative flex-shrink-0" ref={showRoleSelector === member.id ? dropdownRef : null}>
                    {isAdmin && member.id !== currentUser.id ? (
                      <button
                        onClick={() => setShowRoleSelector(showRoleSelector === member.id ? null : member.id)}
                        className="flex items-center gap-1 text-xs font-medium dark:text-[#9ca3af] dark:hover:text-[#ffffff] text-gray-600 hover:text-gray-900 transition-colors p-1 rounded-md"
                      >
                        {roles.find(r => r.id === member.role)?.label}
                        <ChevronDown size={14} className={`transition-transform ${showRoleSelector === member.id ? 'rotate-180' : ''}`} />
                      </button>
                    ) : (
                      <span className="text-xs font-medium dark:text-[#9ca3af] text-gray-500 pr-1">
                        {roles.find(r => r.id === member.role)?.label}
                      </span>
                    )}

                    {showRoleSelector === member.id && (
                      <div className="absolute right-0 top-full mt-1 w-60 dark:bg-[#1e1e2e] bg-white rounded-xl shadow-xl dark:border-[#2a2a3e] border-gray-200 border py-1 z-[100] animate-in fade-in slide-in-from-top-1">
                        {roles.map(r => (
                          <button
                            key={r.id}
                            onClick={() => handleUpdateRole(member.id, r.id)}
                            className="w-full px-4 py-2 text-left dark:hover:bg-[#2a2a3e] hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex justify-between items-center">
                              <span className={`font-semibold text-xs ${member.role === r.id ? 'dark:text-[#4f46e5] text-blue-600' : 'dark:text-[#ffffff] text-gray-800'}`}>
                                {r.label}
                              </span>
                              {member.role === r.id && <Check size={14} className="dark:text-[#4f46e5] text-blue-600" />}
                            </div>
                            <p className="text-[10px] dark:text-[#9ca3af] text-gray-500 mt-0.5 leading-tight">{r.description}</p>
                          </button>
                        ))}
                        
                        <div className="dark:border-[#2a2a3e] border-gray-100 border-t my-1"></div>
                        
                        <button
                          onClick={() => handleRemove(member.id, member.name)}
                          className="w-full px-4 py-2 text-left dark:hover:bg-[#ef4444]/10 hover:bg-red-50 text-[#ef4444] transition-colors flex items-center gap-2 font-semibold text-xs"
                        >
                          <UserMinus size={14} />
                          Remove from project
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Project Visibility */}
          {isAdmin && (
            <div className="space-y-4 pt-4 dark:border-[#2a2a3e] border-gray-100 border-t">
              <h3 className="text-xs font-bold dark:text-[#9ca3af] text-gray-500 uppercase tracking-widest">Project Visibility</h3>
              
              <div 
                onClick={() => setIsPublic(!isPublic)}
                className="flex items-center justify-between p-4 dark:bg-[#1e1e2e] bg-gray-50 rounded-xl cursor-pointer dark:hover:bg-[#2a2a3e] hover:bg-gray-100 transition-colors border border-transparent dark:hover:border-[#4f46e5]/30 hover:border-blue-500/30"
              >
                <div className="flex gap-3">
                  <div className={`p-2 rounded-lg ${isPublic ? 'dark:bg-[#4f46e5]/20 bg-blue-100 dark:text-[#4f46e5] text-blue-600' : 'dark:bg-[#2a2a3e] bg-gray-200 dark:text-[#9ca3af] text-gray-600'}`}>
                    {isPublic ? <Globe size={18} /> : <Lock size={18} />}
                  </div>
                  <div>
                    <h4 className="dark:text-[#ffffff] text-gray-800 text-sm font-semibold">
                      {isPublic ? 'Public Project' : 'Private Project'}
                    </h4>
                    <p className="dark:text-[#9ca3af] text-gray-500 text-[11px] mt-0.5">
                      {isPublic ? 'Anyone with the link can view.' : 'Only project members have access.'}
                    </p>
                  </div>
                </div>
                
                {/* Custom Toggle UI */}
                <div className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors ${isPublic ? 'bg-[#4f46e5]' : 'dark:bg-[#2a2a3e] bg-gray-300'}`}>
                  <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-sm transform transition-transform duration-300 ${isPublic ? 'translate-x-4.5' : 'translate-x-0'}`} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        <div className="flex-none p-5 border-t dark:border-[#2a2a3e] border-gray-100 dark:bg-[#1a1a2e] bg-gray-50 flex items-center gap-3">
          <div className="flex-1">
            <p className="dark:text-[#9ca3af] text-gray-500 text-xs text-center">
              Changes apply instantly. Click outside to close.
            </p>
          </div>
        </div>

      </div>
    </>
  );
};

export default MemberList;
