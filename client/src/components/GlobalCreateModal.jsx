import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { X, Plus, Folder, LayoutDashboard, Calendar, Users, Target } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';

const GlobalCreateModal = ({ isOpen, onClose }) => {
  const [type, setType] = useState('task'); // 'task' or 'project'
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useNotification();
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    dueDate: '',
    priority: 'medium'
  });

  useEffect(() => {
    if (isOpen) {
      const fetchProjects = async () => {
        try {
          const res = await api.get('/projects');
          setProjects(res.data);
          if (res.data.length > 0) {
            setFormData(prev => ({ ...prev, projectId: res.data[0].id }));
          }
        } catch (error) {
          console.error(error);
        }
      };
      fetchProjects();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (type === 'project') {
        const res = await api.post('/projects', {
          name: formData.title,
          description: formData.description
        });
        showToast('Project created successfully', 'success');
        navigate(`/projects/${res.data.id}`);
      } else {
        await api.post(`/tasks/project/${formData.projectId}`, {
          title: formData.title,
          description: formData.description,
          due_date: formData.dueDate,
          priority: formData.priority
        });
        showToast('Task created successfully', 'success');
        navigate(`/projects/${formData.projectId}`);
      }
      onClose();
    } catch (error) {
      showToast('Creation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-[#1e1f21] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
            <Plus className="text-blue-600" />
            Quick Create
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex p-1 bg-gray-100 dark:bg-[#2b2d30] rounded-xl">
            <button 
              type="button"
              onClick={() => setType('task')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${type === 'task' ? 'bg-white dark:bg-[#383a3f] shadow-sm text-blue-600' : 'text-gray-500'}`}
            >
              <LayoutDashboard size={16} /> Task
            </button>
            <button 
              type="button"
              onClick={() => setType('project')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${type === 'project' ? 'bg-white dark:bg-[#383a3f] shadow-sm text-blue-600' : 'text-gray-500'}`}
            >
              <Folder size={16} /> Project
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Title</label>
              <input 
                required
                className="w-full bg-gray-50 dark:bg-[#2b2d30] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 dark:text-white"
                placeholder={type === 'task' ? "Task name..." : "Project name..."}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            {type === 'task' && (
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Project</label>
                <select 
                  className="w-full bg-gray-50 dark:bg-[#2b2d30] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 dark:text-white"
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                >
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Description</label>
              <textarea 
                className="w-full bg-gray-50 dark:bg-[#2b2d30] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 dark:text-white min-h-[100px]"
                placeholder="Optional details..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {type === 'task' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Due Date</label>
                  <input 
                    type="date"
                    className="w-full bg-gray-50 dark:bg-[#2b2d30] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 dark:text-white"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Priority</label>
                  <select 
                    className="w-full bg-gray-50 dark:bg-[#2b2d30] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 dark:text-white"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <button 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Creating...' : `Create ${type === 'task' ? 'Task' : 'Project'}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GlobalCreateModal;
