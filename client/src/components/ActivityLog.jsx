import React, { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import api from '../api/axios';

const ActivityLog = ({ projectId }) => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get(`/activity/project/${projectId}`);
        setLogs(res.data);
      } catch (error) {
        console.error('Failed to fetch activity logs', error);
      }
    };
    fetchLogs();
    
    // Polling or we can just fetch once for simplicity
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, [projectId]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 min-h-[500px] flex flex-col">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Activity size={18} /> Activity Log
      </h2>
      <div className="overflow-y-auto flex-grow space-y-3 pr-2">
        {logs.map(log => (
          <div key={log.id} className="text-sm">
            <div className="font-medium text-gray-800 dark:text-gray-200">{log.user_name}</div>
            <div className="text-gray-600 dark:text-gray-400">{log.action}</div>
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {new Date(log.created_at).toLocaleString()}
            </div>
          </div>
        ))}
        {logs.length === 0 && (
          <p className="text-sm text-gray-500">No activity yet.</p>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
