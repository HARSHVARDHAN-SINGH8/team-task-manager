import React, { useEffect, useState, useContext, useRef } from 'react';
import { 
  X, MessageSquare, Send, Calendar, User, Flame, Tag, 
  Trash2, Copy, CheckCircle2, Circle, MoreHorizontal,
  Plus, ChevronDown, Clock
} from 'lucide-react';
import api from '../api/axios';
import { AuthContext } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const TaskDetailModal = ({ taskId, projectId, onClose, onTaskUpdated }) => {
  const { user } = useContext(AuthContext);
  const { showToast, confirmAction } = useNotification();
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Inline Edit State
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDesc, setEditedDesc] = useState('');

  const fetchTaskAndComments = async () => {
    try {
      const [tasksRes, commentsRes] = await Promise.all([
        api.get(`/tasks/project/${projectId}`),
        api.get(`/comments/task/${taskId}`)
      ]);
      const currentTask = tasksRes.data.find(t => t.id.toString() === taskId.toString());
      setTask(currentTask);
      setComments(commentsRes.data);
      setEditedTitle(currentTask.title);
      setEditedDesc(currentTask.description || '');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (taskId && projectId) {
      fetchTaskAndComments();
      // Lock scroll
      document.body.style.overflow = 'hidden';
    }
    return () => {
      // Unlock scroll
      document.body.style.overflow = 'unset';
    };
  }, [taskId, projectId]);

  const handleUpdateTask = async (updates) => {
    try {
      await api.put(`/tasks/${taskId}`, updates);
      await fetchTaskAndComments();
      onTaskUpdated?.();
    } catch (error) {
      showToast('Update failed', 'error');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await api.post(`/comments/task/${taskId}`, { comment: newComment });
      setNewComment('');
      const res = await api.get(`/comments/task/${taskId}`);
      setComments(res.data);
    } catch (error) {
      showToast('Error adding comment', 'error');
    }
  };

  const handleDeleteTask = async () => {
    const confirmed = await confirmAction('Are you sure you want to delete this task?');
    if (!confirmed) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      onTaskUpdated?.();
      onClose();
      showToast('Task deleted', 'success');
    } catch (error) {
      showToast('Failed to delete task', 'error');
    }
  };

  if (!taskId) return null;

  const getStatusStyle = (status) => {
    if (task?.is_completed) return 'text-[#22c55e] bg-[#14532d] border-[#16a34a] shadow-[0_0_12px_rgba(34,197,94,0.3)]';
    switch (status?.toLowerCase()) {
      case 'done': return 'text-[#22c55e] bg-[#14532d] border-[#16a34a] shadow-[0_0_12px_rgba(34,197,94,0.3)]';
      case 'inprogress': return 'text-[#f59e0b] bg-[#451a03] border-[#92400e] shadow-[0_0_12px_rgba(245,158,11,0.3)]';
      default: return 'text-[#818cf8] bg-[#1e1b4b] border-[#4338ca] shadow-[0_0_12px_rgba(129,140,248,0.3)]';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'text-[#ef4444]';
      case 'medium': return 'text-[#f59e0b]';
      default: return 'text-[#9ca3af]';
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-6 font-sans">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-[2px] transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-[680px] bg-white dark:bg-[#111827] shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[20px] flex flex-col animate-in zoom-in-95 duration-300 border border-gray-100 dark:border-[#374151] overflow-hidden max-h-[90vh]">
        
        {/* Subtle Top Gradient */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-indigo-500/5 dark:from-[#4f46e5]/10 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="relative px-8 py-5 flex items-center justify-between border-b border-gray-100 dark:border-[#374151] shrink-0">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => handleUpdateTask({ is_completed: !task?.is_completed })}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black transition-all border ${
                task?.is_completed 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-500 dark:bg-[#14532d] dark:border-[#16a34a]' 
                  : 'bg-transparent border-gray-200 dark:border-[#374151] text-gray-400 dark:text-[#9ca3af] hover:border-emerald-500 hover:text-emerald-500'
              }`}
            >
              {task?.is_completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
              {task?.is_completed ? 'COMPLETED' : 'MARK COMPLETE'}
            </button>
            <div className="h-6 w-px bg-gray-100 dark:bg-[#374151]" />
            <span className="font-mono text-[13px] text-gray-400 dark:text-[#9ca3af] tracking-tight font-bold uppercase">TASK-{taskId}</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-50 dark:hover:bg-[#1f2937] rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all"><Copy size={18} /></button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-50 dark:hover:bg-[#1f2937] rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all active:scale-95"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-32 bg-white dark:bg-[#111827]">
            <div className="w-10 h-10 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        ) : task ? (
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent overscroll-contain">
            <div className="p-8 space-y-10">
              
              {/* Title & Description Section */}
              <div className="space-y-4">
                <div className="group relative">
                  {isEditingTitle ? (
                    <input
                      autoFocus
                      className="w-full bg-transparent text-gray-900 dark:text-[#f9fafb] text-[24px] font-black outline-none border-b-2 border-indigo-500 pb-1 transition-all"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      onBlur={() => {
                        setIsEditingTitle(false);
                        if (editedTitle !== task.title) handleUpdateTask({ title: editedTitle });
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                    />
                  ) : (
                    <h1 
                      onClick={() => setIsEditingTitle(true)}
                      className="text-[26px] font-black text-gray-900 dark:text-[#f9fafb] tracking-tight leading-tight cursor-text group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
                    >
                      {task.title}
                    </h1>
                  )}
                </div>

                <div className="group">
                  {isEditingDesc ? (
                    <textarea
                      autoFocus
                      className="w-full bg-gray-50 dark:bg-[#1a1c2c]/30 rounded-xl p-4 text-gray-700 dark:text-[#d1d5db] text-[15px] leading-relaxed outline-none border border-indigo-500/30 resize-none min-h-[120px] custom-scrollbar"
                      value={editedDesc}
                      onChange={(e) => setEditedDesc(e.target.value)}
                      onBlur={() => {
                        setIsEditingDesc(false);
                        if (editedDesc !== task.description) handleUpdateTask({ description: editedDesc });
                      }}
                      placeholder="Add a detailed description..."
                    />
                  ) : (
                    <div 
                      onClick={() => setIsEditingDesc(true)}
                      className="text-gray-600 dark:text-[#d1d5db] text-[15px] leading-relaxed cursor-text hover:bg-gray-50 dark:hover:bg-white/5 p-4 -m-4 rounded-xl transition-all min-h-[40px]"
                    >
                      {task.description || <span className="text-gray-300 dark:text-[#6b7280] italic">Add a description...</span>}
                    </div>
                  )}
                </div>
              </div>

              {/* Metadata Row */}
              <div className="flex flex-wrap gap-4">
                <div className={`flex items-center gap-2.5 px-4 py-2 rounded-full border transition-all cursor-pointer group hover:shadow-md ${
                  task.priority === 'high' ? 'bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/30' :
                  task.priority === 'medium' ? 'bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30' :
                  'bg-gray-50 border-gray-100 dark:bg-[#1f2937] dark:border-[#374151]'
                }`}>
                  <Flame size={16} className={getPriorityColor(task.priority)} />
                  <span className="text-[12px] text-gray-500 dark:text-[#9ca3af] font-bold uppercase tracking-wider">Priority</span>
                  <span className={`text-[13px] font-black capitalize ${
                    task.priority === 'high' ? 'text-red-600 dark:text-red-400' :
                    task.priority === 'medium' ? 'text-amber-600 dark:text-amber-400' :
                    'text-gray-700 dark:text-[#f3f4f6]'
                  }`}>{task.priority || 'Medium'}</span>
                </div>

                <div className="flex items-center gap-2.5 px-4 py-2 bg-gray-50 dark:bg-[#1f2937] border border-gray-100 dark:border-[#374151] rounded-full transition-all cursor-pointer group hover:shadow-md">
                  <Calendar size={16} className="text-indigo-500 dark:text-[#22d3ee]" />
                  <span className="text-[12px] text-gray-500 dark:text-[#9ca3af] font-bold uppercase tracking-wider">Due Date</span>
                  <span className="text-[13px] text-gray-700 dark:text-[#f3f4f6] font-black">
                    {task.due_date ? new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No Deadline'}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 px-4 py-2 bg-gray-50 dark:bg-[#1f2937] border border-gray-100 dark:border-[#374151] rounded-full transition-all cursor-pointer group hover:shadow-md">
                  <div className="w-5 h-5 rounded-full bg-indigo-500 border border-white flex items-center justify-center text-[10px] text-white font-black shadow-sm">
                    {task.assigned_to ? task.assigned_to.toString().slice(0, 1) : 'U'}
                  </div>
                  <span className="text-[12px] text-gray-500 dark:text-[#9ca3af] font-bold uppercase tracking-wider">Assignee</span>
                  <span className="text-[13px] text-gray-700 dark:text-[#f3f4f6] font-black truncate max-w-[100px]">{task.assigned_name || 'Admin'}</span>
                </div>

                <div className="flex items-center gap-2.5 px-4 py-2 bg-gray-50 dark:bg-[#1f2937] border border-gray-100 dark:border-[#374151] rounded-full transition-all cursor-pointer group hover:shadow-md">
                  <Tag size={16} className="text-purple-500 dark:text-[#818cf8]" />
                  <span className="text-[12px] text-gray-500 dark:text-[#9ca3af] font-bold uppercase tracking-wider">Section</span>
                  <span className="text-[13px] text-gray-700 dark:text-[#f3f4f6] font-black truncate max-w-[150px]">{task.list_name || 'Board'}</span>
                </div>
              </div>

              {/* Discussion Section */}
              <div className="pt-10 border-t border-gray-100 dark:border-[#374151] space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare size={22} className="text-indigo-500 dark:text-[#6366f1]" />
                    <h2 className="text-[12px] font-black text-gray-900 dark:text-[#e5e7eb] uppercase tracking-[0.2em]">Discussion</h2>
                  </div>
                  <span className="px-4 py-1.5 rounded-full bg-indigo-600 text-[10px] text-white font-black shadow-lg shadow-indigo-500/20">
                    {comments.length} MESSAGES
                  </span>
                </div>

                {/* Comment Input */}
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 border border-white/20 flex items-center justify-center text-[14px] text-white font-black shadow-lg shadow-indigo-500/20 shrink-0">
                    {user?.name?.[0] || 'U'}
                  </div>
                  <form onSubmit={handleAddComment} className="flex-1 group relative">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your thoughts with the team..."
                      className="w-full bg-gray-50 dark:bg-[#1f2937] border border-gray-200 dark:border-[#374151] rounded-2xl px-6 py-4 text-[14px] text-gray-900 dark:text-[#f9fafb] placeholder-gray-400 dark:placeholder-[#6b7280] outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5"
                    />
                    <button 
                      type="submit" 
                      className="absolute right-3 top-2.5 p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                    >
                      <Send size={16} />
                    </button>
                  </form>
                </div>

                {/* Comment Cards */}
                <div className="space-y-6">
                  {comments.map(comment => (
                    <div key={comment.id} className="flex gap-5 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-[#1f2937] border border-gray-200 dark:border-[#374151] flex items-center justify-center text-[13px] text-indigo-600 dark:text-[#6366f1] font-black shrink-0">
                        {comment.user_name?.[0] || 'U'}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-[14px] text-gray-900 dark:text-[#f3f4f6]">{comment.user_name}</span>
                          <span className="text-[12px] text-gray-400 dark:text-[#6b7280] font-bold">{new Date(comment.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="bg-gray-50 dark:bg-[#1f2937] border border-gray-100 dark:border-[#374151] border-l-4 border-l-indigo-500 p-5 rounded-2xl rounded-tl-none shadow-sm">
                          <p className="text-[14px] text-gray-700 dark:text-[#d1d5db] leading-[1.6] whitespace-pre-wrap font-medium">{comment.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <div className="text-center py-16 bg-gray-50/50 dark:bg-[#1f2937]/30 border-2 border-dashed border-gray-200 dark:border-[#374151] rounded-[32px]">
                      <MessageSquare size={36} className="mx-auto text-gray-200 dark:text-[#374151] mb-4" />
                      <p className="text-[12px] text-gray-400 dark:text-[#6b7280] font-black uppercase tracking-[0.2em]">No comments yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-32 text-gray-300 dark:text-[#64748b]">
            <X size={48} className="mb-4 opacity-10" />
            <p className="font-black uppercase tracking-widest text-[12px]">Task Not Found</p>
          </div>
        )}

        {/* Footer */}
        <div className="px-8 py-5 bg-gray-50 dark:bg-[#1f2937]/90 border-t border-gray-100 dark:border-[#374151] flex items-center justify-between backdrop-blur-sm">
          <div className="flex items-center gap-2 text-gray-400 dark:text-[#6b7280]">
             <Clock size={16} />
             <span className="text-[11px] font-black uppercase tracking-widest">Created {task?.created_at ? new Date(task.created_at).toLocaleDateString() : 'N/A'}</span>
          </div>
          <div className="flex items-center gap-4">
             <button 
               onClick={handleDeleteTask}
               className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all text-[11px] font-black border border-red-100 dark:bg-[#991b1b]/10 dark:text-[#fca5a5] dark:border-[#991b1b]/20 dark:hover:bg-[#991b1b]"
             >
               <Trash2 size={16} />
               DELETE TASK
             </button>
             <button 
               onClick={onClose}
               className="px-6 py-2.5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-xl text-[11px] font-black transition-all active:scale-95 shadow-lg shadow-gray-900/10 dark:shadow-none"
             >
               CLOSE
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
