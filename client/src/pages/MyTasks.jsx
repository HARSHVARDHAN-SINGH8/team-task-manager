import React, { useEffect, useState, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../contexts/AuthContext';
import { Clock, Flag, CheckCircle, List, Layout } from 'lucide-react';
import TaskDetailModal from '../components/TaskDetailModal';

const MyTasks = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const fetchMyTasks = async () => {
    try {
      const res = await api.get('/tasks/me');
      setTasks(res.data);
    } catch (error) {
      console.error('Error fetching my tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const openTask = (task) => {
    setSelectedTaskId(task.id);
    setSelectedProjectId(task.project_id);
  };

  if (loading) return <div className="p-8 text-center">Loading your tasks...</div>;

  const incompleteTasks = tasks.filter(t => !t.is_completed);
  const completedTasks = tasks.filter(t => t.is_completed);

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <CheckCircle className="text-blue-600" size={32} />
            My Tasks
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Manage all your personal assignments here.</p>
        </div>
        <div className="bg-blue-600/10 text-blue-600 px-4 py-2 rounded-2xl text-sm font-black uppercase tracking-widest">
          {incompleteTasks.length} Pending
        </div>
      </header>

      <div className="space-y-12">
        {/* Pending Section */}
        <section className="space-y-4">
          <h2 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <List size={16} /> Pending Tasks
          </h2>
          {incompleteTasks.length === 0 ? (
            <div className="p-12 text-center bg-gray-50 dark:bg-[#1e1f21] rounded-[2rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
              <CheckCircle size={48} className="mx-auto text-gray-200 dark:text-gray-800 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-bold">You're all caught up!</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {incompleteTasks.map(task => (
                <div 
                  key={task.id}
                  onClick={() => openTask(task)}
                  className="flex items-center gap-6 p-5 bg-white dark:bg-[#1e1f21] border border-gray-100 dark:border-gray-800 rounded-2xl hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer group hover:-translate-y-1"
                >
                  <div className={`w-2 h-10 rounded-full ${
                    task.priority === 'high' ? 'bg-red-500' :
                    task.priority === 'medium' ? 'bg-amber-500' : 'bg-gray-300'
                  }`} />
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{task.title}</h3>
                    <div className="flex items-center gap-4 mt-1 text-[11px] text-gray-400 font-bold uppercase tracking-tight">
                      <span className="flex items-center gap-1"><Layout size={12} /> {task.project_name}</span>
                      <span className="flex items-center gap-1"><List size={12} /> {task.list_name || 'Board'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {task.due_date && (
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-black uppercase ${
                        new Date(task.due_date) < new Date() ? 'bg-red-500/10 text-red-500' : 'bg-gray-100 dark:bg-[#2b2d30] text-gray-500'
                      }`}>
                        <Clock size={12} />
                        {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>
                    )}
                    <Flag size={18} className={
                      task.priority === 'high' ? 'text-red-500' :
                      task.priority === 'medium' ? 'text-amber-500' : 'text-gray-300'
                    } />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Completed Section */}
        {completedTasks.length > 0 && (
          <section className="space-y-4 opacity-60 hover:opacity-100 transition-opacity">
            <h2 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <CheckCircle size={16} /> Completed
            </h2>
            <div className="grid gap-3">
              {completedTasks.map(task => (
                <div 
                  key={task.id}
                  onClick={() => openTask(task)}
                  className="flex items-center gap-6 p-4 bg-gray-50/50 dark:bg-[#1e1f21]/50 border border-transparent rounded-2xl transition-all cursor-pointer grayscale hover:grayscale-0"
                >
                  <CheckCircle size={20} className="text-green-500" />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-500 dark:text-gray-400 line-through">{task.title}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{task.project_name}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {selectedTaskId && (
        <TaskDetailModal 
          taskId={selectedTaskId}
          projectId={selectedProjectId}
          onClose={() => setSelectedTaskId(null)}
          onTaskUpdated={fetchMyTasks}
        />
      )}
    </div>
  );
};

export default MyTasks;
