import React, { useEffect, useState, useContext } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../contexts/AuthContext';
import TaskBoard from '../components/TaskBoard';
import MemberList from '../components/MemberList';
import TaskDetailModal from '../components/TaskDetailModal';
import ProgressBar from '../components/ProgressBar';
import ActivityLog from '../components/ActivityLog';
import Dashboard from './Dashboard';
import { Share2, Users, Layout, BarChart2, Activity } from 'lucide-react';

const ProjectDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedDesc, setEditedDesc] = useState('');
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [activeTab, setActiveTab] = useState('board');

  const fetchProjectData = async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/project/${id}`)
      ]);
      setProject(projRes.data);
      setTasks(tasksRes.data);
      setEditedName(projRes.data.name);
      setEditedDesc(projRes.data.description || '');
      
      // Handle openTaskId from navigation state
      if (location.state?.openTaskId) {
        setSelectedTaskId(location.state.openTaskId);
        // Clear state to avoid re-opening on refresh
        navigate(location.pathname, { replace: true, state: {} });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [id, location.state?.openTaskId]);

  const handleUpdateProject = async (updates) => {
    try {
      await api.put(`/projects/${id}`, updates);
      setProject(prev => ({ ...prev, ...updates }));
      if (updates.name) setEditedName(updates.name);
      if (updates.description) setEditedDesc(updates.description);
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleColorChange = async (color) => {
    try {
      await api.put(`/projects/${id}/theme`, { color });
      setProject(prev => ({ ...prev, personal_color: color }));
    } catch (error) {
      console.error('Error updating personal theme:', error);
    }
  };

  if (loading) return <div className="p-8">Loading project...</div>;
  if (!project) return <div className="p-8">Project not found</div>;

  const isAdmin = project.members.some(m => m.id === user.id && m.role === 'admin');
  const projectBg = project.personal_color || project.background_color || '#3b82f6';

  return (
    <div 
      className="min-h-screen -m-4 lg:-m-8 p-4 lg:p-8 flex flex-col animate-in fade-in duration-500 transition-colors duration-1000"
      style={{ backgroundColor: `${projectBg}15` }}
    >
      <div className="max-w-[1600px] w-full mx-auto flex flex-col space-y-8">
        <div className="flex flex-col gap-6 bg-white dark:bg-[#1e1f21] p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2" style={{ backgroundColor: projectBg }} />
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-50 dark:bg-[#2b2d30] rounded-2xl border border-gray-100 dark:border-gray-800">
                  <Layout className="text-blue-600" size={28} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    {isAdmin && isEditingName ? (
                      <input
                        autoFocus
                        className="text-3xl font-black text-gray-900 dark:text-white tracking-tight bg-transparent border-b-2 border-blue-500 outline-none w-full max-w-md"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        onBlur={() => {
                          setIsEditingName(false);
                          if (editedName !== project.name) handleUpdateProject({ name: editedName });
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                      />
                    ) : (
                      <h1 
                        onClick={() => isAdmin && setIsEditingName(true)}
                        className={`text-3xl font-black text-gray-900 dark:text-white tracking-tight ${isAdmin ? 'cursor-text hover:text-blue-600 transition-colors' : ''}`}
                      >
                        {project.name}
                      </h1>
                    )}
                    
                    {/* Color picker available for ALL members now */}
                    <div className="relative group">
                      <div 
                        className="w-5 h-5 rounded-full border-2 border-white dark:border-gray-800 shadow-sm cursor-pointer hover:scale-110 transition-transform"
                        style={{ backgroundColor: projectBg }}
                      />
                      <input 
                        type="color" 
                        value={projectBg}
                        onChange={(e) => handleColorChange(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                  
                  {isAdmin && isEditingDesc ? (
                    <input
                      autoFocus
                      className="text-gray-500 dark:text-gray-400 font-medium text-sm bg-transparent border-b border-gray-300 dark:border-gray-700 outline-none w-full max-w-lg mt-1"
                      value={editedDesc}
                      onChange={(e) => setEditedDesc(e.target.value)}
                      onBlur={() => {
                        setIsEditingDesc(false);
                        if (editedDesc !== project.description) handleUpdateProject({ description: editedDesc });
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                    />
                  ) : (
                    <p 
                      onClick={() => isAdmin && setIsEditingDesc(true)}
                      className={`text-gray-500 dark:text-gray-400 font-medium text-sm mt-1 ${isAdmin ? 'cursor-text hover:text-gray-700 dark:hover:text-gray-200 transition-colors' : ''}`}
                    >
                      {project.description || (isAdmin ? 'Add a description...' : '')}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-6 self-start md:self-center">
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Project Progress</span>
                <div className="w-48">
                  <ProgressBar projectId={id} tasks={tasks} />
                </div>
              </div>
              <div className="h-10 w-px bg-gray-100 dark:bg-gray-800" />
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2 mr-2">
                  {project.members.slice(0, 4).map(m => (
                    <div key={m.id} title={m.name} className="w-9 h-9 rounded-full border-2 border-white dark:border-[#1e1f21] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[11px] text-white font-black shadow-sm">
                      {m.name[0].toUpperCase()}
                    </div>
                  ))}
                  {project.members.length > 4 && (
                    <div className="w-9 h-9 rounded-full border-2 border-white dark:border-[#1e1f21] bg-gray-100 dark:bg-[#2b2d30] flex items-center justify-center text-[11px] text-gray-500 font-black shadow-sm">
                      +{project.members.length - 4}
                    </div>
                  )}
                </div>
                {isAdmin && (
                  <button 
                    onClick={() => setIsShareOpen(true)}
                    className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-2.5 rounded-[14px] font-black text-sm transition-all shadow-xl shadow-gray-500/10 active:scale-95"
                  >
                    <Users size={18} />
                    Team
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setActiveTab('board')}
            className={`flex items-center gap-2 px-6 py-3 font-bold text-sm border-b-2 transition-colors ${
              activeTab === 'board' 
                ? 'border-blue-600 text-blue-600 dark:text-blue-400' 
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Layout size={18} />
            Task Board
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-6 py-3 font-bold text-sm border-b-2 transition-colors ${
              activeTab === 'dashboard' 
                ? 'border-blue-600 text-blue-600 dark:text-blue-400' 
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <BarChart2 size={18} />
            Dashboard
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('activity')}
              className={`flex items-center gap-2 px-6 py-3 font-bold text-sm border-b-2 transition-colors ${
                activeTab === 'activity' 
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Activity size={18} />
              Activity Log
            </button>
          )}
        </div>

        <div className="w-full">
          {activeTab === 'board' ? (
            <TaskBoard 
              tasks={tasks} 
              projectId={id} 
              isAdmin={isAdmin} 
              members={project.members}
              columns={project.columns}
              onTaskUpdated={fetchProjectData}
              onTaskClick={(taskId) => setSelectedTaskId(taskId)}
            />
          ) : activeTab === 'dashboard' ? (
            <Dashboard projectId={id} onTaskClick={(taskId) => setSelectedTaskId(taskId)} />
          ) : activeTab === 'activity' && isAdmin ? (
            <ActivityLog projectId={id} />
          ) : null}
        </div>

        <MemberList 
          projectId={id} 
          members={project.members} 
          isAdmin={isAdmin}
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          onMemberUpdated={fetchProjectData}
        />

        {selectedTaskId && (
          <TaskDetailModal 
            taskId={selectedTaskId}
            projectId={id}
            onClose={() => setSelectedTaskId(null)}
            onTaskUpdated={fetchProjectData}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
