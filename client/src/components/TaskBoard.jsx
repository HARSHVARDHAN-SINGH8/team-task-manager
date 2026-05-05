import React, { useState, useRef, useEffect } from 'react';
import TaskCard from './TaskCard';
import { Plus, X, MoreHorizontal, Layout, Trash2 } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import api from '../api/axios';
import { useNotification } from '../contexts/NotificationContext';
import { AuthContext } from '../contexts/AuthContext';
import { useContext } from 'react';

const TaskBoard = ({ tasks, projectId, isAdmin, members, columns = [], onTaskUpdated, onTaskClick }) => {
  const { user } = useContext(AuthContext);
  const { showToast, confirmAction } = useNotification();
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  
  // Quick Add State for Cards
  const [addingTaskStatus, setAddingTaskStatus] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const quickAddInputRef = useRef(null);

  // Clear title when switching columns to fix "memory" bug
  const handleSetAddingStatus = (statusId) => {
    if (addingTaskStatus !== statusId) {
      setNewTaskTitle('');
    }
    setAddingTaskStatus(statusId);
  };

  // Add List State
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

  // Modal Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [statusToUpdate, setStatusToUpdate] = useState('');

  // Local state for optimistic updates
  const [localTasks, setLocalTasks] = useState(tasks);
  const [showListActions, setShowListActions] = useState(null);

  const openModal = (task = null, defaultListId = null) => {
    if (task) {
      setEditingTask(task);
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority || 'medium');
      
      // Format to YYYY-MM-DDThh:mm for datetime-local input
      let formattedDate = '';
      if (task.due_date) {
        const d = new Date(task.due_date);
        // Adjust for local timezone offset before converting to ISO string
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        formattedDate = d.toISOString().slice(0, 16);
      }
      setDueDate(formattedDate);
      
      setAssignedTo(task.assigned_to || '');
      setStatusToUpdate(task.list_id || (columns.length > 0 ? columns[0].id : ''));
    } else {
      setEditingTask(null);
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      setAssignedTo(user.id);
      setStatusToUpdate(defaultListId || (columns.length > 0 ? columns[0].id : ''));
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTask(null);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    try {
      const taskData = {
        title,
        description,
        priority,
        due_date: dueDate || null,
        assigned_to: assignedTo || null,
        list_id: statusToUpdate || (columns.length > 0 ? columns[0].id : null)
      };

      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, taskData);
      } else {
        await api.post(`/tasks/project/${projectId}`, taskData);
      }
      
      closeModal();
      onTaskUpdated();
    } catch (error) {
      console.error('Error saving task:', error);
      showToast(error.response?.data?.message || 'Error saving task', 'error');
    }
  };

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    if (addingTaskStatus && quickAddInputRef.current) {
      quickAddInputRef.current.focus();
    }
  }, [addingTaskStatus]);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // Optimistic UI Update
    const newTasks = Array.from(localTasks);
    const taskIndex = newTasks.findIndex(t => t.id.toString() === draggableId);
    if (taskIndex === -1) return;

    const updatedTask = { ...newTasks[taskIndex], list_id: parseInt(destination.droppableId) };
    newTasks[taskIndex] = updatedTask;
    setLocalTasks(newTasks);

    try {
      await api.put(`/tasks/${draggableId}`, { list_id: destination.droppableId });
      onTaskUpdated();
    } catch (error) {
      console.error('Failed to update task status:', error);
      setLocalTasks(tasks); // Rollback
    }
  };

  const handleToggleComplete = async (task) => {
    const updatedTasks = localTasks.map(t => 
      t.id === task.id ? { ...t, is_completed: !t.is_completed } : t
    );
    setLocalTasks(updatedTasks);
    try {
      await api.put(`/tasks/${task.id}`, { is_completed: !task.is_completed ? 1 : 0 });
      onTaskUpdated();
    } catch (error) {
      console.error('Failed to toggle completion:', error);
      setLocalTasks(tasks);
    }
  };

  const handleDeleteTask = (task) => {
    confirmAction({
      title: 'Delete Task',
      message: `Are you sure you want to delete "${task.title}"?`,
      type: 'danger',
      confirmText: 'Delete',
      onConfirm: async () => {
        const updatedTasks = localTasks.filter(t => t.id !== task.id);
        setLocalTasks(updatedTasks);
        try {
          await api.delete(`/tasks/${task.id}`);
          onTaskUpdated();
          showToast('Task deleted', 'success');
        } catch (error) {
          console.error('Failed to delete task:', error);
          const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Failed to delete task';
          showToast(errorMsg, 'error');
          setLocalTasks(tasks);
        }
      }
    });
  };

  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || isSubmittingTask) return;

    setIsSubmittingTask(true);
    try {
      await api.post(`/tasks/project/${projectId}`, { 
        title: newTaskTitle.trim(), 
        list_id: addingTaskStatus,
        priority: 'medium' 
      });
      setNewTaskTitle('');
      setAddingTaskStatus(null);
      onTaskUpdated();
    } catch (error) {
      console.error('Error adding task:', error);
      showToast('Failed to add card. Please try again.', 'error');
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const handleAddList = async (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;

    try {
      await api.post(`/projects/${projectId}/columns`, { name: newListTitle });
      setNewListTitle('');
      setIsAddingList(false);
      onTaskUpdated();
    } catch (error) {
      console.error('Error adding list:', error);
    }
  };

  const handleDeleteList = (columnId) => {
    confirmAction({
      title: 'Delete List',
      message: 'Are you sure you want to delete this list? All tasks in this list will be affected.',
      type: 'danger',
      confirmText: 'Delete List',
      onConfirm: async () => {
        try {
          await api.delete(`/projects/${projectId}/columns/${columnId}`);
          onTaskUpdated();
          setShowListActions(null);
          showToast('List deleted', 'success');
        } catch (error) {
          console.error('Error deleting list:', error);
          showToast('Failed to delete list', 'error');
        }
      }
    });
  };

  const handleMoveAllTasks = async (fromListId, toListId) => {
    const tasksToMove = localTasks.filter(t => t.list_id === fromListId);
    if (tasksToMove.length === 0) return;

    // Optimistic Update
    const updatedTasks = localTasks.map(t => 
      t.list_id === fromListId ? { ...t, list_id: toListId } : t
    );
    setLocalTasks(updatedTasks);
    setShowListActions(null);

    try {
      await Promise.all(tasksToMove.map(t => api.put(`/tasks/${t.id}`, { list_id: toListId })));
      onTaskUpdated();
    } catch (error) {
      console.error('Error moving all tasks:', error);
      // Rollback on error
      onTaskUpdated();
      showToast('Failed to move some tasks. Refreshing board.', 'error');
    }
  };

  const handleClearColumn = (columnId, columnName) => {
    const tasksToClear = localTasks.filter(t => t.list_id === columnId);
    if (tasksToClear.length === 0) return;

    confirmAction({
      title: 'Clear Column',
      message: `Are you sure you want to delete all ${tasksToClear.length} tasks in ${columnName}?`,
      type: 'danger',
      confirmText: 'Clear All',
      onConfirm: async () => {
        const updatedTasks = localTasks.filter(t => t.list_id !== columnId);
        setLocalTasks(updatedTasks);
        setShowListActions(null);

        try {
          await Promise.all(tasksToClear.map(t => api.delete(`/tasks/${t.id}`)));
          onTaskUpdated();
          showToast('Column cleared', 'success');
        } catch (error) {
          console.error('Error clearing column:', error);
          onTaskUpdated();
          showToast('Failed to clear some tasks. Refreshing board.', 'error');
        }
      }
    });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center mb-6 px-1">
        <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100 tracking-tight flex items-center gap-2">
          <Layout className="text-blue-600" size={24} />
          Task Board
        </h2>
        {isAdmin && (
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
          >
            <Plus size={16} />
            New Task
          </button>
        )}
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4 custom-scrollbar">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6 h-full items-start px-1">
            {columns.map(column => (
              <div 
                key={column.id} 
                className="bg-slate-100/50 dark:bg-[#101214] rounded-2xl flex flex-col w-[320px] min-w-[320px] max-h-full border border-slate-200/50 dark:border-[#2b2d30] shadow-sm transition-all"
              >
                {/* Column Header */}
                <div className="px-5 py-4 flex items-center justify-between">
                  <h3 className="font-bold text-sm text-gray-700 dark:text-[#b6c2cf] flex items-center gap-2 truncate">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]"></span>
                    {column.name}
                  </h3>
                  <div className="flex items-center gap-2 relative">
                    <span className="text-[10px] bg-gray-200 dark:bg-[#2b2d30] text-gray-600 dark:text-[#8c9bab] px-2 py-0.5 rounded-full font-black">
                      {localTasks.filter(t => t.list_id === column.id).length}
                    </span>
                    {isAdmin && (
                      <>
                        <button 
                          onClick={() => setShowListActions(showListActions === column.id ? null : column.id)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition p-1.5 hover:bg-gray-200 dark:hover:bg-[#2b2d30] rounded-lg active:scale-95"
                        >
                          <MoreHorizontal size={18} />
                        </button>

                        {/* Click-away overlay */}
                        {showListActions === column.id && (
                          <div 
                            className="fixed inset-0 z-[90]" 
                            onClick={() => setShowListActions(null)}
                          />
                        )}
                      </>
                    )}

                    {/* List Actions Dropdown */}
                    {showListActions === column.id && (
                      <div className="absolute right-0 top-10 w-56 bg-white dark:bg-[#2b2d30] rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 py-2 z-[100] animate-in fade-in slide-in-from-top-2">
                        <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 mb-1">
                          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">List Actions</h4>
                        </div>
                        <button 
                          onClick={() => { openModal(null, column.id); setShowListActions(null); }}
                          className="w-full px-4 py-2 text-left text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#383a3f] transition-colors"
                        >
                          Add a card...
                        </button>
                        {columns.filter(c => c.id !== column.id).map(targetCol => (
                          <button 
                            key={targetCol.id}
                            onClick={() => handleMoveAllTasks(column.id, targetCol.id)}
                            className="w-full px-4 py-2 text-left text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#383a3f] transition-colors"
                          >
                            Move all to {targetCol.name}
                          </button>
                        ))}
                        <button 
                          onClick={() => handleClearColumn(column.id, column.name)}
                          className="w-full px-4 py-2 text-left text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#383a3f] transition-colors"
                        >
                          Clear column
                        </button>
                        <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>
                        <button 
                          onClick={() => handleDeleteList(column.id)}
                          className="w-full px-4 py-2 text-left text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                        >
                          <Trash2 size={14} />
                          Delete list
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Task List */}
                <div className="flex-1 overflow-y-auto px-2 pb-2 custom-scrollbar min-h-[50px]">
                  <Droppable droppableId={column.id.toString()}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`space-y-2 min-h-[50px] transition-colors rounded-xl p-1 ${snapshot.isDraggingOver ? 'bg-blue-500/5' : ''}`}
                      >
                        {localTasks
                          .filter(task => task.list_id === column.id)
                          .map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id.toString()} index={index} isDragDisabled={!isAdmin}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={{
                                    ...provided.draggableProps.style,
                                    transform: snapshot.isDragging ? provided.draggableProps.style?.transform : 'none'
                                  }}
                                  className={snapshot.isDragging ? 'z-[1000]' : ''}
                                >
                                  <TaskCard 
                                    task={task} 
                                    isAdmin={isAdmin} 
                                    onEdit={openModal}
                                    onToggleComplete={handleToggleComplete}
                                    onDelete={handleDeleteTask}
                                    onTaskClick={onTaskClick}
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>

                  {/* Quick Add Button at Bottom */}
                  {isAdmin && (
                    <button 
                      onClick={() => openModal(null, column.id)}
                      className="w-full flex items-center gap-2 p-3 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#2b2d30] rounded-xl transition-all text-sm font-bold group mt-2"
                    >
                      <Plus size={16} className="group-hover:text-blue-500 transition-colors" />
                      Add a card
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Add Another List Section */}
            {isAddingList ? (
              <div className="w-[320px] min-w-[320px] bg-gray-100 dark:bg-[#101214] rounded-2xl p-4 border border-transparent dark:border-[#2b2d30] shadow-sm h-fit animate-in fade-in slide-in-from-left-2">
                <form onSubmit={handleAddList} className="space-y-3">
                  <input
                    autoFocus
                    type="text"
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    placeholder="Enter list title..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#2b2d30] border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-bold"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 active:scale-95"
                    >
                      Add list
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingList(false)}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl text-gray-500"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <button 
                onClick={() => setIsAddingList(true)}
                className="w-[320px] min-w-[320px] h-12 bg-white/50 dark:bg-[#1e1f21]/50 hover:bg-white/80 dark:hover:bg-[#1e1f21]/80 backdrop-blur-sm border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 font-bold transition-all hover:border-blue-500 group"
              >
                <Plus size={20} className="group-hover:text-blue-600 transition-colors" />
                Add another list
              </button>
            )}
          </div>
        </DragDropContext>
      </div>

      {/* Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[200] animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1e1f21] rounded-2xl p-6 md:p-8 w-full max-w-lg shadow-2xl border border-gray-100 dark:border-gray-800 scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">
                {editingTask ? 'Edit Task' : 'New Task'}
              </h3>
              <button 
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleModalSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  required 
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#101214] border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all dark:text-white font-medium"
                  placeholder="Task title..."
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Description</label>
                <textarea 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  rows="3"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#101214] border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all dark:text-white resize-none custom-scrollbar font-medium"
                  placeholder="Add a more detailed description..."
                ></textarea>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">List</label>
                    <select 
                      value={statusToUpdate} 
                      onChange={e => setStatusToUpdate(e.target.value)}
                      disabled={!isAdmin}
                      className={`w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#101214] border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all dark:text-white font-medium appearance-none ${!isAdmin ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      {columns.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Priority</label>
                  <select 
                    value={priority} 
                    onChange={e => setPriority(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#101214] border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all dark:text-white font-medium appearance-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Due Date</label>
                  <input 
                    type="datetime-local" 
                    value={dueDate} 
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#101214] border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all dark:text-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Assign To</label>
                  <select 
                    value={assignedTo} 
                    onChange={e => setAssignedTo(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#101214] border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all dark:text-white font-medium appearance-none"
                  >
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name} (ID: {m.id})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 mt-6 border-t border-gray-100 dark:border-gray-800">
                <button 
                  type="button" 
                  onClick={closeModal} 
                  className="px-6 py-2.5 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                >
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskBoard;
