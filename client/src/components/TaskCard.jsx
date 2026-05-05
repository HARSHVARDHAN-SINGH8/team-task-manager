import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Clock, Pencil, Trash2, CheckCircle, Circle } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';

const TaskCard = ({ task, isAdmin, onEdit, onToggleComplete, onDelete, onTaskClick }) => {
  const { user } = useContext(AuthContext);
  
  // Trello-style thin color label strip
  const priorityColors = {
    low: 'bg-[#4bce97]',
    medium: 'bg-[#e2b203]',
    high: 'bg-[#f87462]'
  };

  // Priority badge styles
  const priorityBadge = {
    high:   { bg: 'bg-[#7f1d1d]', text: 'text-[#fca5a5]', label: '● High' },
    medium: { bg: 'bg-[#78350f]', text: 'text-[#fde68a]', label: '● Medium' },
    low:    { bg: 'bg-[#1e3a5f]', text: 'text-[#93c5fd]', label: '● Low' },
  };
  const badge = priorityBadge[task.priority?.toLowerCase()] || priorityBadge.low;

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
      className={`group bg-white dark:bg-[#2b2d30] p-3 rounded-xl shadow-sm hover:shadow-md dark:shadow-[0_2px_4px_rgba(0,0,0,0.4)] hover:ring-2 hover:ring-blue-500/50 transition-all cursor-pointer border ${task.is_completed ? 'border-green-500/50 dark:border-green-500/50' : 'border-transparent dark:border-[#383a3f]'} active:scale-[0.98]`}
    >
      {/* Top Row: Completion Toggle, Edit, Delete */}
      <div className="flex justify-end items-start mb-1.5">
        
        <div className="flex gap-1">
          {canComplete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleComplete(task);
              }}
              title={task.is_completed ? "Mark incomplete" : "Mark complete"}
              className={`p-1 rounded-lg transition-all shadow-sm ${
                task.is_completed 
                  ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400' 
                  : 'bg-gray-50 dark:bg-[#383a3f] hover:bg-green-50 dark:hover:bg-green-900/20 text-gray-400 hover:text-green-500'
              }`}
            >
              {task.is_completed ? <CheckCircle size={14} /> : <Circle size={14} />}
            </button>
          )}

          {canEdit && (
            <button 
              onClick={(e) => { 
                e.stopPropagation();
                onEdit(task); 
              }}
              className="p-1 bg-gray-50 dark:bg-[#383a3f] hover:bg-gray-200 dark:hover:bg-[#45474d] rounded-lg transition-all text-gray-500 dark:text-gray-300 shadow-sm"
            >
              <Pencil size={14} />
            </button>
          )}

          {isAdmin && (
            <button 
              onClick={(e) => { 
                e.stopPropagation();
                onDelete(task); 
              }}
              className="p-1 bg-gray-50 dark:bg-[#383a3f] hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-all text-gray-500 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 shadow-sm"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Labels Row — thin colored strip */}
      <div className="flex flex-wrap gap-1 mb-1.5">
        <div className={`h-1 w-8 rounded-full ${priorityColors[task.priority?.toLowerCase()]}`} title={`Priority: ${task.priority}`} />
      </div>

      {/* Priority Badge — always visible pill */}
      {task.priority && (
        <div className="mb-1.5">
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${badge.bg} ${badge.text}`}>
            {badge.label}
          </span>
        </div>
      )}

      <h4 className={`text-sm font-semibold text-gray-800 dark:text-[#b6c2cf] mb-2 leading-tight ${task.is_completed ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
        {task.title}
      </h4>

      {/* Footer Row: Date | Assignee | Comments */}
      <div className="flex items-center justify-between mt-auto pt-1">
        {/* LEFT: Due Date */}
        <div className="text-[11px] font-bold">
          {task.due_date ? (
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-[4px] ${
              task.is_completed ? 'bg-green-500/15 text-green-400' :
              isOverdue ? 'bg-red-500/15 text-red-400' :
              'text-gray-500 dark:text-[#8c9bab]'
            }`}>
              📅 {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          ) : (
            <span className="text-transparent">—</span>
          )}
        </div>

        {/* MIDDLE: Assignee avatar + Name */}
        <div className="flex items-center">
          {task.assigned_to ? (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-600 border-2 border-white dark:border-[#2b2d30] flex items-center justify-center text-[10px] text-white font-black shadow-sm shrink-0">
                {task.assigned_name
                  ? task.assigned_name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
                  : task.assigned_to.toString().slice(0, 1)
                }
              </div>
              <span className="text-[10px] font-bold text-gray-500 dark:text-[#8c9bab] max-w-[60px] truncate">
                {task.assigned_name || 'User'}
              </span>
            </div>
          ) : null}
        </div>

        {/* RIGHT: Comment count */}
        <div className="text-[11px] font-bold text-gray-500 dark:text-[#8c9bab]">
          {task.comment_count > 0 ? (
            <span className="flex items-center gap-1">💬 {task.comment_count}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
