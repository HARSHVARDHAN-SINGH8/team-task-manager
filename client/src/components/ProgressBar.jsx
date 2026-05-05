import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const ProgressBar = ({ projectId, tasks }) => {
  const [progress, setProgress] = useState({ total: 0, done: 0, percentage: 0 });

  useEffect(() => {
    // calculate from tasks prop directly for faster update
    if (tasks) {
      const total = tasks.length;
      const done = tasks.filter(t => t.is_completed).length;
      const percentage = total === 0 ? 0 : Math.round((done / total) * 100);
      setProgress({ total, done, percentage });
    }
  }, [tasks]);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center text-sm mb-1 text-gray-600 dark:text-gray-400">
        <span>Progress ({progress.done}/{progress.total} tasks)</span>
        <span className="font-medium">{progress.percentage}%</span>
      </div>
      <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-500 transition-all duration-500 ease-out"
          style={{ width: `${progress.percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
