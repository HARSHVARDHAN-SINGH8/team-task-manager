import React, { useEffect, useState, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../contexts/AuthContext';
import { Layout, Calendar, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const { user } = useContext(AuthContext);
  const [summary, setSummary] = useState({ projects: [], tasks: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [projRes, taskRes] = await Promise.all([
          api.get('/projects'),
          api.get('/tasks/me')
        ]);
        setSummary({ projects: projRes.data, tasks: taskRes.data });
      } catch (error) {
        console.error('Home data fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  if (loading) return <div className="p-8 text-center font-bold">Loading Workspace...</div>;

  const upcomingTasks = summary.tasks.filter(t => !t.is_completed).slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700">
      <header className="py-10 text-center space-y-4">
        <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">
          Good day, {user.name.split(' ')[0]}!
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Here's what's happening in your workspace today.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Projects Quick Access */}
          <section className="space-y-4">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Layout size={16} /> Recent Projects
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {summary.projects.slice(0, 4).map(project => (
                <Link 
                  key={project.id} 
                  to={`/projects/${project.id}`}
                  className="p-6 bg-white dark:bg-[#1e1f21] border border-gray-100 dark:border-gray-800 rounded-[2rem] hover:shadow-2xl hover:shadow-blue-500/10 transition-all group"
                >
                  <div className="w-12 h-12 bg-blue-600/10 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Layout size={24} />
                  </div>
                  <h3 className="font-black text-lg text-gray-900 dark:text-white">{project.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{project.description}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* Upcoming Tasks */}
          <section className="space-y-4">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Clock size={16} /> Upcoming Deadlines
            </h2>
            <div className="bg-white dark:bg-[#1e1f21] border border-gray-100 dark:border-gray-800 rounded-[2rem] overflow-hidden shadow-sm">
              {upcomingTasks.length === 0 ? (
                <div className="p-12 text-center text-gray-400 font-bold">No upcoming deadlines. Relax!</div>
              ) : (
                <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
                  {upcomingTasks.map(task => (
                    <div key={task.id} className="p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[#2b2d30] transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-1.5 h-6 rounded-full ${task.priority === 'high' ? 'bg-red-500' : 'bg-blue-500'}`} />
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{task.title}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">{task.project_name}</p>
                        </div>
                      </div>
                      <div className="text-[11px] font-black text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full uppercase">
                        {new Date(task.due_date).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          <section className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-500/20">
            <CheckCircle size={48} className="mb-6 opacity-40" />
            <h3 className="text-2xl font-black leading-tight">You've got tasks to tackle!</h3>
            <p className="mt-2 text-blue-100 font-medium">You have {summary.tasks.filter(t => !t.is_completed).length} items waiting for your attention.</p>
            <Link to="/my-tasks" className="mt-8 inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-2xl font-black text-sm hover:scale-105 transition-transform active:scale-95">
              My Tasks <ArrowRight size={16} />
            </Link>
          </section>

          <section className="p-8 bg-white dark:bg-[#1e1f21] border border-gray-100 dark:border-gray-800 rounded-[2.5rem]">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Productivity Tip</h2>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl">
              <p className="text-sm text-amber-800 dark:text-amber-400 font-medium">"Focus on one high-priority task at a time for maximum impact today."</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Home;
