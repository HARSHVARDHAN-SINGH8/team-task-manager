import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid 
} from 'recharts';
import { AlertCircle, CheckCircle, Clock, LayoutDashboard, Activity, Zap } from 'lucide-react';
import api from '../api/axios';

const Dashboard = ({ projectId, onTaskClick }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get(`/tasks/project/${projectId}/dashboard`);
        setData(res.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    if (projectId) fetchDashboard();
  }, [projectId]);

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">Failed to load dashboard</div>;

  const pieData = Object.entries(data.byStatus || {}).map(([name, value]) => {
    const colors = { 
      'To Do': '#4bce97', 
      'In Progress': '#e2b203', 
      'Done': '#f87462',
      'todo': '#4bce97',
      'doing': '#e2b203',
      'done': '#22c55e'
    };
    // Try case-insensitive match or fallback
    const match = Object.keys(colors).find(k => k.toLowerCase() === name.toLowerCase());
    return { name, value, color: match ? colors[match] : '#8b5cf6' };
  }).filter(d => d.value > 0);

  const priorityData = Object.entries(data.byPriority || {}).map(([name, value]) => {
    const colors = { high: '#ef4444', medium: '#f59e0b', low: '#3b82f6' };
    return { name: name.charAt(0).toUpperCase() + name.slice(1), value, color: colors[name.toLowerCase()] || '#8b5cf6' };
  }).filter(d => d.value > 0);

  const barData = Object.entries(data.perUser || {}).map(([userId, count]) => ({
    name: `User ${userId}`,
    Tasks: count
  }));

  const timelineData = Object.entries(data.createdPerDay || {})
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
    .map(([date, count]) => ({
      date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      Tasks: count
    }));

  const productivityData = Object.entries(data.perUser || {}).map(([userId, total]) => ({
    name: `User ${userId}`,
    Total: total,
    Completed: data.completedPerUser[userId] || 0
  }));

  const doneTasks = data.completedTasks || 0;
  const completionRate = data.total > 0 ? Math.round((doneTasks / data.total) * 100) : 0;
  const projectHealth = Math.max(0, 100 - ((data.overdue?.length || 0) * 10));

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-8">
      
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-[#2b2d30] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-[#383a3f] flex items-center gap-4 transition-all hover:shadow-md">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
            <LayoutDashboard size={20} />
          </div>
          <div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Total Tasks</p>
            <p className="text-xl font-black text-gray-900 dark:text-white">{data.total}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#2b2d30] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-[#383a3f] flex items-center gap-4 transition-all hover:shadow-md">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl text-green-600 dark:text-green-400">
            <CheckCircle size={20} />
          </div>
          <div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Completion</p>
            <p className="text-xl font-black text-gray-900 dark:text-white">{completionRate}%</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#2b2d30] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-[#383a3f] flex items-center gap-4 transition-all hover:shadow-md">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Zap size={20} />
          </div>
          <div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Project Health</p>
            <p className="text-xl font-black text-gray-900 dark:text-white">{projectHealth}%</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-[#2b2d30] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-[#383a3f] flex items-center gap-4 transition-all hover:shadow-md">
          <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl text-orange-600 dark:text-orange-400">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Upcoming</p>
            <p className="text-xl font-black text-gray-900 dark:text-white">{(data.upcoming || []).length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#2b2d30] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-[#383a3f] flex items-center gap-4 transition-all hover:shadow-md">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-600 dark:text-red-400">
            <AlertCircle size={20} />
          </div>
          <div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Overdue</p>
            <p className="text-xl font-black text-gray-900 dark:text-white">{(data.overdue || []).length}</p>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Status Distribution */}
        <div className="bg-white dark:bg-[#2b2d30] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-[#383a3f]">
          <h2 className="text-sm font-bold mb-6 text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
            <Activity size={16} className="text-blue-500" />
            Status Distribution
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="bg-white dark:bg-[#2b2d30] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-[#383a3f]">
          <h2 className="text-sm font-bold mb-6 text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
            <Zap size={16} className="text-orange-500" />
            Priority Breakdown
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={priorityData} cx="50%" cy="50%" innerRadius={0} outerRadius={80} dataKey="value">
                  {priorityData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Workload Share */}
        <div className="bg-white dark:bg-[#2b2d30] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-[#383a3f]">
          <h2 className="text-sm font-bold mb-6 text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
            <LayoutDashboard size={16} className="text-green-500" />
            Workload Share
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={Object.entries(data.perUser || {}).map(([userId, count], index) => {
                    const colors = ['#8b5cf6', '#06b6d4', '#f43f5e', '#10b981', '#f59e0b', '#3b82f6'];
                    return { name: `User ${userId}`, value: count, color: colors[index % colors.length] };
                  })} 
                  cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={2} dataKey="value"
                >
                  {Object.entries(data.perUser || {}).map(([userId, count], index) => {
                    const colors = ['#8b5cf6', '#06b6d4', '#f43f5e', '#10b981', '#f59e0b', '#3b82f6'];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Velocity */}
        <div className="bg-white dark:bg-[#2b2d30] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-[#383a3f]">
          <h2 className="text-sm font-bold mb-6 text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
            <Activity size={16} className="text-indigo-500" />
            Creation Velocity
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" fontSize={10} axisLine={false} tickLine={false} interval={0} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="Tasks" stroke="#6366f1" fillOpacity={1} fill="url(#colorTasks)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Secondary Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resource Workload (Horizontal) */}
        <div className="bg-white dark:bg-[#2b2d30] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-[#383a3f]">
          <h2 className="text-sm font-bold mb-6 text-gray-900 dark:text-white uppercase tracking-widest">Resource Allocation</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="Tasks" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Team Productivity (Vertical Bar Chart) */}
        <div className="bg-white dark:bg-[#2b2d30] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-[#383a3f]">
          <h2 className="text-sm font-bold mb-6 text-gray-900 dark:text-white uppercase tracking-widest">Team Productivity</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productivityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'rgba(59, 130, 246, 0.05)'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="Total" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="Completed" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Deadlines Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming List */}
        <div className="bg-white dark:bg-[#2b2d30] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-[#383a3f] flex flex-col h-[350px]">
          <h2 className="text-xs font-black mb-4 flex items-center gap-2 text-orange-500 uppercase tracking-tighter">
            <Clock size={16} /> Upcoming
          </h2>
          <div className="overflow-y-auto custom-scrollbar pr-2 flex-1">
            {(!data.upcoming || data.upcoming.length === 0) ? (
              <p className="text-[11px] font-medium text-gray-400">No tasks due soon.</p>
            ) : (
              <div className="space-y-2">
                {data.upcoming.map(task => (
                  <div 
                    key={task.id} 
                    onClick={() => onTaskClick?.(task.id)}
                    className="block p-3 bg-gray-50 dark:bg-[#1e1f21] hover:bg-orange-50 dark:hover:bg-orange-900/10 rounded-xl transition-all border border-transparent hover:border-orange-200 dark:hover:border-orange-900/50 group cursor-pointer"
                  >
                    <h3 className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-orange-600 transition-colors truncate">{task.title}</h3>
                    <p className="text-[10px] text-gray-400 mt-1">{new Date(task.due_date).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-[#2b2d30] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-[#383a3f] lg:col-span-1 flex flex-col h-[350px]">
          <h2 className="text-xs font-black mb-4 flex items-center gap-2 text-red-500 uppercase tracking-tighter">
            <AlertCircle size={16} /> Overdue
          </h2>
          <div className="overflow-y-auto custom-scrollbar pr-2 flex-1">
            {(!data.overdue || data.overdue.length === 0) ? (
              <p className="text-[11px] font-medium text-gray-400">All clear!</p>
            ) : (
              <div className="space-y-2">
                {data.overdue.map(task => (
                  <div 
                    key={task.id} 
                    onClick={() => onTaskClick?.(task.id)}
                    className="block p-3 bg-gray-50 dark:bg-[#1e1f21] hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all border border-transparent hover:border-red-200 dark:hover:border-red-900/50 group cursor-pointer"
                  >
                    <h3 className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-red-600 transition-colors truncate">{task.title}</h3>
                    <p className="text-[10px] text-gray-400 mt-1">{new Date(task.due_date).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
