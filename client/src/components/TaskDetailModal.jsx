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
        className="absolute inset-0 bg-[#000000]/80 backdrop-blur-[2px] transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-[680px] bg-[#111827] shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[16px] flex flex-col animate-in zoom-in-95 duration-300 border border-[#374151] overflow-hidden max-h-[90vh]">
        
        {/* Subtle Top Gradient */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#4f46e5]/10 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="relative px-8 py-5 flex items-center justify-between border-b border-[#374151] shrink-0">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => handleUpdateTask({ is_completed: !task?.is_completed })}
              className={`flex items-center gap-2 px-4 py-2 rounded-[10px] text-[12px] font-black transition-all border ${
                task?.is_completed 
                  ? 'bg-[#14532d] border-[#16a34a] text-[#22c55e] shadow-[0_0_20px_rgba(34,197,94,0.2)]' 
                  : 'bg-transparent border-[#374151] text-[#9ca3af] hover:border-[#22c55e] hover:text-[#22c55e]'
              }`}
            >
              {task?.is_completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
              {task?.is_completed ? 'COMPLETED' : 'MARK COMPLETE'}
            </button>
            <div className="h-6 w-px bg-[#374151]" />
            <span className="font-mono text-[13px] text-[#9ca3af] tracking-tight font-medium uppercase">TASK-{taskId}</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-[#1f2937] rounded-lg text-[#6b7280] hover:text-white transition-all"><Copy size={18} /></button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-[#1f2937] rounded-lg text-[#6b7280] hover:text-white transition-all active:scale-95"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-32 bg-[#111827]">
            <div className="w-10 h-10 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        ) : task ? (
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent overscroll-contain">
            <div className="p-8 space-y-10">
              
              {/* Title & Description Section */}
              <div className="space-y-4">
                <div className="group relative">
                  {isEditingTitle ? (
                    <input
                      autoFocus
                      className="w-full bg-transparent text-[#f9fafb] text-[24px] font-bold outline-none border-b-2 border-indigo-500/50 pb-1 transition-all"
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
                      className="text-[24px] font-bold text-[#f9fafb] tracking-tight leading-tight cursor-text group-hover:underline decoration-[#374151] underline-offset-4"
                    >
                      {task.title}
                    </h1>
                  )}
                </div>

                <div className="group">
                  {isEditingDesc ? (
                    <textarea
                      autoFocus
                      className="w-full bg-transparent text-[#d1d5db] text-[14px] leading-relaxed outline-none border-none resize-none min-h-[100px] p-0 custom-scrollbar"
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
                      className="text-[#d1d5db] text-[14px] leading-relaxed cursor-text hover:text-white transition-colors min-h-[40px]"
                    >
                      {task.description || <span className="text-[#6b7280] italic opacity-60">Add a description...</span>}
                    </div>
                  )}
                </div>
              </div>

              {/* Metadata Row */}
              <div className="flex flex-wrap gap-3">
                <div className={`flex items-center gap-2.5 px-4 py-2 rounded-full border transition-all cursor-pointer group hover:scale-[1.02] ${
                  task.priority === 'high' ? 'bg-red-500/10 border-red-500/30' :
                  task.priority === 'medium' ? 'bg-amber-500/10 border-amber-500/30' :
                  'bg-[#1f2937] border-[#374151]'
                }`}>
                  <Flame size={16} className={getPriorityColor(task.priority)} />
                  <span className="text-[12px] text-[#9ca3af] font-medium tracking-wide">Priority</span>
                  <span className={`text-[13px] font-semibold capitalize ${
                    task.priority === 'high' ? 'text-red-400' :
                    task.priority === 'medium' ? 'text-amber-400' :
                    'text-[#f3f4f6]'
                  }`}>{task.priority || 'Medium'}</span>
                </div>

                <div className="flex items-center gap-2.5 px-4 py-2 bg-[#1f2937] hover:bg-[#374151] border border-[#374151] rounded-full transition-all cursor-pointer group hover:scale-[1.02]">
                  <Calendar size={16} className="text-[#22d3ee]" />
                  <span className="text-[12px] text-[#9ca3af] font-medium tracking-wide">Due Date</span>
                  <span className="text-[13px] text-[#f3f4f6] font-semibold">
                    {task.due_date ? new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No Deadline'}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 px-4 py-2 bg-[#1f2937] hover:bg-[#374151] border border-[#374151] rounded-full transition-all cursor-pointer group hover:scale-[1.02]">
                  <div className="w-5 h-5 rounded-full bg-[#a78bfa] border border-white/20 flex items-center justify-center text-[10px] text-white font-black">
                    {task.assigned_to ? task.assigned_to.toString().slice(0, 1) : 'U'}
                  </div>
                  <span className="text-[12px] text-[#9ca3af] font-medium tracking-wide">Assignee</span>
                  <span className="text-[13px] text-[#f3f4f6] font-semibold">{task.assigned_name || (task.assigned_to ? `User ${task.assigned_to}` : 'Admin')}</span>
                </div>

                <div className="flex items-center gap-2.5 px-4 py-2 bg-[#1f2937] hover:bg-[#374151] border border-[#374151] rounded-full transition-all cursor-pointer group hover:scale-[1.02]">
                  <Tag size={16} className="text-[#818cf8]" />
                  <span className="text-[12px] text-[#9ca3af] font-medium tracking-wide">Section</span>
                  <span className="text-[13px] text-[#f3f4f6] font-semibold truncate max-w-[150px]">{task.list_name || 'Board'}</span>
                </div>
              </div>

              {/* Discussion Section */}
              <div className="pt-10 border-t border-[#374151] space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare size={22} className="text-[#6366f1]" />
                    <h2 className="text-[13px] font-semibold text-[#e5e7eb] uppercase tracking-wider">Discussion</h2>
                  </div>
                  <span className="px-4 py-1 rounded-full bg-[#4f46e5] text-[11px] text-white font-black shadow-[0_0_15px_rgba(79,70,229,0.4)]">
                    {comments.length} MESSAGES
                  </span>
                </div>

                {/* Comment Input */}
                <div className="flex gap-4 items-start">
                  <div className="w-9 h-9 rounded-full bg-[#7c3aed] border border-white/10 flex items-center justify-center text-[13px] text-white font-black shadow-lg shadow-purple-500/10">
                    {user?.name?.[0] || 'U'}
                  </div>
                  <form onSubmit={handleAddComment} className="flex-1 group relative">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your thoughts with the team..."
                      className="w-full bg-[#1f2937] border border-[#374151] rounded-[12px] px-6 py-3 text-[14px] text-[#f9fafb] placeholder-[#6b7280] outline-none transition-all focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]/30"
                    />
                    <button 
                      type="submit" 
                      className="absolute right-2 top-1.5 p-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-[8px] shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                    >
                      <Send size={16} />
                    </button>
                  </form>
                </div>

                {/* Comment Cards */}
                <div className="space-y-6">
                  {comments.map(comment => (
                    <div key={comment.id} className="flex gap-5 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="w-9 h-9 rounded-xl bg-[#1f2937] border border-[#374151] flex items-center justify-center text-[12px] text-[#6366f1] font-black shrink-0">
                        {comment.user_name?.[0] || 'U'}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[14px] text-[#f3f4f6]">{comment.user_name}</span>
                          <span className="text-[12px] text-[#6b7280] font-medium">{new Date(comment.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="bg-[#1f2937] border border-[#374151] border-l-3 border-l-[#6366f1] p-5 rounded-[12px] rounded-tl-none shadow-sm">
                          <p className="text-[14px] text-[#d1d5db] leading-[1.6] whitespace-pre-wrap">{comment.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <div className="text-center py-16 bg-[#1f2937]/30 border-2 border-dashed border-[#374151] rounded-[24px]">
                      <MessageSquare size={36} className="mx-auto text-[#374151] mb-4" />
                      <p className="text-[14px] text-[#6b7280] font-medium uppercase tracking-widest">No comments yet. Start the discussion!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-32 text-[#64748b]">
            <X size={48} className="mb-4 opacity-10" />
            <p className="font-bold uppercase tracking-widest text-[12px]">Task Not Found</p>
          </div>
        )}

        {/* Footer */}
        <div className="px-8 py-5 bg-[#1f2937]/90 border-t border-[#374151] flex items-center justify-between backdrop-blur-sm">
          <div className="flex items-center gap-2 text-[#6b7280]">
             <Clock size={16} />
             <span className="text-[12px] font-semibold uppercase tracking-wide">Created {task?.created_at ? new Date(task.created_at).toLocaleDateString() : 'N/A'}</span>
          </div>
          <div className="flex items-center gap-4">
             <button 
               onClick={handleDeleteTask}
               className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[#991b1b]/10 text-[#fca5a5] hover:bg-[#991b1b] hover:text-white transition-all text-[12px] font-black border border-[#991b1b]/20"
             >
               <Trash2 size={16} />
               DELETE TASK
             </button>
             <button 
               onClick={onClose}
               className="px-6 py-2 bg-[#374151] hover:bg-[#4b5563] text-[#f9fafb] rounded-lg text-[12px] font-black transition-all active:scale-95 border border-[#4b5563]"
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
