import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { BarChart3, PieChart, TrendingUp, Folder, CheckCircle, Clock } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart as RePie, Pie, Cell, LineChart, Line
} from 'recharts';

const Reporting = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [summaryRes, tasksRes] = await Promise.all([
          api.get('/projects/summary'),
          api.get('/tasks/me')
        ]);
        setData({
          summary: summaryRes.data,
          tasks: tasksRes.data
        });
      } catch (error) {
        console.error('Error fetching reporting data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-8 text-center font-bold">Generating reports...</div>;

  const summary = data?.summary || { total_projects: 0, total_tasks: 0, completed_tasks: 0, distribution: [] };
  const completionRate = summary.total_tasks === 0 ? 0 : Math.round((summary.completed_tasks / summary.total_tasks) * 100);

  const COLORS = ['#3b82f6', '#818cf8', '#a78bfa', '#f472b6', '#fb7185', '#fb923c', '#fbbf24', '#4ade80'];

  const chartData = (summary.distribution || []).map((d, index) => ({
    name: d.status,
    value: parseInt(d.count) || 0,
    color: COLORS[index % COLORS.length]
  })).filter(d => d.value > 0);

  // Fallback if no tasks
  if (chartData.length === 0) {
    chartData.push({ name: 'No Tasks', value: 1, color: '#374151' });
  }

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-12 pb-20 animate-in fade-in duration-700">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <BarChart3 className="text-blue-600" size={32} />
            Insights & Reporting
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Visual breakdown of your workspace performance.</p>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-[#1e1f21] p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Projects</p>
          <h3 className="text-4xl font-black text-gray-900 dark:text-white">{summary.total_projects}</h3>
        </div>
        <div className="bg-white dark:bg-[#1e1f21] p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Tasks</p>
          <h3 className="text-4xl font-black text-gray-900 dark:text-white">{summary.total_tasks}</h3>
        </div>
        <div className="bg-white dark:bg-[#1e1f21] p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Completion</p>
          <h3 className="text-4xl font-black text-green-500">{completionRate}%</h3>
        </div>
        <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-500/20">
          <p className="text-[11px] font-black text-blue-200 uppercase tracking-widest mb-2">Workspace Health</p>
          <h3 className="text-4xl font-black">{completionRate > 70 ? 'Good' : 'At Risk'}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Task Breakdown */}
        <section className="bg-white dark:bg-[#1e1f21] p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-8 flex items-center gap-2">
            <PieChart size={18} className="text-blue-600" /> Task Status Distribution
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RePie>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
              </RePie>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-8 mt-4">
            {chartData.map(d => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </section>

        {/* Priorities Section */}
        <section className="bg-white dark:bg-[#1e1f21] p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-8 flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-600" /> Productivity Overview
          </h2>
          <div className="space-y-6">
            <div className="p-6 bg-gray-50 dark:bg-[#2b2d30] rounded-3xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-black text-gray-400 uppercase">Focus Score</span>
                <span className="text-xs font-black text-blue-600">82/100</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 w-[82%]" />
              </div>
            </div>
            <div className="p-6 bg-gray-50 dark:bg-[#2b2d30] rounded-3xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-black text-gray-400 uppercase">Efficiency</span>
                <span className="text-xs font-black text-indigo-600">94%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 w-[94%]" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Reporting;
