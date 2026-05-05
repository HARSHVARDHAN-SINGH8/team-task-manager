import React, { useContext } from 'react';
import { User, Clock, Pencil, Trash2, CheckCircle2, Circle, MessageSquare, Calendar } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';

const TaskCard = ({ task, isAdmin, onEdit, onToggleComplete, onDelete, onTaskClick }) => {
  const { user } = useContext(AuthContext);
  
  const priorityStyles = {
    high: {
      border: 'border-red-500/30',
      bg: 'bg-red-500/5',
      text: 'text-red-500',
      dot: 'bg-red-500',
      gradient: 'from-red-500/10 to-transparent'
    },
    medium: {
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/5',
      text: 'text-amber-500',
      dot: 'bg-amber-500',
      gradient: 'from-amber-500/10 to-transparent'
    },
    low: {
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/5',
      text: 'text-emerald-500',
      dot: 'bg-emerald-500',
      gradient: 'from-emerald-500/10 to-transparent'
    }
  };

  const style = priorityStyles[task.priority?.toLowerCase()] || priorityStyles.low;
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !task.is_completed;
  const canEdit = isAdmin;
  const canComplete = task.assigned_to === user?.id;

  const handleCardClick = () => {
    if (onTaskClick) {
      onTaskClick(task.id);
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`group relative overflow-hidden bg-white dark:bg-[#1e1f21] p-4 rounded-2xl shadow-sm hover:shadow-xl dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] border ${task.is_completed ? 'border-emerald-500/40' : 'border-gray-100 dark:border-[#2d2d3e]'} transition-all duration-300 cursor-pointer active:scale-[0.98]`}
    >
      {/* Background Accent Gradient */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${style.gradient} blur-3xl opacity-20 -mr-16 -mt-16 pointer-events-none`} />

      {/* Header Row: Priority & Actions */}
      <div className="flex justify-between items-start mb-3">
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${style.border} ${style.bg} ${style.text}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${style.dot} animate-pulse`} />
          {task.priority || 'Low'}
        </div>

        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {canEdit && (
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(task); }}
              className="p-1.5 bg-gray-50 dark:bg-[#2d2d3e] hover:bg-indigo-500/10 hover:text-indigo-500 rounded-lg transition-all text-gray-400"
            >
              <Pencil size={14} />
            </button>
          )}
          {isAdmin && (
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(task); }}
              className="p-1.5 bg-gray-50 dark:bg-[#2d2d3e] hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all text-gray-400"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Task Title */}
      <div className="flex items-start gap-3 mb-4">
        {canComplete && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleComplete(task); }}
            className={`mt-1 shrink-0 transition-all ${
              task.is_completed ? 'text-emerald-500' : 'text-gray-300 dark:text-gray-600 hover:text-emerald-500'
            }`}
          >
            {task.is_completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
          </button>
        )}
        <h4 className={`text-[15px] font-bold leading-snug tracking-tight transition-all ${
          task.is_completed 
            ? 'text-gray-400 dark:text-gray-600 line-through' 
            : 'text-gray-800 dark:text-gray-100'
        }`}>
          {task.title}
        </h4>
      </div>

      {/* Meta Info Row */}
      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-4">
          {/* Due Date */}
          {task.due_date && (
            <div className={`flex items-center gap-1.5 text-[12px] font-bold ${
              task.is_completed ? 'text-emerald-500/70' :
              isOverdue ? 'text-red-500' :
              'text-gray-400 dark:text-[#8c9bab]'
            }`}>
              <Calendar size={14} className={isOverdue && !task.is_completed ? 'animate-bounce' : ''} />
              {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </div>
          )}

          {/* Comments */}
          {task.comment_count > 0 ? (
            <div className="flex items-center gap-1.5 text-[12px] font-bold text-gray-400 dark:text-[#8c9bab]">
              <MessageSquare size={14} />
              {task.comment_count}
            </div>
          ) : null}
        </div>

        {/* Assignee */}
        {task.assigned_to ? (
          <div className="flex items-center gap-2 bg-gray-50/50 dark:bg-[#2d2d3e]/50 pl-1 pr-2.5 py-1 rounded-full border border-gray-100/50 dark:border-white/5">
            <div className={`w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] text-white font-black shadow-sm ring-2 ring-white dark:ring-[#1e1f21]`}>
              {task.assigned_name
                ? task.assigned_name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
                : 'U'
              }
            </div>
            <span className="text-[11px] font-black text-gray-500 dark:text-[#8c9bab] max-w-[80px] truncate">
              {task.assigned_name?.split(' ')[0] || 'User'}
            </span>
          </div>
        ) : null}
      </div>

      {/* Completion Progress Bar (optional subtle touch) */}
      {task.is_completed ? (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500/20">
          <div className="h-full bg-emerald-500 w-full" />
        </div>
      ) : null}
    </div>
  );
};

export default TaskCard;
